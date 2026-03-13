/**
 * 유틸리티 함수
 */

/**
 * 이더 단위 포맷팅 (wei → ether)
 */
export function formatEther(wei: bigint): string {
  const num = Number(wei) / 1e18;
  return num.toFixed(4);
}

/**
 * 주소 마스킹 (0x1234...5678)
 */
export function maskAddress(address: string, chars: number = 4): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * 초를 시간:분:초로 포맷팅
 */
export function formatTime(seconds: bigint | number): string {
  const totalSeconds = Number(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  return [hours, minutes, secs]
    .map((value) => value.toString().padStart(2, '0'))
    .join(':');
}

/**
 * 라운드 상태 텍스트 반환
 */
export function getStatusText(status: number): string {
  switch (status) {
    case 0:
      return 'Open';
    case 1:
      return 'Closing';
    case 2:
      return 'Completed';
    case 3:
      return 'Cancelled';
    default:
      return 'Unknown';
  }
}

/**
 * 라운드 상태에 따른 Tailwind 클래스 반환
 */
export function getStatusColor(status: number): string {
  switch (status) {
    case 0:
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 1:
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case 2:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    case 3:
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
}
