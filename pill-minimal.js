let mediaRecorder;
let audioContext;
let analyser;
let dataArray;
let animationId;
let startTime;
let isRecording = false;
let isSliding = false;
let shouldStayVisible = false;
let micStream = null;
let isProcessing = false;
let recordingDebounce = false;

const pill = document.getElementById('pill');
const statusIcon = document.getElementById('status-icon');
const pillCanvas = document.getElementById('pill-waveform');
const pillCtx = pillCanvas.getContext('2d');
const contextMenu = document.getElementById('context-menu');

// Setup canvas
const pillWidth = 60;
const pillHeight = 18;


// Event listeners
window.electronAPI.onStartRecording(() => {
    // Prevent duplicate start commands
    if (isRecording || isProcessing || recordingDebounce) {
        console.log('Ignoring start command: already recording or processing');
        return;
    }

    recordingDebounce = true;
    setTimeout(() => { recordingDebounce = false; }, 300);

    shouldStayVisible = true;
    if (!pill.classList.contains('slide-in')) {
        showPillWithAnimation();
    }

    // Clear any existing state classes first
    pill.classList.remove('recording', 'processing');

    // Show connecting state immediately
    pill.classList.add('connecting');
    updateStatusIcon('connecting');

    // Start recording immediately
    startRecording();
});

window.electronAPI.onStopRecording(() => {
    // Prevent duplicate stop commands
    if (!isRecording || recordingDebounce) {
        console.log('Ignoring stop command: not recording or debounce active');
        return;
    }

    recordingDebounce = true;
    setTimeout(() => { recordingDebounce = false; }, 300);

    shouldStayVisible = false;
    stopRecording();
});

// Context menu functionality
pill.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    showContextMenu(e.clientX, e.clientY);
});

pill.addEventListener('dblclick', () => {
    window.electronAPI.showMainWindow();
});

// Single click to toggle pill persistence
pill.addEventListener('click', (e) => {
    if (e.detail === 1) { // Single click only
        setTimeout(() => {
            if (e.detail === 1) { // Confirm it wasn't part of a double click
                shouldStayVisible = !shouldStayVisible;
                // Visual feedback - could add a brief highlight or something
                if (shouldStayVisible) {
                    pill.style.boxShadow = '0 0 10px rgba(59, 130, 246, 0.5)';
                    setTimeout(() => {
                        pill.style.boxShadow = '';
                    }, 500);
                }
            }
        }, 250);
    }
});

// Hide context menu when clicking elsewhere
document.addEventListener('click', () => {
    hideContextMenu();
});

document.getElementById('show-window').addEventListener('click', () => {
    window.electronAPI.showMainWindow();
    hideContextMenu();
});

document.getElementById('toggle-recording').addEventListener('click', () => {
    if (isRecording) {
        window.electronAPI.stopRecording();
    } else {
        window.electronAPI.startRecording();
    }
    hideContextMenu();
});


function showContextMenu(x, y) {
    const toggleItem = document.getElementById('toggle-recording');
    toggleItem.textContent = isRecording ? 'Stop Recording' : 'Start Recording';

    contextMenu.style.left = `${x}px`;
    contextMenu.style.top = `${y}px`;
    contextMenu.style.display = 'block';
}

function hideContextMenu() {
    contextMenu.style.display = 'none';
}

