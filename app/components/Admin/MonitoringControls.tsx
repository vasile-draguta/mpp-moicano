'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function MonitoringControls() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<null | {
    success: boolean;
    usersMonitored?: number;
    error?: string;
  }>(null);
  const [timeWindow, setTimeWindow] = useState(5);
  const [threshold, setThreshold] = useState(20);

  const runMonitoringCheck = async () => {
    try {
      setIsLoading(true);
      setResult(null);

      const response = await fetch('/api/admin/monitor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timeWindowMinutes: timeWindow,
          threshold,
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Time Window (minutes)
          </label>
          <input
            type="number"
            min="1"
            max="60"
            value={timeWindow}
            onChange={(e) => setTimeWindow(Number(e.target.value))}
            className="p-2 border bg-[#2D2D2D] border-purple-300/20 rounded w-full text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-300/50"
          />
          <p className="mt-1 text-sm text-gray-400">
            Period of time to check for suspicious activity
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Action Threshold
          </label>
          <input
            type="number"
            min="5"
            max="1000"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="p-2 border bg-[#2D2D2D] border-purple-300/20 rounded w-full text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-300/50"
          />
          <p className="mt-1 text-sm text-gray-400">
            Number of actions that triggers monitoring
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button
          onClick={runMonitoringCheck}
          disabled={isLoading}
          className={`px-4 py-2 rounded ${
            isLoading
              ? 'bg-purple-600/50 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-700'
          } text-white`}
        >
          {isLoading ? 'Running Check...' : 'Run Monitoring Check'}
        </button>

        <Link
          href="/admin/monitored-users"
          className="text-purple-300 hover:text-purple-400"
        >
          View Monitored Users
        </Link>
      </div>

      {result && (
        <div
          className={`mt-4 p-4 rounded ${
            result.success
              ? 'bg-green-500/10 border border-green-500 text-green-300'
              : 'bg-red-500/10 border border-red-500 text-red-500'
          }`}
        >
          {result.success ? (
            <p>
              Monitoring check completed. {result.usersMonitored} user(s)
              flagged for monitoring.
            </p>
          ) : (
            <p>Error running monitoring check: {result.error}</p>
          )}
        </div>
      )}
    </div>
  );
}
