/**
 * Web Audio API Recorder producing 16kHz mono 16-bit PCM WAV blobs
 * optimized directly for local Whisper.cpp / whisper-cli.exe input.
 */
export class AudioRecorder {
  constructor() {
    this.audioContext = null;
    this.mediaStream = null;
    this.processor = null;
    this.pcmBuffers = [];
    this.recording = false;
  }

  async start() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Microphone access is not supported by your browser.');
    }

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true
        }
      });

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioCtx({ sampleRate: 16000 });

      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      // Create ScriptProcessorNode with buffer size 4096, 1 input channel, 1 output channel
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
      
      this.pcmBuffers = [];
      this.recording = true;

      this.processor.onaudioprocess = (e) => {
        if (!this.recording) return;
        const inputData = e.inputBuffer.getChannelData(0);
        // Copy Float32Array channel data
        this.pcmBuffers.push(new Float32Array(inputData));
      };

      source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        throw new Error('Microphone permission denied. Please allow microphone access in your browser settings.');
      }
      throw new Error(`Microphone initialization error: ${err.message}`);
    }
  }

  stop() {
    return new Promise((resolve, reject) => {
      this.recording = false;

      if (this.processor && this.audioContext) {
        this.processor.disconnect();
      }

      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach(track => track.stop());
      }

      try {
        // Flatten Float32Array PCM buffers
        let totalSamples = 0;
        for (const buf of this.pcmBuffers) {
          totalSamples += buf.length;
        }

        const mergedSamples = new Float32Array(totalSamples);
        let offset = 0;
        for (const buf of this.pcmBuffers) {
          mergedSamples.set(buf, offset);
          offset += buf.length;
        }

        // Encode 16kHz Mono 16-bit PCM WAV
        const wavBuffer = encodeWAV(mergedSamples, 16000);
        const wavBlob = new Blob([wavBuffer], { type: 'audio/wav' });

        if (this.audioContext && this.audioContext.state !== 'closed') {
          this.audioContext.close();
        }

        resolve(wavBlob);
      } catch (err) {
        reject(new Error(`Failed to encode WAV audio: ${err.message}`));
      }
    });
  }
}

/**
 * Encodes Float32Array PCM samples into a 16-bit Mono PCM WAV ArrayBuffer.
 */
function encodeWAV(samples, sampleRate = 16000) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  /* RIFF identifier */
  writeString(view, 0, 'RIFF');
  /* RIFF chunk length */
  view.setUint32(4, 36 + samples.length * 2, true);
  /* RIFF type */
  writeString(view, 8, 'WAVE');
  /* format chunk identifier */
  writeString(view, 12, 'fmt ');
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw PCM = 1) */
  view.setUint16(20, 1, true);
  /* channel count (mono = 1) */
  view.setUint16(22, 1, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sampleRate * 2) */
  view.setUint32(28, sampleRate * 2, true);
  /* block align (mono 16-bit = 2) */
  view.setUint16(32, 2, true);
  /* bits per sample */
  view.setUint16(34, 16, true);
  /* data chunk identifier */
  writeString(view, 36, 'data');
  /* data chunk length */
  view.setUint32(40, samples.length * 2, true);

  // Write 16-bit PCM samples
  let index = 44;
  for (let i = 0; i < samples.length; i++) {
    let s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(index, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    index += 2;
  }

  return buffer;
}

function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
