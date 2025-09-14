let mediaRecorder;
let audioContext;
let analyser;
let dataArray;
let animationId;
let startTime;
let isRecording = false;
let isSliding = false;
let shouldStayVisible = false;

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
    shouldStayVisible = true;
    if (!pill.classList.contains('slide-in')) {
        showPillWithAnimation();
    }
    // Small delay to ensure pill is visible before starting recording
    setTimeout(() => {
        startRecording();
    }, 100);
});

window.electronAPI.onStopRecording(() => {
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
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                channelCount: 1,
                sampleRate: 16000,
                echoCancellation: true,
                noiseSuppression: true
            }
        });

        // Setup audio analysis
        audioContext = new AudioContext();
        analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        analyser.fftSize = 128; // Smaller for iPhone-style bars
        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);

        // Setup MediaRecorder
        mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'audio/webm;codecs=opus'
        });

        const audioChunks = [];

        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            await processAudio(audioBlob);

            // Cleanup
            stream.getTracks().forEach(track => track.stop());
            if (audioContext) {
                audioContext.close();
            }
        };

        mediaRecorder.start();
        isRecording = true;

        // Update UI
        pill.classList.add('recording');
        updateStatusIcon('recording');
        startWaveformAnimation();

    } catch (error) {
        console.error('Error starting recording:', error);
        showError('Microphone access denied');
    }
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
    }

    isRecording = false;

    // Update UI to processing state
    pill.classList.remove('recording');
    pill.classList.add('processing');
    updateStatusIcon('processing');
    stopWaveformAnimation();
}

function updateStatusIcon(state) {
    let iconSvg = '';

    switch (state) {
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
        pillCtx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        pillCtx.beginPath();
        pillCtx.roundRect(x, y, barWidth, barHeight, barWidth / 2);
        pillCtx.fill();
    }
}

async function processAudio(audioBlob) {
    try {
        const apiKey = await window.electronAPI.getApiKey();

        if (!apiKey) {
            showError('API key required');
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
            throw new Error(`API request failed: ${response.status}`);
        }

        const transcript = await response.text();

        if (transcript.trim()) {
            // Send transcript to main process
            await window.electronAPI.pasteText(transcript.trim());
            window.electronAPI.processingComplete(transcript.trim());
        }

        resetPill();

    } catch (error) {
        console.error('Error processing audio:', error);
        showError('Transcription failed');
        resetPill();
    }
}

function resetPill() {
    pill.classList.remove('recording', 'processing');
    updateStatusIcon('ready');
    pillCtx.clearRect(0, 0, pillWidth, pillHeight);

    // Auto-hide pill after processing is complete with animation
    // But only if not recording and should not stay visible
    setTimeout(() => {
        if (!isRecording && !shouldStayVisible) {
            hidePillWithAnimation();
        }
    }, 2000);
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