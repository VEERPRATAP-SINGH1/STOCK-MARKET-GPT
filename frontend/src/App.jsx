// App.jsx
import React, { useState } from 'react';
import axios from 'axios';

const App = () => {
  const [ticker, setTicker] = useState('GOOGL');
  const [summary, setSummary] = useState('');
  const [transcription, setTranscription] = useState('');
  const [textToSpeak, setTextToSpeak] = useState('');

  const fetchSummary = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/summary?ticker=${ticker}`);
      setSummary(res.data.summary);
    } catch (err) {
      setSummary('Error fetching summary.');
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('http://localhost:8000/transcribe', formData);
      setTranscription(res.data.transcription);
    } catch (err) {
      setTranscription('Error transcribing audio.');
    }
  };

  const handleSpeak = async () => {
    try {
      await axios.post(`http://localhost:8000/speak?text=${textToSpeak}`);
      alert('Text spoken successfully.');
    } catch (err) {
      alert('Error speaking text.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 font-sans">
      <h1 className="text-4xl font-bold mb-6 text-center">📈 Finance Assistant Dashboard</h1>

      <div className="space-y-8 max-w-3xl mx-auto">
        <div className="bg-gray-800 p-4 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-2">1️⃣ Market Summary</h2>
          <input
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            className="bg-gray-700 p-2 w-full rounded mb-2"
            placeholder="Enter Stock Ticker (e.g., GOOGL)"
          />
          <button
            onClick={fetchSummary}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
          >
            Get Summary
          </button>
          {summary && <p className="mt-4 whitespace-pre-wrap">{summary}</p>}
        </div>

        <div className="bg-gray-800 p-4 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-2">2️⃣ Transcribe Audio</h2>
          <input type="file" onChange={handleFileChange} className="mb-2" />
          {transcription && <p className="mt-2 whitespace-pre-wrap">📝 {transcription}</p>}
        </div>

        <div className="bg-gray-800 p-4 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-2">3️⃣ Text to Speech</h2>
          <input
            type="text"
            value={textToSpeak}
            onChange={(e) => setTextToSpeak(e.target.value)}
            className="bg-gray-700 p-2 w-full rounded mb-2"
            placeholder="Enter text to speak"
          />
          <button
            onClick={handleSpeak}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
          >
            Speak
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
