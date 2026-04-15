'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useState } from 'react';

// 공통 스타일 상수
const microLabel: React.CSSProperties = {
  fontFamily: "'Barlow Condensed', Arial, sans-serif",
  fontWeight: 700,
  fontSize: '0.63rem',
  letterSpacing: '1px',
  textTransform: 'uppercase',
  color: 'rgba(240, 240, 250, 0.35)',
  lineHeight: 0.94,
};

const sectionTitle: React.CSSProperties = {
  fontFamily: "'Barlow Condensed', Arial, sans-serif",
  fontWeight: 700,
  fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
  letterSpacing: '0.96px',
  textTransform: 'uppercase',
  color: '#f0f0fa',
  lineHeight: 1,
  marginTop: '0.5rem',
};

const bodyText: React.CSSProperties = {
  fontFamily: "'Barlow Condensed', Arial, sans-serif",
  fontSize: '0.9rem',
  letterSpacing: '0.3px',
  color: 'rgba(240, 240, 250, 0.5)',
  lineHeight: 1.8,
};

const cardStyle: React.CSSProperties = {
  padding: '1.5rem',
  border: '1px solid rgba(240, 240, 250, 0.08)',
  marginTop: '1.25rem',
};

const stepNumStyle: React.CSSProperties = {
  fontFamily: "'Barlow Condensed', Arial, sans-serif",
  fontWeight: 700,
  fontSize: '0.75rem',
  letterSpacing: '1px',
  color: 'rgba(240, 240, 250, 0.25)',
  minWidth: '2rem',
  paddingTop: '2px',
};

const stepTitleStyle: React.CSSProperties = {
  fontFamily: "'Barlow Condensed', Arial, sans-serif",
  fontWeight: 700,
  fontSize: '0.9rem',
  letterSpacing: '1.17px',
  textTransform: 'uppercase',
  color: '#f0f0fa',
  marginBottom: '0.35rem',
};

const dividerStyle: React.CSSProperties = {
  borderTop: '1px solid rgba(240, 240, 250, 0.08)',
  marginTop: '4rem',
  paddingTop: '4rem',
};

// 목차 항목 데이터
const tocItems = [
  { num: '01', href: '#what', label: 'MetaLotto란?' },
  { num: '02', href: '#start', label: '시작하기' },
  { num: '03', href: '#buy-meta', label: 'META 토큰 구매' },
  { num: '04', href: '#how', label: '참여 방법' },
  { num: '05', href: '#draw', label: '당첨 방식' },
  { num: '06', href: '#blockhash', label: '블록해시 랜덤' },
  { num: '07', href: '#prize', label: '상금 분배' },
  { num: '08', href: '#faq', label: 'FAQ' },
];

// FAQ 데이터
const faqData = [
  {
    q: '당첨금은 어떻게 받나요?',
    a: '당첨 시 스마트 컨트랙트가 자동으로 지갑에 META를 전송합니다. 별도의 클레임(청구) 절차가 필요 없습니다. 만약 전송이 실패하면 수동 인출(Withdraw) 기능을 사용할 수 있습니다.',
  },
  {
    q: '여러 장 구매하면 유리한가요?',
    a: '네, 티켓을 많이 살수록 당첨 확률이 높아집니다. 5장을 사면 총 1,000장 중 5장이 내 티켓이므로 0.5%의 당첨 확률을 갖습니다. 최대 100장까지 구매 가능합니다.',
  },
  {
    q: '추첨 결과를 조작할 수 있나요?',
    a: '사실상 불가능합니다. 미래 블록의 해시값을 사용하기 때문에 누구도 — 운영자 포함 — 결과를 예측하거나 조작할 수 없습니다. 또한 모든 코드가 온체인에 공개되어 누구나 검증할 수 있습니다.',
  },
  {
    q: '가스비는 얼마나 드나요?',
    a: '메타디움 블록체인은 가스비가 매우 저렴합니다. 티켓 구매 시 가스비는 약 0.001 META 미만으로, 사실상 무시할 수 있는 수준입니다.',
  },
  {
    q: '라운드가 취소될 수 있나요?',
    a: '네, 극히 드문 경우지만 블록해시가 만료(256블록)되어 추첨이 불가능한 경우 라운드가 취소될 수 있습니다. 이 경우 모든 참여자에게 전액 환불됩니다.',
  },
  {
    q: '모바일에서도 사용 가능한가요?',
    a: 'MetaLotto는 반응형 웹앱으로 모바일 브라우저에서도 이용 가능합니다. MetaMask 모바일 앱의 내장 브라우저를 사용하면 가장 편리합니다.',
  },
  {
    q: '컨트랙트 주소는 어디서 확인하나요?',
    a: 'MetaLotto 사이트 하단의 "Contract" 링크를 클릭하면 메타디움 익스플로러에서 스마트 컨트랙트 코드와 모든 거래 내역을 확인할 수 있습니다.',
  },
];

