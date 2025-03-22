'use client';

import { Search } from 'lucide-react';

export default function SearchButton() {
  return (
    <button className="bg-purple-300/10 hover:bg-purple-300/20 p-2 rounded-md cursor-pointer text-purple-300">
      <Search size={20} />
    </button>
  );
}
