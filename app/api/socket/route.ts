import { Server } from 'socket.io';

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

const mockData: {
  expenses: Expense[];
  categories: string[];
  expensesByCategory: CategoryData[];
  expensesByMonth: MonthlyData[];
} = {
  expenses: [],
  categories: [
    'Food',
    'Transportation',
    'Entertainment',
    'Utilities',
    'Shopping',
  ],
  expensesByCategory: [],
  expensesByMonth: [],
};

const initializeMonthlyData = () => {
  const currentDate = new Date();
  const result = [];

  for (let i = 5; i >= 0; i--) {
    const month = new Date(currentDate);
    month.setMonth(currentDate.getMonth() - i);
    result.push({
      month: month.getMonth() + 1,
      total: Math.floor(Math.random() * 1000) + 500,
    });
  }

  return result;
};

const initializeCategoryData = () => {
  const result = mockData.categories.map((category, index) => ({
    categoryId: index + 1,
    name: category,
    _sum: { amount: Math.floor(Math.random() * 1000) + 200 },
  }));

  return result;
};

mockData.expensesByMonth = initializeMonthlyData();
mockData.expensesByCategory = initializeCategoryData();

let io: Server | null = null;
let isServerRunning = false;
let generationInterval: NodeJS.Timeout | null = null;

export async function GET() {
  console.log('Socket API route called');

  try {
    if (!io || !isServerRunning) {
      console.log('Creating new Socket.IO server');
      const { createServer } = await import('node:http');
      const { Server } = await import('socket.io');

      const httpServer = createServer();

      io = new Server(httpServer, {
        cors: {
          origin: '*',
          methods: ['GET', 'POST'],
        },
      });

      io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);

        try {
          console.log('Sending initial data to client');
          socket.emit('chart-data-update', {
            expensesByCategory: mockData.expensesByCategory,
            expensesByMonth: mockData.expensesByMonth,
          });

          socket.emit('expenses-list', mockData.expenses);

          socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
          });

          socket.on('ping', (callback) => {
            console.log('Received ping from client');
            if (typeof callback === 'function') {
              callback('pong');
            } else {
              socket.emit('pong');
            }
          });

          socket.on('stop-generation', () => {
            stopDataGeneration();
            socket.emit('generation-status', { running: false });
          });

          socket.on('start-generation', () => {
            startDataGenerationThread();
            socket.emit('generation-status', { running: true });
          });

          socket.emit('generation-status', { running: !!generationInterval });
        } catch (err) {
          console.error('Error handling socket connection:', err);
        }
      });

      const port = 3001;
      httpServer.listen(port, () => {
        console.log(`Socket.IO server running on port ${port}`);
        isServerRunning = true;
      });

      httpServer.on('error', (err) => {
        console.error('HTTP Server error:', err);
        isServerRunning = false;
      });
    } else {
      console.log('Socket.IO server already running');
    }

    return new Response('WebSocket server is running', {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch (error) {
    console.error('Error in Socket API route:', error);
    return new Response(
      'Error starting WebSocket server: ' + (error as Error).message,
      {
        status: 500,
        headers: {
          'Content-Type': 'text/plain',
        },
      },
    );
  }
}

export async function POST() {
  if (io && isServerRunning) {
    stopDataGeneration();
    io.emit('generation-status', { running: false });

    return new Response('WebSocket data generation stopped', {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }

  return new Response('WebSocket server not running', {
    status: 404,
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}

function generateRandomExpense() {
  const categoryId = Math.floor(Math.random() * mockData.categories.length);
  const category = mockData.categories[categoryId];
  const randomAmount = parseFloat((Math.random() * 100 + 10).toFixed(2));

  const newExpense = {
    id: Date.now(),
    title: `${category} Expense`,
    amount: randomAmount,
    date: new Date().toISOString(),
    categoryId: categoryId + 1,
    category: { id: categoryId + 1, name: category },
    description: `Auto-generated ${category.toLowerCase()} expense`,
  };

  mockData.expenses.unshift(newExpense);
  if (mockData.expenses.length > 20) {
    mockData.expenses.pop();
  }

  return newExpense;
}

function updateChartData(newExpense: Expense) {
  const categoryIndex = mockData.expensesByCategory.findIndex(
    (item) => item.categoryId === newExpense.categoryId,
  );

  if (categoryIndex !== -1) {
    mockData.expensesByCategory[categoryIndex]._sum.amount += newExpense.amount;
  }

  const expenseDate = new Date(newExpense.date);
  const expenseMonth = expenseDate.getMonth() + 1;

  const monthIndex = mockData.expensesByMonth.findIndex(
    (item) => item.month === expenseMonth,
  );

  if (monthIndex !== -1) {
    mockData.expensesByMonth[monthIndex].total += newExpense.amount;
  }

  return {
    expensesByCategory: mockData.expensesByCategory,
    expensesByMonth: mockData.expensesByMonth,
  };
}

function startDataGenerationThread() {
  console.log('Starting data generation thread...');

  stopDataGeneration();

  generationInterval = setInterval(() => {
    try {
      if (io) {
        console.log('Generating new expense data...');

        const newExpense = generateRandomExpense();
        console.log(
          'Generated new expense:',
          newExpense.title,
          newExpense.amount,
        );

        const updatedChartData = updateChartData(newExpense);
        console.log(
          'Updated chart data - categories:',
          updatedChartData.expensesByCategory.length,
        );

        console.log('Emitting new expense event to all clients');
        io.emit('new-expense', newExpense);
        io.emit('chart-data-update', updatedChartData);
      } else {
        console.warn(
          'Socket.IO server not available, skipping data generation',
        );
      }
    } catch (error) {
      console.error('Error generating expense:', error);
    }
  }, 5000);
}

function stopDataGeneration() {
  if (generationInterval) {
    clearInterval(generationInterval);
    generationInterval = null;
  }
}