async function startRecording() {
    // Prevent starting if already recording
    if (isRecording) {
        console.log('Already recording, ignoring start request');
        return;
    }

    try {
        // Request microphone access with optimized constraints
        micStream = await navigator.mediaDevices.getUserMedia({
            audio: {
                channelCount: 1,
                sampleRate: 16000,
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: false,
                latency: 0
            }
        });

        // Setup audio analysis
        audioContext = new AudioContext();

        // Ensure AudioContext is running (required on some browsers/macOS)
        if (audioContext.state === 'suspended') {
            await audioContext.resume();
        }

        analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(micStream);
        source.connect(analyser);

        console.log('AudioContext state:', audioContext.state);
        console.log('Stream active:', micStream.active);
        console.log('Stream tracks:', micStream.getTracks().length);

        analyser.fftSize = 128;
        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);

        // Setup MediaRecorder with fallback mimeTypes for macOS
        let mimeType = 'audio/webm;codecs=opus';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'audio/mp4';
            if (!MediaRecorder.isTypeSupported(mimeType)) {
                mimeType = 'audio/wav';
                if (!MediaRecorder.isTypeSupported(mimeType)) {
                    mimeType = ''; // Use default
                }
            }
        }

        console.log('Using mimeType:', mimeType);

        mediaRecorder = new MediaRecorder(micStream, mimeType ? { mimeType } : {});

        const audioChunks = [];

        mediaRecorder.ondataavailable = (event) => {
            console.log('Audio data received, size:', event.data.size);
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
            const blobType = mimeType || 'audio/webm';
            const audioBlob = new Blob(audioChunks, { type: blobType });
            console.log('Created audio blob, size:', audioBlob.size, 'type:', blobType);
            await processAudio(audioBlob);

            // Clean up resources
            if (micStream) {
                micStream.getTracks().forEach(track => track.stop());
                micStream = null;
            }
            if (audioContext) {
                audioContext.close();
                audioContext = null;
            }
        };

        mediaRecorder.onerror = (event) => {
            console.error('MediaRecorder error:', event.error);
            showError('Recording error occurred');
            cleanupRecording();
        };

        mediaRecorder.start();
        isRecording = true;

        // Update UI - transition from connecting to recording
        pill.classList.remove('connecting', 'processing');
        pill.classList.add('recording');
        updateStatusIcon('recording');
        startWaveformAnimation();

    } catch (error) {
        console.error('Error starting recording:', error);

        // Clean up on error
        cleanupRecording();

        pill.classList.remove('connecting', 'recording', 'processing');

        const errorMessage = error.name === 'NotAllowedError'
            ? 'Microphone access denied'
            : 'Failed to start recording';
        showError(errorMessage);
    }
}

function cleanupRecording() {
    isRecording = false;
    isProcessing = false;

    if (micStream) {
        micStream.getTracks().forEach(track => track.stop());
        micStream = null;
    }
    if (audioContext) {
        audioContext.close();
        audioContext = null;
    }
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        mediaRecorder = null;
    }
}

function stopRecording() {
    if (!isRecording) {
        console.log('Not recording, ignoring stop request');
        return;
    }

    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        try {
            mediaRecorder.stop();
        } catch (error) {
            console.error('Error stopping media recorder:', error);
        }
    }

    isRecording = false;
    isProcessing = true;

    // Update UI to processing state
    pill.classList.remove('recording', 'connecting');
    pill.classList.add('processing');
    updateStatusIcon('processing');
    stopWaveformAnimation();
}

