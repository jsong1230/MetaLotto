'use client';

import { useState, useEffect } from 'react';
import { useTicketPurchase } from '@/hooks/useTicketPurchase';
import { useCurrentRound } from '@/hooks/useCurrentRound';
import { useMyTickets } from '@/hooks/useMyTickets';
import { useCountdown } from '@/hooks/useCountdown';
import { useAccount } from 'wagmi';
import { useTranslations } from 'next-intl';
import { formatEther } from 'viem';
import { RoundStatus } from '@/lib/abis/types';
import { Loader2 } from 'lucide-react';

const microLabel: React.CSSProperties = {
  fontFamily: "'Barlow Condensed', Arial, sans-serif",
  fontWeight: 700,
  fontSize: '0.63rem',
  letterSpacing: '1px',
  textTransform: 'uppercase',
  color: 'rgba(240, 240, 250, 0.35)',
  lineHeight: 0.94,
  display: 'block',
  marginBottom: '0.75rem',
};

const sectionTitle: React.CSSProperties = {
  fontFamily: "'Barlow Condensed', Arial, sans-serif",
  fontWeight: 700,
  fontSize: '0.81rem',
  letterSpacing: '1.17px',
  textTransform: 'uppercase',
  color: '#f0f0fa',
  lineHeight: 0.94,
};

const ghostBtn: React.CSSProperties = {
  border: '1px solid rgba(240, 240, 250, 0.35)',
  background: 'rgba(240, 240, 250, 0.1)',
  color: '#f0f0fa',
  borderRadius: '32px',
  fontFamily: "'Barlow Condensed', Arial, sans-serif",
  fontWeight: 700,
  fontSize: '0.81rem',
  letterSpacing: '1.17px',
  textTransform: 'uppercase' as const,
  cursor: 'pointer',
  transition: 'background 0.2s, border-color 0.2s',
};

