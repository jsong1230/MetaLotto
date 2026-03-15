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
import { Minus, Plus, Ticket, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export function TicketPurchaseSection() {
  const { isConnected } = useAccount();
  const { round } = useCurrentRound();
  const { ticketCount: myTickets } = useMyTickets(round?.roundId);
  const { buyTickets, calculateTotalPrice, isPending, isConfirming, isSuccess, error: txError } = useTicketPurchase();
  const { isExpired } = useCountdown(round?.endTimestamp ?? 0n);
  const t = useTranslations('ticketPurchase');
  const tErrors = useTranslations('errors');

  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // 온체인 상태가 Open이어도 시간이 만료된 경우 베팅 불가
  const isOpen = round?.status === RoundStatus.Open && !isExpired;
  const ticketPrice = round?.ticketPrice ?? 0n;
  const totalPrice = calculateTotalPrice(quantity, ticketPrice);

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        setQuantity(1);
        setError(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

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

  // 티켓 단위 (언어별로 차이 있음)
  const ticketUnit = t('ticketUnit');

  return (
    <div className="rounded-3xl p-6 h-full" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00D9FF 0%, #7C3AED 100%)' }}>
          <Ticket className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-black text-white">{t('title')}</h2>
          {myTickets !== undefined && myTickets > 0n && (
            <p className="text-xs font-medium" style={{ color: '#00D9FF' }}>
              {t('currentHolding', { count: myTickets.toString() })}
            </p>
          )}
        </div>
      </div>

      {!isConnected ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-4xl mb-4">🔗</div>
          <p className="font-bold text-white mb-1">{t('connectWallet')}</p>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{t('connectWalletDesc')}</p>
        </div>
      ) : !isOpen ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="font-bold text-white mb-1">{t('roundClosed')}</p>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{t('roundClosedDesc')}</p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* 수량 선택 */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider mb-3 block" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {t('selectQuantity')}
            </label>
            <div className="flex items-center gap-4 mb-3">
              <button
                type="button"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
                className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold transition-all duration-200"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: quantity <= 1 ? 'rgba(255,255,255,0.2)' : 'white' }}
                onMouseEnter={e => quantity > 1 && (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
              >
                <Minus className="w-4 h-4" />
              </button>

              <div className="flex-1 text-center">
                <span className="text-5xl font-black text-white">{quantity}</span>
                {ticketUnit && (
                  <span className="text-lg font-medium ml-2" style={{ color: 'rgba(255,255,255,0.5)' }}>{ticketUnit}</span>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= 100}
                className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold transition-all duration-200"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: quantity >= 100 ? 'rgba(255,255,255,0.2)' : 'white' }}
                onMouseEnter={e => quantity < 100 && (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* 프리셋 */}
            <div className="flex gap-2">
              {presets.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handleQuantityChange(p)}
                  className="flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-200"
                  style={quantity === p
                    ? { background: 'linear-gradient(135deg, #00D9FF 0%, #7C3AED 100%)', color: '#fff' }
                    : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}
                >
                  {ticketUnit ? `${p}${ticketUnit}` : p}
                </button>
              ))}
            </div>
          </div>

          {/* 총 금액 */}
          <div className="rounded-2xl p-4" style={{ background: 'rgba(0,217,255,0.08)', border: '1px solid rgba(0,217,255,0.2)' }}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>{t('totalAmount')}</span>
              <div className="text-right">
                <span className="text-2xl font-black" style={{ color: '#00D9FF' }}>{totalPrice}</span>
                <span className="text-sm font-bold ml-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{t('metaUnit')}</span>
              </div>
            </div>
          </div>

          {/* 에러 */}
          {(error || txError) && (
            <div className="flex items-start gap-2 p-3 rounded-xl" style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.2)' }}>
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#FF6B6B' }} />
              <p className="text-sm" style={{ color: '#FF6B6B' }}>{error || txError?.message}</p>
            </div>
          )}

          {/* 성공 */}
          {isSuccess && (
            <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <CheckCircle2 className="w-4 h-4" style={{ color: '#22C55E' }} />
              <p className="text-sm font-bold" style={{ color: '#22C55E' }}>{t('purchaseSuccess')}</p>
            </div>
          )}

          {/* 구매 버튼 */}
          <button
            type="button"
            onClick={handlePurchase}
            disabled={isBusy || ticketPrice === 0n}
            className="w-full py-4 rounded-2xl text-base font-black transition-all duration-300 flex items-center justify-center gap-2"
            style={{
              background: isBusy ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #00D9FF 0%, #7C3AED 100%)',
              color: '#fff',
              boxShadow: isBusy ? 'none' : '0 8px 30px rgba(0,217,255,0.3)',
              cursor: isBusy ? 'not-allowed' : 'pointer',
              opacity: isBusy ? 0.7 : 1,
            }}
            onMouseEnter={e => !isBusy && (e.currentTarget.style.transform = 'translateY(-2px)', e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,217,255,0.5)')}
            onMouseLeave={e => !isBusy && (e.currentTarget.style.transform = 'translateY(0)', e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,217,255,0.3)')}
          >
            {isConfirming ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> {t('confirming')}</>
            ) : isPending ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> {t('pending')}</>
            ) : isSuccess ? (
              <><CheckCircle2 className="w-5 h-5" /> {t('success')}</>
            ) : (
              <><Ticket className="w-5 h-5" /> {t('purchase', { price: totalPrice })}</>
            )}
          </button>

          <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>{t('maxTickets')}</p>
        </div>
      )}
    </div>
  );
}
