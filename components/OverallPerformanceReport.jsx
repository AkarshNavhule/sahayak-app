'use client';

import React, { useState, useEffect } from 'react';

export default function OverallPerformanceReport({ onClose, username }) {
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await fetch(`http://localhost:8000/student_report?username=${encodeURIComponent(username)}`);
        if (res.ok) {
          const data = await res.json();
          setReport(data);
        } else {
          setError("Failed to load report");
        }
      } catch (e) {
        setError("Server error");
      }
      setIsLoading(false);
    }
    fetchReport();
  }, [username]);

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-lg font-bold">Overall Performance Report</h1>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
          <svg className="w-5 h-5" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading && <div className="text-gray-500">Loading...</div>}
        {error && <div className="text-red-600">{error}</div>}
        {report &&
          <div>
            {/* Render/report formatting as you wish */}
            <div className="text-xl mb-2 font-semibold">{report.name}</div>
            <div className="mb-4">Class: <span className="font-medium">{report.class}</span></div>
            <div className="mb-4">Rank: <span className="font-medium">{report.rank}</span></div>
            <div className="mb-4">Avg. Score: <span className="font-medium">{report.average_score}%</span></div>
            {/* Per Subject */}
            <div className="mb-2 font-medium">Subjects:</div>
            <ul className="pl-4 space-y-1">
              {report.subjects.map(sub => (
                <li key={sub.subject} className="flex justify-between border-b py-1">
                  <span>{sub.subject}</span>
                  <span className="font-semibold">{sub.score}%</span>
                </li>
              ))}
            </ul>
            {/* Remarks or improvements */}
            <div className="mt-4">
              <div className="font-medium mb-1">Remarks</div>
              <div className="bg-gray-100 p-3 rounded">{report.remarks || 'No remarks'}</div>
            </div>
          </div>
        }
      </div>
    </div>
  );
}
