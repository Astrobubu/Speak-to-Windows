let mediaRecorder;
let audioContext;
let analyser;
let dataArray;
let animationId;
let isRecording = false;
let startTime;
let timerInterval;

// DOM elements
const recordBtn = document.getElementById('record-btn');
const recordIcon = document.querySelector('.record-icon');
const recordText = document.querySelector('.record-text');
const statusText = document.getElementById('status-text');
const recordingTimer = document.getElementById('recording-timer');
const waveformContainer = document.getElementById('waveform-main');
const waveformCanvas = document.getElementById('waveform-canvas');
const waveformCtx = waveformCanvas.getContext('2d');

const apiKeyInput = document.getElementById('api-key');
const saveKeyBtn = document.getElementById('save-key');
const autoPasteCheckbox = document.getElementById('auto-paste');

const transcriptArea = document.getElementById('transcript-area');
const copyBtn = document.getElementById('copy-btn');
const clearBtn = document.getElementById('clear-btn');

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await loadSettings();
    setupEventListeners();
});

async function loadSettings() {
    try {
        const apiKey = await window.electronAPI.getApiKey();
        const autoPaste = await window.electronAPI.getAutoPaste();

        if (apiKey) {
            apiKeyInput.value = apiKey;
        }
        autoPasteCheckbox.checked = autoPaste;
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

function setupEventListeners() {
    // Recording button
    recordBtn.addEventListener('click', toggleRecording);

    // Settings
    saveKeyBtn.addEventListener('click', saveApiKey);
    autoPasteCheckbox.addEventListener('change', saveAutoPasteSetting);

    // Transcript actions
    copyBtn.addEventListener('click', copyTranscript);
    clearBtn.addEventListener('click', clearTranscript);

    // Electron events
    window.electronAPI.onRecordingStarted(() => {
        updateRecordingUI(true);
    });

    window.electronAPI.onRecordingStopped(() => {
        updateRecordingUI(false);
    });

    window.electronAPI.onTranscriptReady((event, transcript) => {
        displayTranscript(transcript);
    });
}

async function saveApiKey() {
    const apiKey = apiKeyInput.value.trim();
    if (apiKey) {
        await window.electronAPI.setApiKey(apiKey);
        showStatus('API key saved successfully', 'success');
    } else {
        showStatus('Please enter a valid API key', 'error');
    }
}

async function saveAutoPasteSetting() {
    await window.electronAPI.setAutoPaste(autoPasteCheckbox.checked);
    showStatus('Auto-paste setting saved', 'success');
}

async function toggleRecording() {
    if (isRecording) {
        stopRecording();
        window.electronAPI.stopRecording();
    } else {
        const hasApiKey = await checkApiKey();
        if (hasApiKey) {
            startRecording();
            window.electronAPI.startRecording();
        }
    }
}

async function checkApiKey() {
    const apiKey = await window.electronAPI.getApiKey();
    if (!apiKey) {
        showStatus('Please set your OpenAI API key first', 'error');
        apiKeyInput.focus();
        return false;
    }
    return true;
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

        // Setup audio analysis for waveform
        audioContext = new AudioContext();
        analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);

        isRecording = true;
        updateRecordingUI(true);
        startTimer();
        startWaveformAnimation();

    } catch (error) {
        console.error('Error starting recording:', error);
        showStatus('Failed to start recording. Please check microphone permissions.', 'error');
    }
}

function stopRecording() {
    isRecording = false;
    updateRecordingUI(false);
    stopTimer();
    stopWaveformAnimation();

    if (audioContext) {
        audioContext.close();
    }

    showStatus('Processing audio...', 'processing');
}

function updateRecordingUI(recording) {
    if (recording) {
        recordBtn.classList.add('recording');
        recordIcon.textContent = '⏹';
        recordText.textContent = 'Stop Recording';
        statusText.textContent = 'Recording...';
        waveformContainer.style.display = 'block';
    } else {
        recordBtn.classList.remove('recording');
        recordIcon.textContent = '⏺';
        recordText.textContent = 'Start Recording';
        statusText.textContent = 'Processing...';
        waveformContainer.style.display = 'none';
    }
}

function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        recordingTimer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    recordingTimer.textContent = '00:00';
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
    waveformCtx.clearRect(0, 0, waveformCanvas.width, waveformCanvas.height);
}

function drawWaveform() {
    const width = waveformCanvas.width;
    const height = waveformCanvas.height;

    waveformCtx.clearRect(0, 0, width, height);

    const barWidth = width / dataArray.length;
    let x = 0;

    // Create gradient
    const gradient = waveformCtx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#3b82f6');
    gradient.addColorStop(1, '#1e40af');

    waveformCtx.fillStyle = gradient;

    for (let i = 0; i < dataArray.length; i++) {
        const barHeight = (dataArray[i] / 255) * height * 0.8;
        const y = (height - barHeight) / 2;

        waveformCtx.fillRect(x, y, barWidth - 1, barHeight);
        x += barWidth;
    }
}

function displayTranscript(transcript) {
    const placeholder = transcriptArea.querySelector('.placeholder');
    if (placeholder) {
        placeholder.remove();
    }

    const transcriptElement = document.createElement('div');
    transcriptElement.className = 'transcript-text';
    transcriptElement.textContent = transcript;

    transcriptArea.appendChild(transcriptElement);

    // Enable action buttons
    copyBtn.disabled = false;
    clearBtn.disabled = false;

    showStatus('Transcription complete!', 'success');
}

async function copyTranscript() {
    const transcriptTexts = Array.from(transcriptArea.querySelectorAll('.transcript-text'))
        .map(el => el.textContent)
        .join('\n\n');

    if (transcriptTexts) {
        await window.electronAPI.copyToClipboard(transcriptTexts);
        showStatus('Transcript copied to clipboard', 'success');
    }
}

function clearTranscript() {
    transcriptArea.innerHTML = '<div class="placeholder">Your transcription will appear here...</div>';
    copyBtn.disabled = true;
    clearBtn.disabled = true;
    showStatus('Transcript cleared', 'info');
}

function showStatus(message, type = 'info') {
    statusText.textContent = message;
    statusText.className = `status-${type}`;

    if (type === 'success' || type === 'error') {
        setTimeout(() => {
            if (!isRecording) {
                statusText.textContent = 'Ready';
                statusText.className = '';
            }
        }, 3000);
    }
}