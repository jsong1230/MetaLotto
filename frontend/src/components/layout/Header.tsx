'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { WalletConnectButton } from '../wallet/WalletConnectButton';

/**
 * 헤더 컴포넌트
 * 로고, 네비게이션, 지갑 연결 버튼 포함
 */
export function Header() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: '홈' },
    { href: '/history', label: '히스토리' },
    // { href: '/my-tickets', label: '내 티켓' }, // 추후 구현
  ];

  return (
    <header className="border-b border-zinc-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50 dark:border-zinc-800 dark:bg-black/80">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* 로고 */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600" />
            <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              MetaLotto
            </span>
          </Link>

          {/* 네비게이션 */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* 지갑 연결 버튼 */}
          <WalletConnectButton />
        </div>

        {/* 모바일 네비게이션 */}
        <nav className="flex md:hidden items-center justify-center gap-4 mt-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition-colors ${
                pathname === item.href
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
