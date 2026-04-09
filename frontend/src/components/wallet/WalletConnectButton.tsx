'use client';

import { useAccount, useDisconnect, useBalance, useConnect } from 'wagmi';
import { useTranslations } from 'next-intl';
import { injected } from 'wagmi/connectors';
import { formatEther } from 'viem';

const ghostBtn: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 18px',
  borderRadius: '32px',
  border: '1px solid rgba(240, 240, 250, 0.35)',
  background: 'rgba(240, 240, 250, 0.1)',
  color: '#f0f0fa',
  fontFamily: "'Barlow Condensed', Arial, sans-serif",
  fontWeight: 700,
  fontSize: '0.81rem',
  letterSpacing: '1.17px',
  textTransform: 'uppercase' as const,
  cursor: 'pointer',
  transition: 'background 0.2s, border-color 0.2s',
};

export function WalletConnectButton() {
  const { address, isConnected, isConnecting } = useAccount();
  const { disconnect } = useDisconnect();
  const { connect } = useConnect();
  const { data: balance } = useBalance({ address });
  const t = useTranslations('wallet');

  if (isConnecting) {
    return (
      <button disabled style={{ ...ghostBtn, opacity: 0.5, cursor: 'not-allowed' }}>
        <div
          className="w-4 h-4 border-2 rounded-full animate-spin"
          style={{ borderColor: 'rgba(240,240,250,0.3)', borderTopColor: '#f0f0fa' }}
        />
        {t('connecting')}
      </button>
    );
  }

  if (!isConnected || !address) {
    return (
      <button
        onClick={() => connect({ connector: injected() })}
        style={ghostBtn}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.background = 'rgba(240, 240, 250, 0.15)';
          (e.currentTarget as HTMLElement).style.borderColor = 'rgba(240, 240, 250, 0.6)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.background = 'rgba(240, 240, 250, 0.1)';
          (e.currentTarget as HTMLElement).style.borderColor = 'rgba(240, 240, 250, 0.35)';
        }}
      >
        {t('connect')}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {balance && (
        <span
          style={{
            fontFamily: "'Barlow Condensed', Arial, sans-serif",
            fontSize: '0.81rem',
            fontWeight: 700,
            letterSpacing: '1.17px',
            textTransform: 'uppercase',
            color: 'rgba(240, 240, 250, 0.6)',
          }}
          className="hidden sm:block"
        >
          {parseFloat(formatEther(balance.value)).toFixed(2)} META
        </span>
      )}
      <button
        onClick={() => disconnect()}
        style={ghostBtn}
        title={t('disconnect')}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.background = 'rgba(240, 240, 250, 0.15)';
          (e.currentTarget as HTMLElement).style.borderColor = 'rgba(240, 240, 250, 0.6)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.background = 'rgba(240, 240, 250, 0.1)';
          (e.currentTarget as HTMLElement).style.borderColor = 'rgba(240, 240, 250, 0.35)';
        }}
      >
        <span className="hidden sm:block font-mono text-xs">{`${address.slice(0, 6)}...${address.slice(-4)}`}</span>
        <span className="sm:hidden">✕</span>
      </button>
    </div>
  );
}