// 티켓 시각화 컴포넌트 (100장 그리드)
function TicketVisualization() {
  // 예시: 티켓 7, 23, 45, 61, 82가 내 티켓, 당첨은 45
  const myTickets = new Set([7, 23, 45, 61, 82]);
  const winnerTicket = 45;

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
        {Array.from({ length: 100 }, (_, i) => {
          const ticketNum = i + 1;
          const isWinner = ticketNum === winnerTicket;
          const isMine = myTickets.has(ticketNum);
          let bgColor = 'rgba(240, 240, 250, 0.05)';
          let borderColor = 'rgba(240, 240, 250, 0.08)';
          let color = 'rgba(240, 240, 250, 0.25)';
          let transform = 'none';
          if (isWinner) {
            bgColor = 'rgba(16, 185, 129, 0.2)';
            borderColor = 'rgba(16, 185, 129, 0.6)';
            color = '#10b981';
            transform = 'scale(1.15)';
          } else if (isMine) {
            bgColor = 'rgba(240, 240, 250, 0.12)';
            borderColor = 'rgba(240, 240, 250, 0.4)';
            color = '#f0f0fa';
          }
          return (
            <div
              key={ticketNum}
              style={{
                width: '20px',
                height: '20px',
                border: `1px solid ${borderColor}`,
                background: bgColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '6px',
                fontFamily: "'Barlow Condensed', Arial, sans-serif",
                fontWeight: 700,
                color,
                transform,
                transition: 'transform 0.2s',
              }}
            >
              {ticketNum}
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
        <span style={{ ...bodyText, fontSize: '0.75rem' }}>
          <span style={{ color: 'rgba(240, 240, 250, 0.25)' }}>■ </span>일반 티켓
        </span>
        <span style={{ ...bodyText, fontSize: '0.75rem' }}>
          <span style={{ color: '#f0f0fa' }}>■ </span>내 티켓 (5장)
        </span>
        <span style={{ ...bodyText, fontSize: '0.75rem' }}>
          <span style={{ color: '#10b981' }}>■ </span>당첨 티켓
        </span>
      </div>
    </div>
  );
}

// FAQ 아코디언 아이템
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ marginTop: '0.75rem' }}>
      <button
        onClick={() => setOpen(prev => !prev)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          padding: '1rem 1.25rem',
          border: '1px solid rgba(240, 240, 250, 0.08)',
          background: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'border-color 0.2s',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(240, 240, 250, 0.25)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(240, 240, 250, 0.08)'; }}
      >
        <span
          style={{
            fontFamily: "'Barlow Condensed', Arial, sans-serif",
            fontWeight: 700,
            fontSize: '0.63rem',
            letterSpacing: '1px',
            color: 'rgba(240, 240, 250, 0.35)',
            flexShrink: 0,
          }}
        >
          Q
        </span>
        <span
          style={{
            fontFamily: "'Barlow Condensed', Arial, sans-serif",
            fontWeight: 700,
            fontSize: '0.9rem',
            letterSpacing: '0.5px',
            color: '#f0f0fa',
            flex: 1,
          }}
        >
          {q}
        </span>
        <span
          style={{
            fontFamily: "'Barlow Condensed', Arial, sans-serif",
            fontWeight: 700,
            fontSize: '1rem',
            color: 'rgba(240, 240, 250, 0.35)',
            flexShrink: 0,
            transition: 'transform 0.2s',
            transform: open ? 'rotate(45deg)' : 'none',
            display: 'inline-block',
          }}
        >
          +
        </span>
      </button>
      {open && (
        <div
          style={{
            padding: '1rem 1.25rem 1rem 3.25rem',
            border: '1px solid rgba(240, 240, 250, 0.08)',
            borderTop: 'none',
            ...bodyText,
          }}
        >
          {a}
        </div>
      )}
    </div>
  );
}

