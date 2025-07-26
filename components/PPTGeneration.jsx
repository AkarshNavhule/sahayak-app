'use client';

import React, { useState } from 'react';

export default function PPTGeneration({ onClose }) {
  const [topic, setTopic] = useState('');
  const [pptLink, setPptLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setIsLoading(true);
    setError('');
    setPptLink('');
    try {
      const res = await fetch('http://localhost:8000/generate_ppt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      if (res.ok) {
        setPptLink(data.ppt_url || '');
      } else {
        setError(data?.detail || 'Failed to generate PPT');
      }
    } catch (e) {
      setError("Server error");
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-lg font-bold">Generate PPT for Topic</h1>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
          <svg className="w-5 h-5" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md">
          <input
            className="w-full p-3 border rounded mb-4"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="Enter topic (e.g., Photosynthesis)"
            disabled={isLoading}
          />
          <button
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            onClick={handleGenerate}
            disabled={!topic.trim() || isLoading}
          >
            {isLoading ? 'Generating...' : 'Generate PPT'}
          </button>
          {pptLink && (
            <div className="mt-4">
              <a href={pptLink} target="_blank" className="text-blue-700 underline">Download/View PPT</a>
            </div>
          )}
          {error && (
            <div className="mt-2 text-red-600">{error}</div>
          )}
        </div>
      </div>
    </div>
  );
}
