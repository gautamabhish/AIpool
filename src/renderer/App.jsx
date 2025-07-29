import React, { useState, useEffect } from 'react';
import './app.css';
import { Cpu, MemoryStick } from 'lucide-react';
import Chat from './Chat';
import os from 'os';
import { networkInterfaces } from 'os';

function getLocalIP() {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return '127.0.0.1';
}

export default function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [selectedModel, setSelectedModel] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [serverStarted, setServerStarted] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const response = await window.api.suggestModels();
        setData(response);
      } catch (err) {
        setError('Could not load model info');
      }
    })();
  }, []);

  const handleModelSelect = (e) => {
    setSelectedModel(e.target.value);
  };
const handleStart = async () => {
  try {
    const [type, modelName] = selectedModel.split(':');
    const localIP = getLocalIP();
    const port = 5000; // Or dynamically assign if you're running multiple models

    // 1. Start DHT node first
    await window.dht.startNode();
    console.log('DHT node started');

    // 2. Start model server
    await window.api.startModel(modelName);
    console.log(`Model server for ${modelName} started on ${localIP}:${port}`);

    // 3. Register model in DHT
    const modelAddress = `http://${localIP}:${port}`;
    await window.dht.registerModel(modelName, modelAddress);
    console.log(`Model ${modelName} registered at ${modelAddress}`);

    // 4. UI state updates
    setServerStarted(true);
    setChatHistory([]);
  } catch (err) {
    setError('Failed to start model server');
    console.error(err);
  }

  setSelectedModel('');
  setAgreed(false);
};


  if (error)
    return <div className="container"><h1 className="title">AI POOL</h1><p>{error}</p></div>;

  if (!data)
    return <div className="container"><h1 className="title">AI POOL</h1><p>Loading...</p></div>;

  if (serverStarted) {
    return (
      <Chat
        model={selectedModel}
        chatHistory={chatHistory}
        setChatHistory={setChatHistory}
      />
    );
  }

  const { ram, cores, suggestions, available } = data;

  return (
    <div className="container">
      <div>
        <h1 className="title">AI POOL</h1>
        <div className="info">
          <p><Cpu size={20} /> Total CPU Cores: <strong>{cores}</strong> | Available: <strong>{available.cores}</strong></p>
          <p><MemoryStick size={20} /> Total RAM: <strong>{ram} GB</strong> | Available: <strong>{available.ram} GB</strong></p>
        </div>

        <select className="dropdown" onChange={handleModelSelect} disabled={!!selectedModel}>
          <option value="" disabled selected>Select a Model</option>
          {Object.entries(suggestions).flatMap(([type, models]) =>
            models.map(m => (
              <option key={m.name} value={`${type}:${m.name}`}>{`${m.name} - ${m.desc}`}</option>
            ))
          )}
        </select>

        <label>
          <input type="checkbox" checked={agreed} onChange={() => setAgreed(!agreed)} />
          I agree to host a model and contribute uptime.
        </label>

        <p className="disclaimer">Disclaimer: Try to host a model that is not useful to you.</p>

        <button disabled={!selectedModel || !agreed} className="button" onClick={handleStart}>
          Start Model Server
        </button>
      </div>
    </div>
  );
}