export default function ManualPage() {
  return (
    <div className="min-h-screen" style={{ background: '#000000' }}>
      <Header />

      <main className="container mx-auto px-4 sm:px-6 py-8">

        {/* 페이지 헤더 */}
        <div style={{ marginBottom: '3rem', paddingBottom: '3rem', borderBottom: '1px solid rgba(240, 240, 250, 0.08)' }}>
          <p style={microLabel}>USER MANUAL</p>
          <h1
            style={{
              fontFamily: "'Barlow Condensed', Arial, sans-serif",
              fontWeight: 700,
              fontSize: 'clamp(2rem, 6vw, 3.5rem)',
              letterSpacing: '0.96px',
              textTransform: 'uppercase',
              color: '#f0f0fa',
              lineHeight: 1,
              marginTop: '0.5rem',
              marginBottom: '0.75rem',
            }}
          >
            사용자 매뉴얼
          </h1>
          <p style={{ ...bodyText, fontSize: '0.875rem' }}>
            메타디움 블록체인 기반 온체인 복권 서비스 가이드
          </p>
        </div>

        {/* TOC */}
        <nav style={{ marginBottom: '4rem' }}>
          <p style={microLabel}>목차</p>
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
            style={{ marginTop: '1rem' }}
          >
            {tocItems.map(item => (
              <a
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  border: '1px solid rgba(240, 240, 250, 0.08)',
                  textDecoration: 'none',
                  transition: 'border-color 0.2s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(240, 240, 250, 0.25)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(240, 240, 250, 0.08)'; }}
              >
                <span
                  style={{
                    fontFamily: "'Barlow Condensed', Arial, sans-serif",
                    fontWeight: 700,
                    fontSize: '0.63rem',
                    letterSpacing: '1px',
                    color: 'rgba(240, 240, 250, 0.25)',
                    flexShrink: 0,
                  }}
                >
                  {item.num}
                </span>
                <span
                  style={{
                    fontFamily: "'Barlow Condensed', Arial, sans-serif",
                    fontWeight: 700,
                    fontSize: '0.81rem',
                    letterSpacing: '0.5px',
                    color: 'rgba(240, 240, 250, 0.6)',
                  }}
                >
                  {item.label}
                </span>
              </a>
            ))}
          </div>
        </nav>

        {/* 1. MetaLotto란? */}
        <section id="what">
          <p style={microLabel}>01 — 소개</p>
          <h2 style={sectionTitle}>MetaLotto란?</h2>
          <p style={{ ...bodyText, marginTop: '1rem' }}>
            MetaLotto는 메타디움 블록체인 위에서 운영되는 완전 투명한 온체인 복권(래플) 시스템입니다.
            모든 과정이 스마트 컨트랙트로 자동 실행되며, 추첨 결과는 블록해시를 통해 누구나 검증할 수 있습니다.
            운영자도 결과를 조작할 수 없는 신뢰할 수 있는 시스템입니다.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" style={{ marginTop: '1.5rem' }}>
            {[
              { num: '01', title: '투명한 추첨', desc: '블록해시 기반 랜덤으로 조작 불가' },
              { num: '02', title: '6시간 주기', desc: '하루 4회 추첨으로 빠른 결과' },
              { num: '03', title: '90% 당첨금', desc: '풀의 90%가 당첨자에게' },
            ].map(item => (
              <div
                key={item.num}
                style={{ ...cardStyle, marginTop: 0 }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(240, 240, 250, 0.25)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(240, 240, 250, 0.08)'; }}
              >
                <p style={{ ...microLabel, marginBottom: '0.75rem' }}>{item.num}</p>
                <h3
                  style={{
                    fontFamily: "'Barlow Condensed', Arial, sans-serif",
                    fontWeight: 700,
                    fontSize: '1rem',
                    letterSpacing: '1.17px',
                    textTransform: 'uppercase',
                    color: '#f0f0fa',
                    marginBottom: '0.5rem',
                  }}
                >
                  {item.title}
                </h3>
                <p style={{ ...bodyText, fontSize: '0.81rem' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 2. 시작하기 */}
        <section id="start" style={dividerStyle}>
          <p style={microLabel}>02 — 시작하기</p>
          <h2 style={sectionTitle}>지갑 설정하기</h2>
          <p style={{ ...bodyText, marginTop: '1rem' }}>
            MetaLotto를 사용하려면 MetaMask 지갑에 메타디움 네트워크를 추가해야 합니다.
          </p>

          <div style={{ display: 'grid', gap: '0.75rem', marginTop: '1.5rem' }}>
            {[
              { num: '01', title: 'MetaMask 설치', desc: 'Chrome 웹 스토어에서 MetaMask 확장 프로그램을 설치합니다. 모바일의 경우 MetaMask 앱을 다운로드하세요.' },
              { num: '02', title: '메타디움 네트워크 추가', desc: 'MetaMask에서 네트워크를 추가합니다. 아래 정보를 입력하세요.' },
              { num: '03', title: '네트워크 전환', desc: 'MetaMask 상단에서 네트워크를 "Metadium Mainnet"으로 전환합니다. MetaLotto 사이트에 접속하면 자동 전환을 요청할 수도 있습니다.' },
            ].map(step => (
              <div
                key={step.num}
                style={{
                  display: 'flex',
                  gap: '1.25rem',
                  padding: '1.25rem',
                  border: '1px solid rgba(240, 240, 250, 0.08)',
                }}
              >
                <span style={stepNumStyle}>{step.num}</span>
                <div>
                  <h4 style={stepTitleStyle}>{step.title}</h4>
                  <p style={{ ...bodyText, fontSize: '0.81rem' }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 네트워크 설정 카드 */}
          <div style={cardStyle}>
            <h3
              style={{
                fontFamily: "'Barlow Condensed', Arial, sans-serif",
                fontWeight: 700,
                fontSize: '0.81rem',
                letterSpacing: '1.17px',
                textTransform: 'uppercase',
                color: '#f0f0fa',
                marginBottom: '1rem',
              }}
            >
              메타디움 네트워크 설정
            </h3>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {[
                { label: 'Network Name', value: 'Metadium Mainnet', mono: false },
                { label: 'RPC URL', value: 'https://api.metadium.com/prod', mono: true },
                { label: 'Chain ID', value: '11', mono: false },
                { label: 'Symbol', value: 'META', mono: false },
                { label: 'Explorer', value: 'https://explorer.metadium.com', mono: true },
              ].map(row => (
                <div
                  key={row.label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.6rem 0.875rem',
                    background: 'rgba(240, 240, 250, 0.03)',
                    gap: '1rem',
                  }}
                >
                  <span style={{ ...bodyText, fontSize: '0.75rem', flexShrink: 0 }}>{row.label}</span>
                  <span
                    style={{
                      fontFamily: row.mono ? "'Barlow Condensed', monospace, Arial" : "'Barlow Condensed', Arial, sans-serif",
                      fontWeight: 700,
                      fontSize: row.mono ? '0.75rem' : '0.81rem',
                      letterSpacing: row.mono ? '0' : '0.5px',
                      color: '#f0f0fa',
                      textAlign: 'right',
                      wordBreak: 'break-all',
                    }}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. META 토큰 구매 */}
        <section id="buy-meta" style={dividerStyle}>
          <p style={microLabel}>03 — META 토큰 구매</p>
          <h2 style={sectionTitle}>META 토큰 구매하기</h2>
          <p style={{ ...bodyText, marginTop: '1rem' }}>
            MetaLotto에 참여하려면 META 토큰이 필요합니다. 아래 거래소에서 META를 구매할 수 있습니다.
          </p>

          {/* 거래소 테이블 */}
          <div style={cardStyle}>
            <h3
              style={{
                fontFamily: "'Barlow Condensed', Arial, sans-serif",
                fontWeight: 700,
                fontSize: '0.81rem',
                letterSpacing: '1.17px',
                textTransform: 'uppercase',
                color: '#f0f0fa',
                marginBottom: '1rem',
              }}
            >
              META 거래 가능 거래소
            </h3>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 2fr',
                  gap: '0.5rem',
                  padding: '0.5rem 0.875rem',
                  borderBottom: '1px solid rgba(240, 240, 250, 0.08)',
                }}
              >
                {['거래소', '거래쌍', '비고'].map(h => (
                  <span key={h} style={{ ...microLabel, color: 'rgba(240, 240, 250, 0.25)' }}>{h}</span>
                ))}
              </div>
              {[
                { name: 'Coinone', pair: 'META/KRW', note: '한국 원화 직거래' },
                { name: 'Gate.io', pair: 'META/USDT', note: '글로벌 거래소' },
                { name: 'MEXC', pair: 'META/USDT', note: '글로벌 거래소' },
              ].map(row => (
                <div
                  key={row.name}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 2fr',
                    gap: '0.5rem',
                    padding: '0.6rem 0.875rem',
                    borderBottom: '1px solid rgba(240, 240, 250, 0.04)',
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Barlow Condensed', Arial, sans-serif",
                      fontWeight: 700,
                      fontSize: '0.81rem',
                      color: '#f0f0fa',
                    }}
                  >
                    {row.name}
                  </span>
                  <span style={{ ...bodyText, fontSize: '0.81rem', color: 'rgba(240, 240, 250, 0.7)' }}>{row.pair}</span>
                  <span style={{ ...bodyText, fontSize: '0.75rem' }}>{row.note}</span>
                </div>
              ))}
            </div>
          </div>

          <h3
            style={{
              fontFamily: "'Barlow Condensed', Arial, sans-serif",
              fontWeight: 700,
              fontSize: '1rem',
              letterSpacing: '1.17px',
              textTransform: 'uppercase',
              color: '#f0f0fa',
              marginTop: '2rem',
              marginBottom: '1rem',
            }}
          >
            거래소에서 META 구매 후 지갑으로 전송하기
          </h3>

          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {[
              { num: '01', title: '거래소 가입 및 KYC', desc: '위 거래소 중 하나에 가입하고 본인인증(KYC)을 완료합니다.' },
              { num: '02', title: '원화/USDT 입금', desc: 'Coinone의 경우 원화를 입금합니다. Gate.io/MEXC의 경우 USDT를 입금합니다.' },
              { num: '03', title: 'META 구매', desc: '거래소에서 META를 시장가 또는 지정가로 구매합니다. 티켓 1장에 100 META가 필요합니다.' },
              { num: '04', title: 'MetaMask로 출금', desc: '거래소 출금 메뉴에서 META를 선택하고, MetaMask 지갑 주소를 입력한 후 출금합니다. 네트워크는 반드시 "Metadium"을 선택하세요.' },
            ].map(step => (
              <div
                key={step.num}
                style={{
                  display: 'flex',
                  gap: '1.25rem',
                  padding: '1.25rem',
                  border: '1px solid rgba(240, 240, 250, 0.08)',
                }}
              >
                <span style={stepNumStyle}>{step.num}</span>
                <div>
                  <h4 style={stepTitleStyle}>{step.title}</h4>
                  <p style={{ ...bodyText, fontSize: '0.81rem' }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 경고 박스 */}
          <div
            style={{
              marginTop: '1.25rem',
              padding: '1.25rem',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              background: 'rgba(245, 158, 11, 0.04)',
            }}
          >
            <p
              style={{
                fontFamily: "'Barlow Condensed', Arial, sans-serif",
                fontWeight: 700,
                fontSize: '0.75rem',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                color: 'rgba(245, 158, 11, 0.9)',
                marginBottom: '0.5rem',
              }}
            >
              주의사항
            </p>
            <p style={{ ...bodyText, fontSize: '0.81rem' }}>
              출금 시 네트워크를 반드시 Metadium (메인넷)으로 선택하세요.
              ERC-20(이더리움) 네트워크로 보내면 토큰을 잃을 수 있습니다.
              소량을 먼저 테스트 전송하는 것을 권장합니다.
            </p>
          </div>
        </section>

        {/* 4. 참여 방법 */}
        <section id="how" style={dividerStyle}>
          <p style={microLabel}>04 — 참여 방법</p>
          <h2 style={sectionTitle}>복권 참여하기</h2>

          {/* 플로우 다이어그램 */}
          <div
            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
            style={{ marginTop: '1.5rem' }}
          >
            {[
              { num: '01', title: '지갑 연결', desc: 'MetaMask 연결' },
              { num: '02', title: '티켓 구매', desc: '100 META / 장' },
              { num: '03', title: '추첨 대기', desc: '6시간마다 자동' },
              { num: '04', title: '상금 수령', desc: '자동 전송' },
            ].map(node => (
              <div
                key={node.num}
                style={{
                  padding: '1.25rem',
                  border: '1px solid rgba(240, 240, 250, 0.08)',
                  textAlign: 'center',
                }}
              >
                <p style={{ ...microLabel, marginBottom: '0.5rem' }}>{node.num}</p>
                <h4
                  style={{
                    fontFamily: "'Barlow Condensed', Arial, sans-serif",
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    letterSpacing: '1.17px',
                    textTransform: 'uppercase',
                    color: '#f0f0fa',
                    marginBottom: '0.25rem',
                  }}
                >
                  {node.title}
                </h4>
                <p style={{ ...bodyText, fontSize: '0.75rem' }}>{node.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gap: '0.75rem', marginTop: '1.5rem' }}>
            {[
              { num: '01', title: 'MetaLotto 사이트 접속 및 지갑 연결', desc: 'MetaLotto 웹사이트에 접속한 후 "Connect Wallet" 버튼을 클릭합니다. MetaMask가 자동으로 열리며 연결을 승인하면 됩니다.' },
              { num: '02', title: '티켓 수량 선택', desc: '구매할 티켓 수량을 선택합니다(1~100장). 티켓 1장당 100 META입니다. 많이 구매할수록 당첨 확률이 올라갑니다.' },
              { num: '03', title: '구매 확인', desc: '"티켓 구매" 버튼을 누르면 MetaMask 트랜잭션 확인 창이 뜹니다. 가스비를 확인하고 승인하세요. 트랜잭션이 완료되면 티켓 번호가 자동으로 부여됩니다.' },
              { num: '04', title: '결과 확인', desc: '라운드 종료 후 "History" 탭에서 추첨 결과를 확인할 수 있습니다. 당첨 시 상금이 자동으로 지갑에 전송됩니다.' },
            ].map(step => (
              <div
                key={step.num}
                style={{
                  display: 'flex',
                  gap: '1.25rem',
                  padding: '1.25rem',
                  border: '1px solid rgba(240, 240, 250, 0.08)',
                }}
              >
                <span style={stepNumStyle}>{step.num}</span>
                <div>
                  <h4 style={stepTitleStyle}>{step.title}</h4>
                  <p style={{ ...bodyText, fontSize: '0.81rem' }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. 당첨 방식 */}
        <section id="draw" style={dividerStyle}>
          <p style={microLabel}>05 — 당첨 방식</p>
          <h2 style={sectionTitle}>래플(Raffle) 방식 설명</h2>
          <p style={{ ...bodyText, marginTop: '1rem' }}>
            MetaLotto는 로또처럼 번호를 선택하는 방식이 아닙니다. 래플(Raffle) 방식으로,
            티켓을 구매하면 고유한 순번이 자동으로 부여되고, 블록해시에서 생성된 랜덤 숫자로
            당첨 티켓을 선정합니다.
          </p>

          {/* 핵심 원리 */}
          <div
            style={{
              marginTop: '1.25rem',
              padding: '1.25rem',
              border: '1px solid rgba(240, 240, 250, 0.12)',
              background: 'rgba(240, 240, 250, 0.02)',
            }}
          >
            <p
              style={{
                fontFamily: "'Barlow Condensed', Arial, sans-serif",
                fontWeight: 700,
                fontSize: '0.75rem',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                color: 'rgba(240, 240, 250, 0.6)',
                marginBottom: '0.5rem',
              }}
            >
              핵심 원리
            </p>
            <p style={{ ...bodyText, fontSize: '0.81rem', fontFamily: "'Barlow Condensed', monospace, Arial" }}>
              티켓 구매 → 자동 번호 부여(#001, #002...) → 블록해시로 랜덤 숫자 생성 → 당첨번호 = 랜덤시드 % 총티켓수 → 해당 번호 티켓 보유자가 당첨!
            </p>
          </div>

          <h3
            style={{
              fontFamily: "'Barlow Condensed', Arial, sans-serif",
              fontWeight: 700,
              fontSize: '1rem',
              letterSpacing: '1.17px',
              textTransform: 'uppercase',
              color: '#f0f0fa',
              marginTop: '2rem',
              marginBottom: '0.5rem',
            }}
          >
            예시: 100장 중 당첨자 선정
          </h3>
          <p style={{ ...bodyText, fontSize: '0.81rem' }}>
            아래 시각화에서 흰색은 내 티켓(5장), 초록색은 당첨 티켓입니다.
          </p>
          <TicketVisualization />

          <div
            style={{
              marginTop: '1.25rem',
              padding: '1.25rem',
              border: '1px solid rgba(240, 240, 250, 0.08)',
            }}
          >
            <p
              style={{
                fontFamily: "'Barlow Condensed', Arial, sans-serif",
                fontWeight: 700,
                fontSize: '0.75rem',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                color: 'rgba(240, 240, 250, 0.6)',
                marginBottom: '0.5rem',
              }}
            >
              왜 당첨자가 정확히 1명인가요?
            </p>
            <p style={{ ...bodyText, fontSize: '0.81rem' }}>
              나머지(%) 연산은 반드시 0 ~ (총티켓수-1) 사이의 정수 하나를 반환합니다.
              각 티켓은 고유한 인덱스를 가지므로, 이 연산 결과와 일치하는 티켓은 수학적으로 정확히 1개입니다.
              로또처럼 같은 번호를 여러 사람이 선택할 수 없기 때문에, 당첨자 중복이 구조적으로 불가능합니다.
            </p>
          </div>
        </section>

        {/* 6. 블록해시 랜덤 */}
        <section id="blockhash" style={dividerStyle}>
          <p style={microLabel}>06 — 블록해시 랜덤</p>
          <h2 style={sectionTitle}>블록해시 랜덤은 어떻게 작동하나요?</h2>

          <div style={{ display: 'grid', gap: '0.75rem', marginTop: '1.5rem' }}>
            {[
              {
                num: '01',
                title: '시드(Seed) 축적',
                desc: '티켓을 구매할 때마다 구매자의 지갑 주소, 구매 시점의 블록 번호, 타임스탬프 등이 해시 함수를 통해 시드(seed) 값에 누적됩니다. 이 시드는 모든 참여자의 구매 행위가 반영되어 있어 누구도 예측할 수 없습니다.',
              },
              {
                num: '02',
                title: '미래 블록 참조',
                desc: '라운드가 종료된 시점의 블록 이후, 아직 생성되지 않은 미래 블록 3개의 해시값을 사용합니다. 이 값은 해당 블록이 채굴되기 전까지 누구도 알 수 없으므로, 마이너를 포함한 그 누구도 결과를 조작할 수 없습니다.',
              },
              {
                num: '03',
                title: 'XOR 조합으로 최종 랜덤 생성',
                desc: '3개의 블록해시와 축적된 시드를 XOR 연산으로 조합하여 최종 랜덤 값을 생성합니다. 이 과정은 스마트 컨트랙트에 투명하게 기록되며, 누구든 블록체인 익스플로러에서 검증할 수 있습니다.',
              },
            ].map(step => (
              <div
                key={step.num}
                style={{
                  display: 'flex',
                  gap: '1.25rem',
                  padding: '1.25rem',
                  border: '1px solid rgba(240, 240, 250, 0.08)',
                }}
              >
                <span style={stepNumStyle}>{step.num}</span>
                <div>
                  <h4 style={stepTitleStyle}>{step.title}</h4>
                  <p style={{ ...bodyText, fontSize: '0.81rem' }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 공식 카드 */}
          <div style={{ ...cardStyle, textAlign: 'center', padding: '2rem' }}>
            <p style={{ ...microLabel, marginBottom: '1rem' }}>최종 랜덤 값 계산 공식</p>
            <div
              style={{
                fontFamily: "'Barlow Condensed', monospace, Arial",
                fontWeight: 700,
                fontSize: '0.9rem',
                letterSpacing: '0.5px',
                color: 'rgba(240, 240, 250, 0.8)',
                padding: '1rem 1.5rem',
                background: 'rgba(240, 240, 250, 0.03)',
                border: '1px solid rgba(240, 240, 250, 0.08)',
                overflowX: 'auto',
                whiteSpace: 'nowrap',
              }}
            >
              finalSeed = seed XOR blockhash(N+1) XOR blockhash(N+2) XOR blockhash(N+3)
            </div>
            <div
              style={{
                fontFamily: "'Barlow Condensed', monospace, Arial",
                fontSize: '0.81rem',
                color: 'rgba(240, 240, 250, 0.5)',
                marginTop: '0.75rem',
              }}
            >
              winner = finalSeed % totalTicketCount
            </div>
          </div>
        </section>

        {/* 7. 상금 분배 */}
        <section id="prize" style={dividerStyle}>
          <p style={microLabel}>07 — 상금 분배</p>
          <h2 style={sectionTitle}>상금은 어떻게 분배되나요?</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" style={{ marginTop: '1.5rem' }}>
            {[
              { pct: '90%', label: '당첨자에게 지급', borderColor: 'rgba(240, 240, 250, 0.2)', color: '#f0f0fa' },
              { pct: '5%', label: '커뮤니티 펀드', borderColor: 'rgba(16, 185, 129, 0.3)', color: '#10b981' },
              { pct: '5%', label: '운영비', borderColor: 'rgba(245, 158, 11, 0.3)', color: 'rgba(245, 158, 11, 0.9)' },
            ].map(item => (
              <div
                key={item.pct + item.label}
                style={{
                  padding: '1.5rem',
                  border: `1px solid ${item.borderColor}`,
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontFamily: "'Barlow Condensed', Arial, sans-serif",
                    fontWeight: 700,
                    fontSize: 'clamp(2rem, 5vw, 2.5rem)',
                    color: item.color,
                    letterSpacing: '1px',
                    lineHeight: 1,
                    marginBottom: '0.5rem',
                  }}
                >
                  {item.pct}
                </div>
                <p style={{ ...bodyText, fontSize: '0.81rem' }}>{item.label}</p>
              </div>
            ))}
          </div>

          {/* 상금 계산 예시 */}
          <div style={cardStyle}>
            <h3
              style={{
                fontFamily: "'Barlow Condensed', Arial, sans-serif",
                fontWeight: 700,
                fontSize: '0.81rem',
                letterSpacing: '1.17px',
                textTransform: 'uppercase',
                color: '#f0f0fa',
                marginBottom: '1rem',
              }}
            >
              상금 계산 예시
            </h3>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {[
                { left: '참여자 100명 × 1장', right: '당첨금 9,000 META' },
                { left: '참여자 500명 × 1장', right: '당첨금 45,000 META' },
                { left: '참여자 1,000명 × 1장', right: '당첨금 90,000 META' },
              ].map(row => (
                <div
                  key={row.left}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.6rem 0.875rem',
                    background: 'rgba(240, 240, 250, 0.03)',
                    gap: '1rem',
                  }}
                >
                  <span style={{ ...bodyText, fontSize: '0.81rem' }}>{row.left}</span>
                  <span
                    style={{
                      fontFamily: "'Barlow Condensed', Arial, sans-serif",
                      fontWeight: 700,
                      fontSize: '0.81rem',
                      color: '#f0f0fa',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    → {row.right}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 8. FAQ */}
        <section id="faq" style={dividerStyle}>
          <p style={microLabel}>08 — FAQ</p>
          <h2 style={sectionTitle}>자주 묻는 질문</h2>

          <div style={{ marginTop: '1.5rem' }}>
            {faqData.map((item, i) => (
              <FaqItem key={i} q={item.q} a={item.a} />
            ))}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
