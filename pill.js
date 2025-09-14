let mediaRecorder;
let audioContext;
let analyser;
let dataArray;
let animationId;
let startTime;
let timerInterval;

const pill = document.getElementById('pill');
const statusIcon = document.getElementById('status-icon');
const pillTimer = document.getElementById('pill-timer');
const pillCanvas = document.getElementById('pill-waveform');
const pillCtx = pillCanvas.getContext('2d');
const closeBtn = document.getElementById('close-btn');

// Setup canvas
const pillWidth = pillCanvas.width;
const pillHeight = pillCanvas.height;

// Event listeners
window.electronAPI.onStartRecording(() => {
    startRecording();
});

window.electronAPI.onStopRecording(() => {
    stopRecording();
});

closeBtn.addEventListener('click', () => {
    window.electronAPI.hidePill();
});

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

        analyser.fftSize = 256;
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

        // Update UI
        pill.classList.add('recording');
        statusIcon.textContent = '⏺';
        startTime = Date.now();

        startTimer();
        startWaveformAnimation();

    } catch (error) {
        console.error('Error starting recording:', error);
        showError('Failed to start recording. Please check microphone permissions.');
    }
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
    }

    // Update UI to processing state
    pill.classList.remove('recording');
    pill.classList.add('processing');
    statusIcon.textContent = '⏳';

    stopTimer();
    stopWaveformAnimation();
}

function startTimer() {
    timerInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        pillTimer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
    }
}

function startWaveformAnimation() {
    function animate() {
        if (analyser) {
            analyser.getByteFrequencyData(dataArray);
            drawWaveform();
        }
        animationId = requestAnimationFrame(animate);
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

    const barWidth = pillWidth / dataArray.length;
    let x = 0;

    // Create gradient
    const gradient = pillCtx.createLinearGradient(0, 0, 0, pillHeight);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.3)');

    pillCtx.fillStyle = gradient;

    for (let i = 0; i < dataArray.length; i += 2) { // Skip every other for performance
        const barHeight = (dataArray[i] / 255) * pillHeight * 0.8;
        const y = (pillHeight - barHeight) / 2;

        pillCtx.fillRect(x, y, barWidth * 1.5, barHeight);
        x += barWidth * 2;
    }
}

async function processAudio(audioBlob) {
    try {
        const apiKey = await window.electronAPI.getApiKey();

        if (!apiKey) {
            showError('Please set your OpenAI API key in settings');
            resetPill();
            return;
        }

        const formData = new FormData();
        formData.append('file', audioBlob, 'recording.webm');
        formData.append('model', 'whisper-1');
        formData.append('response_format', 'text');

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
            // Send transcript to main process for pasting
            await window.electronAPI.pasteText(transcript.trim());
            window.electronAPI.processingComplete(transcript.trim());
        }

        resetPill();

    } catch (error) {
        console.error('Error processing audio:', error);
        showError('Failed to transcribe audio. Please check your API key and try again.');
        resetPill();
    }
}

function resetPill() {
    pill.classList.remove('recording', 'processing');
    statusIcon.textContent = '⏹';
    pillTimer.textContent = '00:00';
    pillCtx.clearRect(0, 0, pillWidth, pillHeight);
}

function showError(message) {
    // Temporarily show error in timer area
    pillTimer.textContent = 'Error';
    pill.classList.add('processing'); // Use processing color for error
    setTimeout(() => {
        resetPill();
    }, 3000);
}