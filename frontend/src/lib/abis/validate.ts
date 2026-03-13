/**
 * MetaLotto ABI Validation Script
 *
 * 이 스크립트는 컨트랙트 ABI와 TypeScript 타입의 일치성을 검증합니다.
 * 개발 시 타입 일치성을 확인하는 용도로 사용할 수 있습니다.
 */

import { META_LOTTO_ABI } from './types';
import type { Abi } from 'viem';

/**
 * ABI에서 함수 목록 추출
 */
export function getAbiFunctions(abi: Abi): string[] {
  return abi
    .filter((item) => item.type === 'function')
    .map((item) => (item as { name: string }).name);
}

/**
 * ABI에서 이벤트 목록 추출
 */
export function getAbiEvents(abi: Abi): string[] {
  return abi
    .filter((item) => item.type === 'event')
    .map((item) => (item as { name: string }).name);
}

/**
 * ABI에서 읽기 함수 목록 추출 (view/pure)
 */
export function getReadFunctions(abi: Abi): string[] {
  return abi
    .filter(
      (item) =>
        item.type === 'function' &&
        ((item as { stateMutability?: string }).stateMutability === 'view' ||
          (item as { stateMutability?: string }).stateMutability === 'pure')
    )
    .map((item) => (item as { name: string }).name);
}

/**
 * ABI에서 쓰기 함수 목록 추출 (nonpayable/payable)
 */
export function getWriteFunctions(abi: Abi): string[] {
  return abi
    .filter(
      (item) =>
        item.type === 'function' &&
        ((item as { stateMutability?: string }).stateMutability === 'nonpayable' ||
          (item as { stateMutability?: string }).stateMutability === 'payable')
    )
    .map((item) => (item as { name: string }).name);
}

/**
 * ABI 유효성 검증
 */
export function validateAbi(abi: Abi): {
  isValid: boolean;
  functions: string[];
  events: string[];
  readFunctions: string[];
  writeFunctions: string[];
  errors: string[];
} {
  const errors: string[] = [];

  // ABI가 배열인지 확인
  if (!Array.isArray(abi)) {
    errors.push('ABI is not an array');
  }

  // 함수 및 이벤트 이름 중복 확인
  const functions = getAbiFunctions(abi);
  const events = getAbiEvents(abi);
  const functionNames = new Set(functions);
  const eventNames = new Set(events);

  if (functions.length !== functionNames.size) {
    errors.push('Duplicate function names found');
  }

  if (events.length !== eventNames.size) {
    errors.push('Duplicate event names found');
  }

  // 필수 함수 존재 여부 확인
  const requiredFunctions = [
    'getCurrentRound',
    'buyTickets',
    'closeRound',
    'drawWinner',
    'getTimeRemaining',
  ];

  requiredFunctions.forEach((funcName) => {
    if (!functionNames.has(funcName)) {
      errors.push(`Required function '${funcName}' not found in ABI`);
    }
  });

  // 필수 이벤트 존재 여부 확인
  const requiredEvents = [
    'RoundStarted',
    'TicketPurchased',
    'WinnerDrawn',
    'RoundCancelled',
  ];

  requiredEvents.forEach((eventName) => {
    if (!eventNames.has(eventName)) {
      errors.push(`Required event '${eventName}' not found in ABI`);
    }
  });

  return {
    isValid: errors.length === 0,
    functions,
    events,
    readFunctions: getReadFunctions(abi),
    writeFunctions: getWriteFunctions(abi),
    errors,
  };
}

/**
 * 스크립트 실행 시 유효성 검증 결과 출력
 */
if (require.main === module) {
  const result = validateAbi(META_LOTTO_ABI);

  console.log('=== MetaLotto ABI Validation ===\n');
  console.log(`Status: ${result.isValid ? 'PASSED' : 'FAILED'}`);
  console.log(`\nTotal Functions: ${result.functions.length}`);
  console.log(`Read Functions: ${result.readFunctions.length}`);
  console.log(`Write Functions: ${result.writeFunctions.length}`);
  console.log(`Total Events: ${result.events.length}`);

  if (result.errors.length > 0) {
    console.log('\n=== Errors ===');
    result.errors.forEach((error) => console.error(`- ${error}`));
  }

  if (!result.isValid) {
    process.exit(1);
  }
}

export { META_LOTTO_ABI };
