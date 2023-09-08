export enum EventType {
  TokenCreated,
  Trade,
}

export interface TokenCreatedActivity {
  eventType: EventType.TokenCreated;
  owner: string;
  address: string;
  name: string;
  symbol: string;
}

export interface TradeActivity {
  eventType: EventType.Trade;
  trader: string;
  token: string;
  isBuy: boolean;
  amount: bigint;
  price: bigint;
  protocolFee: bigint;
  tokenOwnerFee: bigint;
  supply: bigint;
}

type Activity = TokenCreatedActivity | TradeActivity;

export default Activity;

export function eventToActivity(eventType: EventType, args: string[]) {
  if (eventType === EventType.TokenCreated) {
    return {
      eventType,
      owner: args[0],
      address: args[1],
      name: args[2],
      symbol: args[3],
    } as TokenCreatedActivity;
  } else if (eventType === EventType.Trade) {
    return {
      eventType,
      trader: args[0],
      token: args[1],
      isBuy: args[2] === "true",
      amount: BigInt(args[3]),
      price: BigInt(args[4]),
      protocolFee: BigInt(args[5]),
      tokenOwnerFee: BigInt(args[6]),
      supply: BigInt(args[7]),
    } as TradeActivity;
  } else {
    throw new Error(`Unknown event type: ${eventType}`);
  }
}