export function TicketPurchaseSection() {
  const { isConnected } = useAccount();
  const { round, refetch: refetchRound } = useCurrentRound();
  const { ticketCount: myTickets, refetch: refetchMyTickets } = useMyTickets(round?.roundId);
  const { buyTickets, calculateTotalPrice, isPending, isConfirming, isSuccess, error: txError } = useTicketPurchase();
  const { isExpired } = useCountdown(round?.endTimestamp ?? 0n);
  const t = useTranslations('ticketPurchase');
  const tErrors = useTranslations('errors');

  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const isOpen = round?.status === RoundStatus.Open && !isExpired;
  const ticketPrice = round?.ticketPrice ?? 0n;
  const totalPrice = calculateTotalPrice(quantity, ticketPrice);

  useEffect(() => {
    if (isSuccess) {
      refetchRound();
      refetchMyTickets();
      const timer = setTimeout(() => {
        setQuantity(1);
        setError(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, refetchRound, refetchMyTickets]);

  const handleQuantityChange = (value: number) => {
    setQuantity(Math.max(1, Math.min(100, value)));
    setError(null);
  };

  const handlePurchase = async () => {
    if (!isConnected) { setError(tErrors('connectWallet')); return; }
    if (!isOpen) { setError(tErrors('roundClosed')); return; }
    if (ticketPrice === 0n) { setError(tErrors('priceLoading')); return; }
    try {
      setError(null);
      await buyTickets(quantity, ticketPrice);
    } catch (err) {
      setError(err instanceof Error ? err.message : tErrors('purchaseFailed'));
    }
  };

  const presets = [1, 5, 10, 20];
  const isBusy = isPending || isConfirming;
  const ticketUnit = t('ticketUnit');

  return (
    <div
      style={{
        border: '1px solid rgba(240, 240, 250, 0.1)',
        padding: '1.5rem',
        height: '100%',
      }}
    >
      {/* 헤더 */}
      <div className="mb-6">
        <span style={sectionTitle}>{t('title')}</span>
        {myTickets !== undefined && myTickets > 0n && (
          <p
            style={{
              ...microLabel,
              color: 'rgba(240, 240, 250, 0.6)',
              marginTop: '0.25rem',
              marginBottom: 0,
            }}
          >
            {t('currentHolding', { count: myTickets.toString() })}
          </p>
        )}
      </div>

      {!isConnected ? (
        <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
          <p style={sectionTitle}>{t('connectWallet')}</p>
          <p style={{ ...microLabel, marginBottom: 0 }}>{t('connectWalletDesc')}</p>
        </div>
      ) : !isOpen ? (
        <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
          <p style={sectionTitle}>{t('roundClosed')}</p>
          <p style={{ ...microLabel, marginBottom: 0 }}>{t('roundClosedDesc')}</p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* 수량 선택 */}
          <div>
            <span style={microLabel}>{t('selectQuantity')}</span>
            <div className="flex items-center gap-4 mb-3">
              <button
                type="button"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
                style={{
                  ...ghostBtn,
                  width: '44px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: quantity <= 1 ? 0.3 : 1,
                  cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
                }}
              >
                −
              </button>

              <div className="flex-1 text-center">
                <span
                  style={{
                    fontFamily: "'Barlow Condensed', Arial, sans-serif",
                    fontWeight: 700,
                    fontSize: '3rem',
                    letterSpacing: '0.96px',
                    color: '#f0f0fa',
                    lineHeight: 1,
                  }}
                >
                  {quantity}
                </span>
                {ticketUnit && (
                  <span
                    style={{
                      fontFamily: "'Barlow Condensed', Arial, sans-serif",
                      fontSize: '1rem',
                      color: 'rgba(240, 240, 250, 0.35)',
                      marginLeft: '0.4rem',
                      textTransform: 'uppercase',
                    }}
                  >
                    {ticketUnit}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= 100}
                style={{
                  ...ghostBtn,
                  width: '44px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: quantity >= 100 ? 0.3 : 1,
                  cursor: quantity >= 100 ? 'not-allowed' : 'pointer',
                }}
              >
                +
              </button>
            </div>

            {/* 프리셋 */}
            <div className="flex gap-2">
              {presets.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handleQuantityChange(p)}
                  style={{
                    ...ghostBtn,
                    flex: 1,
                    padding: '8px 4px',
                    background: quantity === p ? 'rgba(240, 240, 250, 0.15)' : 'rgba(240, 240, 250, 0.05)',
                    borderColor: quantity === p ? 'rgba(240, 240, 250, 0.6)' : 'rgba(240, 240, 250, 0.2)',
                    color: quantity === p ? '#f0f0fa' : 'rgba(240, 240, 250, 0.5)',
                    fontSize: '0.75rem',
                  }}
                >
                  {ticketUnit ? `${p}${ticketUnit}` : p}
                </button>
              ))}
            </div>
          </div>

          {/* 총 금액 */}
          <div style={{ borderTop: '1px solid rgba(240, 240, 250, 0.1)', paddingTop: '1rem' }}>
            <div className="flex items-center justify-between">
              <span style={{ ...microLabel, marginBottom: 0 }}>{t('totalAmount')}</span>
              <div className="text-right">
                <span
                  style={{
                    fontFamily: "'Barlow Condensed', Arial, sans-serif",
                    fontWeight: 700,
                    fontSize: '1.75rem',
                    letterSpacing: '0.96px',
                    color: '#f0f0fa',
                  }}
                >
                  {totalPrice}
                </span>
                <span
                  style={{
                    fontFamily: "'Barlow Condensed', Arial, sans-serif",
                    fontSize: '0.75rem',
                    color: 'rgba(240, 240, 250, 0.35)',
                    textTransform: 'uppercase',
                    marginLeft: '0.3rem',
                  }}
                >
                  {t('metaUnit')}
                </span>
              </div>
            </div>
          </div>

          {/* 에러 */}
          {(error || txError) && (
            <p
              style={{
                fontFamily: "'Barlow Condensed', Arial, sans-serif",
                fontSize: '0.75rem',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                color: 'rgba(240, 240, 250, 0.5)',
                border: '1px solid rgba(240, 240, 250, 0.2)',
                padding: '0.5rem 0.75rem',
              }}
            >
              {error || txError?.message}
            </p>
          )}

          {/* 성공 */}
          {isSuccess && (
            <p
              style={{
                fontFamily: "'Barlow Condensed', Arial, sans-serif",
                fontSize: '0.75rem',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                color: '#f0f0fa',
                border: '1px solid rgba(240, 240, 250, 0.35)',
                padding: '0.5rem 0.75rem',
              }}
            >
              {t('purchaseSuccess')}
            </p>
          )}

          {/* 구매 버튼 */}
          <button
            type="button"
            onClick={handlePurchase}
            disabled={isBusy || ticketPrice === 0n}
            style={{
              ...ghostBtn,
              width: '100%',
              padding: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '0.81rem',
              opacity: isBusy ? 0.5 : 1,
              cursor: isBusy ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={e => {
              if (!isBusy) {
                (e.currentTarget as HTMLElement).style.background = 'rgba(240, 240, 250, 0.15)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(240, 240, 250, 0.6)';
              }
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(240, 240, 250, 0.1)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(240, 240, 250, 0.35)';
            }}
          >
            {isConfirming ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> {t('confirming')}</>
            ) : isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> {t('pending')}</>
            ) : isSuccess ? (
              t('success')
            ) : (
              t('purchase', { price: totalPrice })
            )}
          </button>

          <p style={{ ...microLabel, textAlign: 'center', marginBottom: 0 }}>{t('maxTickets')}</p>
        </div>
      )}
    </div>
  );
}
