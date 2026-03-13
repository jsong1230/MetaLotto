/**
 * Smart Contract Types and ABI
 *
 * This file contains TypeScript types and ABI for MetaLotto smart contracts.
 * The actual ABI will be populated after contract compilation.
 */

import { Abi } from 'viem';

// Contract Address from environment
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

// MetaLotto Contract ABI (to be populated after contract compilation)
export const META_LOTTO_ABI: Abi = [
  // Sample ABI entries - will be replaced with actual contract ABI
  {
    type: 'function',
    name: 'buyTicket',
    stateMutability: 'payable',
    inputs: [
      {
        name: 'numbers',
        type: 'uint8[]',
      },
    ],
    outputs: [
      {
        name: 'ticketId',
        type: 'uint256',
      },
    ],
  },
  {
    type: 'function',
    name: 'drawNumbers',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [
      {
        name: 'winningNumbers',
        type: 'uint8[]',
      },
    ],
  },
  {
    type: 'function',
    name: 'claimPrize',
    stateMutability: 'nonpayable',
    inputs: [
      {
        name: 'ticketId',
        type: 'uint256',
      },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'getTicket',
    stateMutability: 'view',
    inputs: [
      {
        name: 'ticketId',
        type: 'uint256',
      },
    ],
    outputs: [
      {
        type: 'tuple',
        components: [
          { name: 'owner', type: 'address' },
          { name: 'numbers', type: 'uint8[]' },
          { name: 'drawId', type: 'uint256' },
          { name: 'prize', type: 'uint256' },
          { name: 'claimed', type: 'bool' },
        ],
      },
    ],
  },
  {
    type: 'function',
    name: 'getCurrentDraw',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      {
        type: 'tuple',
        components: [
          { name: 'id', type: 'uint256' },
          { name: 'startTime', type: 'uint256' },
          { name: 'endTime', type: 'uint256' },
          { name: 'winningNumbers', type: 'uint8[]' },
          { name: 'winningPrize', type: 'uint256' },
        ],
      },
    ],
  },
  {
    type: 'event',
    name: 'TicketPurchased',
    inputs: [
      { name: 'ticketId', type: 'uint256', indexed: true },
      { name: 'owner', type: 'address', indexed: true },
      { name: 'numbers', type: 'uint8[]', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'DrawCompleted',
    inputs: [
      { name: 'drawId', type: 'uint256', indexed: true },
      { name: 'winningNumbers', type: 'uint8[]', indexed: false },
      { name: 'winningPrize', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'PrizeClaimed',
    inputs: [
      { name: 'ticketId', type: 'uint256', indexed: true },
      { name: 'owner', type: 'address', indexed: true },
      { name: 'prize', type: 'uint256', indexed: false },
    ],
  },
];

// TypeScript types for contract data
export interface Ticket {
  owner: `0x${string}`;
  numbers: number[];
  drawId: bigint;
  prize: bigint;
  claimed: boolean;
}

export interface Draw {
  id: bigint;
  startTime: bigint;
  endTime: bigint;
  winningNumbers: number[];
  winningPrize: bigint;
}

export interface LotteryStats {
  currentDrawId: bigint;
  totalTickets: bigint;
  totalPrizePool: bigint;
  nextDrawTime: bigint;
}

// Contract function types
export type BuyTicketParams = {
  numbers: number[];
};

export type ClaimPrizeParams = {
  ticketId: bigint;
};

// Contract event types
export interface TicketPurchasedEvent {
  ticketId: bigint;
  owner: `0x${string}`;
  numbers: number[];
}

export interface DrawCompletedEvent {
  drawId: bigint;
  winningNumbers: number[];
  winningPrize: bigint;
}

export interface PrizeClaimedEvent {
  ticketId: bigint;
  owner: `0x${string}`;
  prize: bigint;
}
