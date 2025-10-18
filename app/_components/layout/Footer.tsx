'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Footer() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', icon: '🏠', label: 'ホーム' },
    { href: '/episodes', icon: '📝', label: '投稿' },
    { href: '/tdn', icon: '👑', label: 'TDN' },
    { href: '/user', icon: '👤', label: 'ユーザー' },
    { href: '/profile', icon: '🔑', label: 'プロフィール' },
  ];

  return (
    <footer className="fixed bottom-0 left-0 w-full bg-white border-t shadow-lg">
      {/* ボトムナビゲーション */}
      <nav className="flex justify-around items-center py-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              pathname === item.href
                ? 'text-blue-500 bg-blue-50'
                : 'text-gray-500 hover:text-blue-500'
            }`}
          >
            <span className="text-xl mb-1">{item.icon}</span>
            <span className="text-xs">{item.label}</span>
          </Link>
        ))}
      </nav>
    </footer>
  );
}