function updateStatusIcon(state) {
    let iconSvg = '';

    switch (state) {
        case 'connecting':
            iconSvg = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="8" cy="8" r="4" fill="currentColor"/>
            </svg>`;
            break;
        case 'recording':
            iconSvg = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="8" cy="8" r="6" fill="currentColor"/>
            </svg>`;
            break;
        case 'processing':
            iconSvg = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 2V4M8 12V14M14 8H12M4 8H2M12.2426 12.2426L10.8284 10.8284M5.17157 5.17157L3.75736 3.75736M12.2426 3.75736L10.8284 5.17157M5.17157 10.8284L3.75736 12.2426" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>`;
            break;
        default:
            iconSvg = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="8" cy="8" r="3" fill="currentColor"/>
            </svg>`;
    }

    statusIcon.innerHTML = iconSvg;
}

function startWaveformAnimation() {
    function animate() {
        if (analyser && isRecording) {
            analyser.getByteFrequencyData(dataArray);
            drawWaveform();
        }
        if (isRecording) {
            animationId = requestAnimationFrame(animate);
        }
    }
    animate();
}

function stopWaveformAnimation() {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    // Clear waveform
    pillCtx.clearRect(0, 0, pillWidth, pillHeight);
}

function drawWaveform() {
    pillCtx.clearRect(0, 0, pillWidth, pillHeight);

    // iPhone-style thick rounded bars
    const barCount = 6;
    const barWidth = 3;
    const barSpacing = 2;
    const totalWidth = (barCount * barWidth) + ((barCount - 1) * barSpacing);
    const startX = (pillWidth - totalWidth) / 2;

    for (let i = 0; i < barCount; i++) {
        // Use every nth data point for variety
        const dataIndex = Math.floor((i / barCount) * dataArray.length);
        const barHeight = Math.max(3, (dataArray[dataIndex] / 255) * pillHeight * 0.7);

        const x = startX + (i * (barWidth + barSpacing));
        const y = (pillHeight - barHeight) / 2;

        // Draw rounded rectangle (capsule shape)
        pillCtx.fillStyle = 'rgb(255, 255, 255)';
        pillCtx.beginPath();
        pillCtx.roundRect(x, y, barWidth, barHeight, barWidth / 2);
        pillCtx.fill();
    }
}

async function processAudio(audioBlob) {
    if (!isProcessing) {
        console.log('Processing flag not set, skipping');
        return;
    }

    try {
        const apiKey = await window.electronAPI.getApiKey();

        if (!apiKey) {
            showError('API key required');
            resetPill();
            return;
        }

        // Validate audio blob
        if (!audioBlob || audioBlob.size === 0) {
            showError('No audio recorded');
            resetPill();
            return;
        }

        const formData = new FormData();
        formData.append('file', audioBlob, 'recording.webm');
        formData.append('model', 'whisper-1');
        formData.append('response_format', 'text');

        // Add language if set
        const language = await window.electronAPI.getSetting('language');
        if (language) {
            formData.append('language', language);
        }

        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`
            },
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error');
            throw new Error(`API request failed (${response.status}): ${errorText}`);
        }

        const transcript = await response.text();

        if (transcript && transcript.trim()) {
            // Send transcript to main process
            await window.electronAPI.pasteText(transcript.trim());
            window.electronAPI.processingComplete(transcript.trim());
        } else {
            showError('No speech detected');
        }

        resetPill();

    } catch (error) {
        console.error('Error processing audio:', error);

        let errorMessage = 'Transcription failed';
        if (error.message.includes('401')) {
            errorMessage = 'Invalid API key';
        } else if (error.message.includes('429')) {
            errorMessage = 'API rate limit exceeded';
        } else if (error.message.includes('Network')) {
            errorMessage = 'Network error';
        }

        showError(errorMessage);
        resetPill();
    }
}

function resetPill() {
    // Reset all state flags
    isRecording = false;
    isProcessing = false;

    pill.classList.remove('recording', 'processing', 'connecting');
    updateStatusIcon('ready');
    pillCtx.clearRect(0, 0, pillWidth, pillHeight);

    // Auto-hide pill after processing is complete with animation
    // But only if not recording and should not stay visible
    setTimeout(() => {
        if (!isRecording && !shouldStayVisible) {
            hidePillWithAnimation();
        }
    }, 1000);
}

function showPillWithAnimation() {
    isSliding = true;
    
    // Remove any existing animation classes
    pill.classList.remove('slide-out', 'slide-in');

    // Start with slide-in animation
    pill.classList.add('slide-in');
    
    // Mark sliding as complete after animation
    setTimeout(() => {
        isSliding = false;
    }, 300);
}

function hidePillWithAnimation() {
    // Don't hide if recording or should stay visible
    if (isRecording || shouldStayVisible) {
        return;
    }
    
    isSliding = true;
    
    // Remove slide-in and add slide-out
    pill.classList.remove('slide-in');
    pill.classList.add('slide-out');

    // Actually hide the window after animation completes
    setTimeout(() => {
        isSliding = false;
        if (!isRecording && !shouldStayVisible) {
            window.electronAPI.hidePill();
        }
    }, 300); // Match the CSS transition duration
}

function showError(message) {
    console.error(message);
    // Could show a brief error state in the pill
    setTimeout(() => {
        hidePillWithAnimation();
    }, 2000);
}