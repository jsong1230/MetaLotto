'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';

interface DrawMechanismModalProps {
  onClose: () => void;
}

export function DrawMechanismModal({ onClose }: DrawMechanismModalProps) {
  const t = useTranslations('drawMechanism');

  // ESC 키로 닫기
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // 스크롤 잠금
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8"
        style={{ background: '#141428', border: '1px solid rgba(0,217,255,0.25)' }}
      >
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center transition-all"
          style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
        >
          <X className="w-4 h-4" />
        </button>

        {/* 헤더 */}
        <div className="mb-6">
          <p className="text-xs font-black tracking-widest uppercase mb-1" style={{ color: '#00D9FF' }}>⛓️ ON-CHAIN RANDOMNESS</p>
          <h2 className="text-2xl font-black text-white">{t('title')}</h2>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{t('subtitle')}</p>
        </div>

        {/* 전체 흐름 */}
        <div className="mb-6 p-4 rounded-2xl" style={{ background: 'rgba(0,217,255,0.06)', border: '1px solid rgba(0,217,255,0.15)' }}>
          <p className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: '#00D9FF' }}>{t('flowLabel')}</p>
          <div className="flex flex-col gap-1 text-sm">
            {[t('flow1'), t('flow2'), t('flow3'), t('flow4'), t('flow5')].map((step, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="font-black shrink-0 mt-0.5" style={{ color: '#00D9FF' }}>{i + 1}.</span>
                <span style={{ color: 'rgba(255,255,255,0.8)' }}>{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 섹션: seed */}
        <Section
          color="#7C3AED"
          icon="🌱"
          title={t('seedTitle')}
          badge="seed"
        >
          <p className="text-sm mb-3" style={{ color: 'rgba(255,255,255,0.7)' }}>{t('seedDesc')}</p>
          <CodeBlock>
            {`round.seed = keccak256(\n  round.seed,      // 이전 시드\n  msg.sender,      // 구매자 주소\n  block.number,    // 구매 블록 번호\n  block.timestamp  // 구매 타임스탬프\n)`}
          </CodeBlock>
          <p className="text-xs mt-3" style={{ color: 'rgba(255,255,255,0.5)' }}>{t('seedNote')}</p>
        </Section>

        {/* 섹션: totalPool */}
        <Section
          color="#EAB308"
          icon="💰"
          title={t('poolTitle')}
          badge="totalPool"
        >
          <p className="text-sm mb-3" style={{ color: 'rgba(255,255,255,0.7)' }}>{t('poolDesc')}</p>
          <CodeBlock>{`예) 12장 × 100 META = 1,200 META\n    → 1200000000000000000000 (wei)`}</CodeBlock>
          <p className="text-xs mt-3" style={{ color: 'rgba(255,255,255,0.5)' }}>{t('poolNote')}</p>
        </Section>

        {/* 섹션: blockhash */}
        <Section
          color="#00D9FF"
          icon="🔗"
          title={t('blockTitle')}
          badge="blockhash × 3"
        >
          <p className="text-sm mb-3" style={{ color: 'rgba(255,255,255,0.7)' }}>{t('blockDesc')}</p>
          <CodeBlock>
            {`// 라운드 종료 → drawBlock = block.number + 10\nbytes32 hash1 = blockhash(drawBlock);\nbytes32 hash2 = blockhash(drawBlock - 1);\nbytes32 hash3 = blockhash(drawBlock - 2);`}
          </CodeBlock>
          <p className="text-xs mt-3" style={{ color: 'rgba(255,255,255,0.5)' }}>{t('blockNote')}</p>
        </Section>

        {/* 최종 계산 */}
        <div className="mt-4 p-4 rounded-2xl" style={{ background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.2)' }}>
          <p className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: '#EAB308' }}>{t('finalLabel')}</p>
          <CodeBlock>
            {`uint256 random = uint256(\n  keccak256(hash1 + hash2 + hash3 + seed + pool)\n);\n\nwinnerIndex = random % ticketCount;\nwinner = tickets[winnerIndex].buyer;`}
          </CodeBlock>
          <p className="text-sm mt-3 font-bold" style={{ color: 'rgba(255,255,255,0.8)' }}>{t('finalNote')}</p>
        </div>
      </div>
    </div>
  );
}

function Section({ color, icon, title, badge, children }: {
  color: string;
  icon: string;
  title: string;
  badge: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-4 p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${color}30` }}>
      <div className="flex items-center gap-2 mb-3">
        <span>{icon}</span>
        <span className="font-black text-white">{title}</span>
        <span className="font-mono text-xs px-2 py-0.5 rounded-full" style={{ background: `${color}20`, color }}>{badge}</span>
      </div>
      {children}
    </div>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre
      className="text-xs rounded-xl p-3 overflow-x-auto leading-relaxed"
      style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)', color: '#00D9FF', fontFamily: 'monospace' }}
    >
      {children}
    </pre>
  );
}
