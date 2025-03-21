'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, CreditCard, User, Mail } from 'lucide-react';

const menuItems = [
  { name: 'Home', href: '/', icon: <Home className="w-6 h-6" /> },
  {
    name: 'Expenses',
    href: '/expenses',
    icon: <CreditCard className="w-6 h-6" />,
  },
  { name: 'Account', href: '/account', icon: <User className="w-6 h-6" /> },
  { name: 'Contact', href: '/contact', icon: <Mail className="w-6 h-6" /> },
];

export default function SidebarMenu() {
  const pathname = usePathname();

  return (
    <nav className="mt-40 px-4">
      <ul className="flex flex-col items-center">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <li key={item.name} className="w-full mb-3">
              <Link
                href={item.href}
                className={`flex items-center p-3 rounded-lg ${
                  isActive ? 'bg-purple-300/25' : ''
                }`}
              >
                <div className="flex justify-center w-10">
                  <div
                    className={`${
                      isActive ? 'text-purple-300' : 'text-gray-300'
                    }`}
                  >
                    {item.icon}
                  </div>
                </div>
                <span
                  className={`text-lg ${isActive ? 'font-medium text-purple-300' : 'text-gray-300 font-normal'}`}
                >
                  {item.name}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
