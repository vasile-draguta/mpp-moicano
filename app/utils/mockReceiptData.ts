import { Receipt } from '@/app/types/Receipt';

export const generateMockReceipts = (): Receipt[] => {
  const receipts: Receipt[] = [];
  const categories = [
    'Grocery',
    'Restaurant',
    'Gas',
    'Retail',
    'Pharmacy',
    'Utilities',
    'Entertainment',
  ];
  const stores = [
    'Walmart',
    'Target',
    'Kroger',
    'Shell',
    'Exxon',
    'Walgreens',
    'CVS',
    'HomeDepot',
    'Lowes',
    'BestBuy',
    'Amazon',
  ];

  const getRandomDate = () => {
    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 6);

    const randomTime =
      sixMonthsAgo.getTime() +
      Math.random() * (now.getTime() - sixMonthsAgo.getTime());
    const randomDate = new Date(randomTime);
    return randomDate.toISOString().split('T')[0];
  };

  const generateReceiptUrl = (id: number, category: string, store: string) => {
    const bgColors = ['333333', '3a3a3a', '444444', '4a4a4a', '2a2a2a'];
    const bg = bgColors[id % bgColors.length];

    const width = 300;
    const height = 400;

    return `https://dummyimage.com/${width}x${height}/${bg}/CCCCCC&text=${store}+${category}+Receipt`;
  };

  for (let i = 1; i <= 100; i++) {
    const category = categories[i % categories.length];
    const store = stores[i % stores.length];
    const date = getRandomDate();

    receipts.push({
      id: i,
      name: `${store} ${category} Receipt`,
      url: generateReceiptUrl(i, category, store),
      date,
    });
  }

  return receipts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
};

export let mockReceipts = generateMockReceipts();

export const deleteMockReceipt = (id: number): boolean => {
  const initialLength = mockReceipts.length;
  mockReceipts = mockReceipts.filter((receipt) => receipt.id !== id);
  return mockReceipts.length !== initialLength;
};

export const addMockReceipt = (receipt: Receipt): void => {
  mockReceipts = [receipt, ...mockReceipts];
};

export const getPaginatedReceipts = (page: number, limit: number) => {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  return {
    data: mockReceipts.slice(startIndex, endIndex),
    metadata: {
      currentPage: page,
      totalPages: Math.ceil(mockReceipts.length / limit),
      totalItems: mockReceipts.length,
      itemsPerPage: limit,
    },
  };
};
