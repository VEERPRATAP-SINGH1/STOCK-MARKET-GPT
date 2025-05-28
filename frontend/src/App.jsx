import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const App = () => {
  const [ticker, setTicker] = useState('GOOGL');
  const [summary, setSummary] = useState('');
  const [transcription, setTranscription] = useState('');
  const [recording, setRecording] = useState(false);
  const [mediaStream, setMediaStream] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationRef = useRef(null);
  const canvasRef = useRef(null);

  const fetchSummary = async (customTicker) => {
    const targetTicker = customTicker || ticker;
    try {
      const res = await axios.get(`http://localhost:8000/summary?ticker=${targetTicker}`);
      setSummary(res.data.summary);
    } catch (err) {
      setSummary('❌ Error fetching summary.');
    }
  };

  const drawWaveform = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyserRef.current.getByteTimeDomainData(dataArray);

      ctx.fillStyle = '#1F2937';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#10B981';
      ctx.beginPath();

      const sliceWidth = (canvas.width * 1.0) / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    draw();
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMediaStream(stream);

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      source.connect(analyser);
      analyser.fftSize = 2048;
      analyserRef.current = analyser;
      audioContextRef.current = audioContext;

      drawWaveform();

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        cancelAnimationFrame(animationRef.current);
        audioContextRef.current.close();

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('file', audioBlob, 'recording.webm');

        try {
          const res = await axios.post('http://localhost:8000/transcribe', formData);
          const transcribedText = res.data.transcription.trim().toUpperCase();
          setTranscription(transcribedText);
          setTicker(transcribedText);
          fetchSummary(transcribedText);
        } catch (err) {
          setTranscription('❌ Error transcribing audio.');
        }

        stream.getTracks().forEach(track => track.stop());
        setMediaStream(null);
      };

      mediaRecorder.start();
      setRecording(true);

      // Auto-stop after 5 seconds
      setTimeout(() => {
        stopRecording();
      }, 5000);
    } catch (err) {
      alert('🎙️ Microphone access denied or not available.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-4xl font-bold text-center mb-8">📈 Finance Assistant Dashboard</h1>

      <div className="max-w-3xl mx-auto bg-gray-800 p-6 rounded-xl space-y-6 shadow-xl">
        <div>
          <h2 className="text-2xl font-semibold mb-2">1️⃣ Market Summary (Type or Speak)</h2>

          <input
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            className="bg-gray-700 p-3 w-full rounded text-white placeholder-gray-400 mb-2"
            placeholder="Enter Ticker (e.g., AAPL)"
          />

          <button
            onClick={() => fetchSummary()}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded mb-4"
          >
            Get Summary
          </button>

          <div className="space-y-3">
            <p>🎙️ Or speak the stock ticker:</p>

            {!recording ? (
              <button onClick={startRecording} className="bg-green-600 px-4 py-2 rounded">
                🎤 Start Recording (5s)
              </button>
            ) : (
              <button onClick={stopRecording} className="bg-red-600 px-4 py-2 rounded">
                ⏹ Stop
              </button>
            )}

            <canvas
              ref={canvasRef}
              width={400}
              height={100}
              className="bg-gray-700 rounded w-full"
            />
          </div>

          {transcription && (
            <p className="mt-4 text-green-400">
              📝 Detected Ticker: <strong>{transcription}</strong>
            </p>
          )}

          {summary && <p className="mt-4 whitespace-pre-wrap">{summary}</p>}
        </div>
      </div>
    </div>
  );
};

export default App;
