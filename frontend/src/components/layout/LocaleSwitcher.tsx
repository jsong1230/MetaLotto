'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

const LOCALES = [
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
] as const;

type LocaleCode = (typeof LOCALES)[number]['code'];

export function LocaleSwitcher() {
  const locale = useLocale() as LocaleCode;
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const current = LOCALES.find(l => l.code === locale) ?? LOCALES[0];

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocaleChange = (newLocale: LocaleCode) => {
    setIsOpen(false);
    // 현재 경로에서 locale 세그먼트를 교체
    const segments = pathname.split('/');
    // segments[1]이 현재 locale
    segments[1] = newLocale;
    router.push(segments.join('/') || '/');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200"
        style={{
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.15)',
          color: 'rgba(255,255,255,0.8)',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="text-base leading-none">{current.flag}</span>
        <span className="hidden sm:block">{current.label}</span>
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-40 rounded-2xl py-1 z-50 shadow-2xl"
          style={{
            background: 'rgba(20,20,40,0.95)',
            border: '1px solid rgba(255,255,255,0.12)',
            backdropFilter: 'blur(20px)',
          }}
          role="listbox"
        >
          {LOCALES.map(l => (
            <button
              key={l.code}
              type="button"
              onClick={() => handleLocaleChange(l.code)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors duration-150"
              style={{
                color: l.code === locale ? '#00D9FF' : 'rgba(255,255,255,0.7)',
                background: l.code === locale ? 'rgba(0,217,255,0.08)' : 'transparent',
              }}
              onMouseEnter={e => l.code !== locale && (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
              onMouseLeave={e => l.code !== locale && (e.currentTarget.style.background = 'transparent')}
              role="option"
              aria-selected={l.code === locale}
            >
              <span className="text-base">{l.flag}</span>
              <span>{l.label}</span>
              {l.code === locale && (
                <svg className="w-3.5 h-3.5 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
