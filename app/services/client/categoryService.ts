import { Category } from '@/app/types/Expense';

// Cache categories to avoid frequent API calls
let categoriesCache: Category[] | null = null;

export const getAllCategories = async (): Promise<Category[]> => {
  if (categoriesCache) {
    return categoriesCache;
  }

  try {
    const response = await fetch('/api/categories');

    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }

    const data = await response.json();
    categoriesCache = data.categories;
    return data.categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

export const getCategoryById = async (id: number): Promise<Category | null> => {
  // Try to get from cache first
  if (categoriesCache) {
    const category = categoriesCache.find((c) => c.id === id);
    if (category) {
      return category;
    }
  }

  try {
    const response = await fetch(`/api/categories/${id}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch category with id ${id}`);
    }

    const data = await response.json();
    return data.category;
  } catch (error) {
    console.error(`Error fetching category with id ${id}:`, error);
    return null;
  }
};

export const getCategoryNameById = async (id: number): Promise<string> => {
  const category = await getCategoryById(id);
  return category ? category.name : 'Unknown';
};
