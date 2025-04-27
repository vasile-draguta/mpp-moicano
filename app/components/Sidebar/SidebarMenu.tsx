'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Receipt, User, LogOut } from 'lucide-react';

type SidebarMenuProps = {
  onLogout: () => void;
};

export default function SidebarMenu({ onLogout }: SidebarMenuProps) {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', href: '/', icon: <Home size={20} /> },
    {
      name: 'Expenses',
      href: '/expenses',
      icon: <Receipt size={20} />,
    },
    { name: 'Account', href: '/account', icon: <User size={20} /> },
  ];

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

  return (
    <nav className="flex-1 p-4">
      <ul className="space-y-2">
        {menuItems.map((item) => (
          <li key={item.name}>
            <Link
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                isActive(item.href)
                  ? 'bg-purple-300/10 text-purple-300'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-purple-300/5'
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-4 pt-4 border-t border-purple-300/10">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-gray-400 hover:text-red-400 hover:bg-red-400/5 transition-colors"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
}
