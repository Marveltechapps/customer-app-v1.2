/**
 * Cart Service
 * Handles cart-related API calls
 */

import { api } from '../api/client';
import { endpoints } from '../api/endpoints';
import type { ApiResponse } from '../api/types';

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  variantId: string;
  variantSize: string;
  quantity: number;
  price: number;
  originalPrice?: number;
  image: string;
}

export interface Cart {
  items: CartItem[];
  itemTotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  appliedCoupon?: {
    code: string;
    discount: number;
  };
}

export interface AddToCartRequest {
  productId: string;
  variantId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

/**
 * Get cart
 */
export const getCart = async (): Promise<ApiResponse<Cart>> => {
  return api.get<Cart>(endpoints.cart.get);
};

/**
 * Add item to cart
 */
export const addToCart = async (data: AddToCartRequest): Promise<ApiResponse<Cart>> => {
  return api.post<Cart>(endpoints.cart.addItem, data);
};

/**
 * Update cart item quantity
 */
export const updateCartItem = async (itemId: string, data: UpdateCartItemRequest): Promise<ApiResponse<Cart>> => {
  return api.put<Cart>(endpoints.cart.updateItem(itemId), data);
};

/**
 * Remove item from cart
 */
export const removeFromCart = async (itemId: string): Promise<ApiResponse<Cart>> => {
  return api.delete<Cart>(endpoints.cart.removeItem(itemId));
};

/**
 * Clear cart
 */
export const clearCart = async (): Promise<ApiResponse<void>> => {
  return api.delete<void>(endpoints.cart.clear);
};

