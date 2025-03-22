'use client';

import { Trash2 } from 'lucide-react';

export default function DeleteExpenseButton() {
  return (
    <button className="bg-[#BF415D]/10 hover:bg-[#BF415D]/20 p-2 rounded-md cursor-pointer text-[#BF415D]">
      <Trash2 size={20} />
    </button>
  );
}
