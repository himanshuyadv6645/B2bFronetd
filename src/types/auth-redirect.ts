export const PendingAction = {
  BUY_NOW: 'BUY_NOW',
  ADD_TO_CART: 'ADD_TO_CART',
  ADD_TO_WISHLIST: 'ADD_TO_WISHLIST',
  CHECKOUT: 'CHECKOUT',
  PLACE_ORDER: 'PLACE_ORDER',
  REQUEST_QUOTE: 'REQUEST_QUOTE',
  CONTACT_SELLER: 'CONTACT_SELLER',
  SAVE_ADDRESS: 'SAVE_ADDRESS',
} as const;

export type PendingAction = typeof PendingAction[keyof typeof PendingAction];

export interface PendingActionPayload {
  action: PendingAction;
  productId?: string;
  variantId?: string;
  sellerId?: string;
  quantity?: number;
  notes?: string;
}

export interface AuthRedirectState {
  pathname: string;
  search: string;
  hash: string;
  scrollY: number;
  pendingAction?: PendingActionPayload;
  timestamp: number;
}
