/**
 * Order Service
 * Handles order-related API calls
 */

import { api } from '../api/client';
import { endpoints } from '../api/endpoints';
import type { ApiResponse, PaginatedResponse } from '../api/types';

export interface OrderItem {
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

export interface Order {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  status: 'pending' | 'confirmed' | 'getting-packed' | 'on-the-way' | 'arrived' | 'delivered' | 'cancelled';
  deliveryAddress: {
    id: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
  };
  paymentMethod: {
    id: string;
    type: 'card' | 'upi' | 'cash';
    last4?: string;
  };
  itemTotal: number;
  handlingCharge: number;
  deliveryFee: number;
  discount: number;
  totalBill: number;
  createdAt: string;
  estimatedDelivery?: string;
}

export interface CreateOrderRequest {
  items: Array<{
    productId: string;
    variantId: string;
    quantity: number;
  }>;
  addressId: string;
  paymentMethodId: string;
  couponCode?: string;
  deliveryTip?: number;
}

export interface RateOrderRequest {
  orderId: string;
  rating: number;
  comment?: string;
}

export interface OrderListParams {
  page?: number;
  limit?: number;
  status?: Order['status'];
}

/**
 * Get list of orders
 */
export const getOrders = async (params?: OrderListParams): Promise<ApiResponse<PaginatedResponse<Order>>> => {
  return api.get<PaginatedResponse<Order>>(endpoints.orders.list, { params });
};

/**
 * Get order by ID
 */
export const getOrderById = async (id: string): Promise<ApiResponse<Order>> => {
  return api.get<Order>(endpoints.orders.detail(id));
};

/**
 * Create new order
 */
export const createOrder = async (data: CreateOrderRequest): Promise<ApiResponse<Order>> => {
  return api.post<Order>(endpoints.orders.create, data);
};

/**
 * Cancel order
 */
export const cancelOrder = async (id: string): Promise<ApiResponse<Order>> => {
  return api.post<Order>(endpoints.orders.cancel(id));
};

/**
 * Rate order
 */
export const rateOrder = async (data: RateOrderRequest): Promise<ApiResponse<void>> => {
  return api.post<void>(endpoints.orders.rate(data.orderId), {
    rating: data.rating,
    comment: data.comment,
  });
};

/**
 * Get order status
 */
export const getOrderStatus = async (id: string): Promise<ApiResponse<Order>> => {
  return api.get<Order>(endpoints.orders.status(id));
};

