'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchMessage = async () => {
      const response = await fetch('/api/endpoints');
      const data = await response.json();
      setMessage(data.tests[0].name);
    };

    fetchMessage();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold bg-pink-700">{message}</h1>
    </div>
  );
}
