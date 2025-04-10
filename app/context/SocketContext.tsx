'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface Expense {
  id: number;
  title: string;
  amount: number;
  date: string;
  categoryId: number;
  category: { id: number; name: string };
  description: string;
}

interface CategoryData {
  categoryId: number;
  name: string;
  _sum: { amount: number };
}

interface MonthlyData {
  month: number;
  total: number;
}

interface ChartData {
  expensesByCategory: CategoryData[];
  expensesByMonth: MonthlyData[];
}

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  expenses: Expense[];
  chartData: ChartData;
  connectionError: string | null;
  lastEventTime: Date | null;
  isGenerating: boolean;
  startGeneration: () => void;
  stopGeneration: () => void;
}

const defaultContext: SocketContextType = {
  socket: null,
  connected: false,
  expenses: [],
  chartData: {
    expensesByCategory: [],
    expensesByMonth: [],
  },
  connectionError: null,
  lastEventTime: null,
  isGenerating: false,
  startGeneration: () => {},
  stopGeneration: () => {},
};

const SocketContext = createContext<SocketContextType>(defaultContext);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [chartData, setChartData] = useState<ChartData>({
    expensesByCategory: [],
    expensesByMonth: [],
  });
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [lastEventTime, setLastEventTime] = useState<Date | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Function to initialize connection
  const initConnection = async () => {
    if (socket) return; // Already initialized

    try {
      const response = await fetch('/api/socket');

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to start WebSocket server: ${errorText}`);
      }

      const socketUrl = 'http://localhost:3001';
      const socketInstance = io(socketUrl, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 5000,
      });

      socketInstance.on('connect', () => {
        setConnected(true);
        setConnectionError(null);

        socketInstance?.emit('ping', () => {
          setLastEventTime(new Date());
        });
      });

      socketInstance.on('connect_error', (err) => {
        setConnectionError(`Connection error: ${err.message}`);
        setConnected(false);
      });

      socketInstance.on('disconnect', () => {
        setConnected(false);
      });

      socketInstance.on('new-expense', (newExpense: Expense) => {
        setLastEventTime(new Date());
        setExpenses((prev) => [newExpense, ...prev]);
      });

      socketInstance.on('expenses-list', (expensesList: Expense[]) => {
        setLastEventTime(new Date());
        setExpenses(expensesList);
      });

      socketInstance.on('chart-data-update', (data: ChartData) => {
        setLastEventTime(new Date());
        setChartData(data);
      });

      // Listen for generation status updates
      socketInstance.on('generation-status', (status: { running: boolean }) => {
        setIsGenerating(status.running);
      });

      setSocket(socketInstance);
      return socketInstance;
    } catch (error) {
      setConnectionError(`Failed to connect: ${(error as Error).message}`);
      setConnected(false);
      return null;
    }
  };

  // Function to stop data generation
  const stopGeneration = () => {
    if (socket && connected) {
      socket.emit('stop-generation');
    }
  };

  // Function to start data generation
  const startGeneration = async () => {
    // Initialize connection first if not already connected
    let currentSocket = socket;
    if (!currentSocket) {
      const newSocket = await initConnection();
      if (!newSocket) return; // Connection failed
      currentSocket = newSocket;
    }

    if (currentSocket && connected) {
      currentSocket.emit('start-generation');
    } else if (currentSocket) {
      // If socket exists but not connected, wait for connection then emit
      const connectHandler = () => {
        if (currentSocket) {
          currentSocket.emit('start-generation');
          currentSocket.off('connect', connectHandler);
        }
      };
      currentSocket.on('connect', connectHandler);
    }
  };

  // Cleanup function for socket
  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        expenses,
        chartData,
        connectionError,
        lastEventTime,
        isGenerating,
        startGeneration,
        stopGeneration,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
