'use client';

import { useAccount, useDisconnect, useBalance, useConnect } from 'wagmi';
import { useTranslations } from 'next-intl';
import { injected } from 'wagmi/connectors';
import { formatEther } from 'viem';
import { Wallet, LogOut } from 'lucide-react';

export function WalletConnectButton() {
  const { address, isConnected, isConnecting } = useAccount();
  const { disconnect } = useDisconnect();
  const { connect } = useConnect();
  const { data: balance } = useBalance({ address });
  const t = useTranslations('wallet');

  const btnBase = "flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold transition-all duration-300";

  if (isConnecting) {
    return (
      <button disabled className={btnBase} style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', cursor: 'not-allowed' }}>
        <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(0,217,255,0.3)', borderTopColor: '#00D9FF' }} />
        {t('connecting')}
      </button>
    );
  }

  if (!isConnected || !address) {
    return (
      <button
        onClick={() => connect({ connector: injected() })}
        className={btnBase}
        style={{ background: 'linear-gradient(135deg, #00D9FF 0%, #7C3AED 100%)', boxShadow: '0 4px 20px rgba(0,217,255,0.3)', color: '#fff' }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,217,255,0.5)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,217,255,0.3)';
        }}
      >
        <Wallet className="w-4 h-4" />
        {t('connect')}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {balance && (
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-bold" style={{ background: 'rgba(0,217,255,0.1)', border: '1px solid rgba(0,217,255,0.2)', color: '#00D9FF' }}>
          {parseFloat(formatEther(balance.value)).toFixed(2)} META
        </div>
      )}
      <button
        onClick={() => disconnect()}
        className={`${btnBase} group`}
        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)' }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(255,107,107,0.15)';
          e.currentTarget.style.borderColor = 'rgba(255,107,107,0.3)';
          e.currentTarget.style.color = '#FF6B6B';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
          e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
        }}
        title={t('disconnect')}
      >
        <span className="hidden sm:block font-mono text-xs">{`${address.slice(0, 6)}...${address.slice(-4)}`}</span>
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  );
}
