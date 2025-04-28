'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import {
  addExpense,
  updateExpense,
} from '@/app/services/client/expenseService';
import { Expense } from '@/app/types/Expense';
import { getAllCategories } from '@/app/services/client/categoryService';

const expenseSchema = z.object({
  date: z.string().min(1, { message: 'Date is required' }),
  merchant: z.string().min(1, { message: 'Merchant is required' }),
  description: z.string().min(1, { message: 'Description is required' }),
  amount: z
    .string()
    .min(1, { message: 'Amount is required' })
    .refine((val: string) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: 'Amount must be a positive number',
    }),
  categoryId: z.number().min(1, { message: 'Category is required' }),
});

type ExpenseFormData = {
  date: string;
  merchant: string;
  description: string;
  amount: string;
  categoryId: number;
};

const defaultFormData: ExpenseFormData = {
  date: new Date().toISOString().split('T')[0],
  merchant: '',
  description: '',
  amount: '',
  categoryId: 0,
};

interface ExpenseFormProps {
  expenseToEdit?: Expense | null;
}

export default function ExpenseForm({ expenseToEdit }: ExpenseFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<ExpenseFormData>(defaultFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>(
    [],
  );

  useEffect(() => {
    // Load categories
    const loadCategories = async () => {
      try {
        const categoriesData = await getAllCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    if (expenseToEdit) {
      setFormData({
        date: expenseToEdit.date,
        merchant: expenseToEdit.merchant,
        description: expenseToEdit.description,
        amount: expenseToEdit.amount.toString(),
        categoryId: expenseToEdit.categoryId,
      });
    }
  }, [expenseToEdit]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === 'categoryId' ? parseInt(value, 10) : value,
    }));

    // Clear the error for this field when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    try {
      expenseSchema.parse({
        ...formData,
        amount: formData.amount,
      });
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        err.errors.forEach((error) => {
          const path = error.path[0].toString();
          newErrors[path] = error.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      if (expenseToEdit) {
        // Update existing expense
        await updateExpense(expenseToEdit.id, {
          ...formData,
          amount: parseFloat(formData.amount),
        });
      } else {
        // Add new expense
        await addExpense({
          ...formData,
          amount: parseFloat(formData.amount),
        });
      }

      router.push('/expenses');
      router.refresh();
    } catch (error) {
      console.error('Error saving expense:', error);
      if (error instanceof Error) {
        setErrors({ form: error.message });
      } else {
        setErrors({ form: 'An unexpected error occurred' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.form && (
        <div className="p-4 bg-red-500/20 border border-red-500 rounded-md">
          <p className="text-red-500">{errors.form}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="date"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Date
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className={`w-full px-3 py-2 bg-[#1E1E1E] border ${
              errors.date ? 'border-red-500' : 'border-purple-300/20'
            } rounded-md text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-300/50`}
          />
          {errors.date && (
            <p className="mt-1 text-sm text-red-500">{errors.date}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="merchant"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Merchant
          </label>
          <input
            type="text"
            id="merchant"
            name="merchant"
            placeholder="Merchant name"
            value={formData.merchant}
            onChange={handleChange}
            className={`w-full px-3 py-2 bg-[#1E1E1E] border ${
              errors.merchant ? 'border-red-500' : 'border-purple-300/20'
            } rounded-md text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-300/50`}
          />
          {errors.merchant && (
            <p className="mt-1 text-sm text-red-500">{errors.merchant}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Description
          </label>
          <input
            type="text"
            id="description"
            name="description"
            placeholder="Expense description"
            value={formData.description}
            onChange={handleChange}
            className={`w-full px-3 py-2 bg-[#1E1E1E] border ${
              errors.description ? 'border-red-500' : 'border-purple-300/20'
            } rounded-md text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-300/50`}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-500">{errors.description}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Amount
          </label>
          <input
            type="text"
            id="amount"
            name="amount"
            placeholder="0.00"
            value={formData.amount}
            onChange={handleChange}
            className={`w-full px-3 py-2 bg-[#1E1E1E] border ${
              errors.amount ? 'border-red-500' : 'border-purple-300/20'
            } rounded-md text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-300/50`}
          />
          {errors.amount && (
            <p className="mt-1 text-sm text-red-500">{errors.amount}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="categoryId"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Category
          </label>
          <select
            id="categoryId"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            className={`w-full px-3 py-2 bg-[#1E1E1E] border ${
              errors.categoryId ? 'border-red-500' : 'border-purple-300/20'
            } rounded-md text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-300/50`}
          >
            <option value={0}>Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="mt-1 text-sm text-red-500">{errors.categoryId}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2 bg-[#1E1E1E] text-gray-300 rounded-md hover:bg-purple-300/10 focus:outline-none focus:ring-2 focus:ring-purple-300/50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2 bg-purple-300/20 text-purple-300 rounded-md hover:bg-purple-300/30 focus:outline-none focus:ring-2 focus:ring-purple-300/50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting
            ? 'Saving...'
            : expenseToEdit
              ? 'Update Expense'
              : 'Add Expense'}
        </button>
      </div>
    </form>
  );
}
