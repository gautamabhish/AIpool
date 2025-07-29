import React, { useState, useEffect, useRef } from 'react';
import './chat.css';
import { loadChats, saveChats } from './chatUtils';

const modelOptions = [
  "codellama",
  "starcoder",
  "codegen-small",
  "llama2-13b-chat",
  "mistral-7b",
  "gpt2",
  "bart-large-cnn",
  "t5-small",
  "blip2",
  "vit-gpt2"
];

export default function Chat() {
  const [selectedModel, setSelectedModel] = useState('');
  const [modelAddress, setModelAddress] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (selectedModel) {
      const saved = loadChats(selectedModel);
      if (saved) setMessages(saved);
    }
  }, [selectedModel]);

  useEffect(() => {
    if (selectedModel) {
      saveChats(selectedModel, messages);
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, selectedModel]);

  const handleModelSelect = async (e) => {
    const model = e.target.value;
    setSelectedModel(model);
    setMessages([]);
    setInput('');
    setLoading(true);

    try {
      const addr = await window.dht.findModelNode(model);
      if (addr) {
        setModelAddress(addr);
        setMessages([{ role: 'system', content: `✅ Model "${model}" found at ${addr}. You can start chatting.` }]);
      } else {
        setModelAddress(null);
        setMessages([{ role: 'system', content: `⚠️ Model "${model}" is currently offline.` }]);
      }
    } catch (err) {
      console.error(err);
      setModelAddress(null);
      setMessages([{ role: 'system', content: `❌ Failed to check model availability.` }]);
    }

    setLoading(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || !modelAddress) return;

    const userMessage = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    try {
      const res = await fetch(`${modelAddress}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMessage.content }),
      });

      const data = await res.json();
      const botMessage = { role: 'assistant', content: data.response };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '❌ Failed to reach model.' },
      ]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <label>Select a model: </label>
        <select value={selectedModel} onChange={handleModelSelect} disabled={loading}>
          <option value="">-- Choose a model --</option>
          {modelOptions.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      <div className="chat-history">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            {msg.content}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="chat-input-box">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            selectedModel
              ? modelAddress
                ? "Type your message..."
                : "Model not available."
              : "Please select a model."
          }
          disabled={!modelAddress}
        />
        <button onClick={sendMessage} disabled={!input.trim() || !modelAddress}>
          Send
        </button>
      </div>
    </div>
  );
}
