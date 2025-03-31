'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import {
  addExpense,
  updateExpense,
} from '@/app/services/client/expenseService';
import { Expense } from '@/app/types/Expense';

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
  category: z.string().min(1, { message: 'Category is required' }),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

const defaultFormData: ExpenseFormData = {
  date: new Date().toISOString().split('T')[0],
  merchant: '',
  description: '',
  amount: '',
  category: '',
};

const categories = [
  'Food & Dining',
  'Shopping',
  'Housing',
  'Transportation',
  'Entertainment',
  'Health & Fitness',
  'Travel',
  'Education',
  'Gifts & Donations',
  'Other',
];

interface ExpenseFormProps {
  expenseToEdit?: Expense | null;
}

export default function ExpenseForm({ expenseToEdit }: ExpenseFormProps) {
  const router = useRouter();
  const isEditing = !!expenseToEdit;

  const initialFormData: ExpenseFormData = isEditing
    ? {
        date: expenseToEdit.date,
        merchant: expenseToEdit.merchant,
        description: expenseToEdit.description,
        amount: expenseToEdit.amount.toString(),
        category: expenseToEdit.category,
      }
    : defaultFormData;

  const [formData, setFormData] = useState<ExpenseFormData>(initialFormData);
  const [errors, setErrors] = useState<
    Partial<Record<keyof ExpenseFormData, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev: typeof formData) => ({ ...prev, [name]: value }));
    if (errors[name as keyof ExpenseFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (formError) {
      setFormError(null);
    }
  };

  const validateForm = (): boolean => {
    try {
      expenseSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof ExpenseFormData, string>> = {};
        error.errors.forEach((err) => {
          const path = err.path[0] as keyof ExpenseFormData;
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      const expenseData = {
        date: formData.date,
        merchant: formData.merchant,
        description: formData.description,
        amount: parseFloat(formData.amount),
        category: formData.category,
      };

      if (isEditing && expenseToEdit) {
        const updatedExpense = updateExpense(expenseToEdit.id, expenseData);
        console.log('Expense updated:', updatedExpense);
      } else {
        const newExpense = addExpense(expenseData);
        console.log('New expense added:', newExpense);
      }

      router.push('/expenses');
    } catch (error) {
      console.error('Failed to save expense:', error);
      setFormError(
        'An error occurred while saving the expense. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto mt-50">
      {formError && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded">
          {formError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            placeholder="Enter merchant name"
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
            htmlFor="category"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Category
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`w-full px-3 py-2 bg-[#1E1E1E] border ${
              errors.category ? 'border-red-500' : 'border-purple-300/20'
            } rounded-md text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-300/50`}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-500">{errors.category}</p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-300 mb-1"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          placeholder="Enter a description"
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

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={() => router.push('/expenses')}
          className="px-4 py-2 bg-[#1E1E1E] text-gray-300 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-purple-300/10 text-purple-300 rounded-md hover:bg-purple-300/20 focus:outline-none focus:ring-2 focus:ring-purple-300/50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting
            ? 'Saving...'
            : isEditing
              ? 'Update Expense'
              : 'Save Expense'}
        </button>
      </div>
    </form>
  );
}
