/**
 * API Endpoints
 * Centralized endpoint definitions
 */

/** Paths relative to base URL (base is e.g. http://localhost:5000/api/v1/customer) */
const P = '';

export const endpoints = {
  // Auth endpoints
  auth: {
    login: `${P}/auth/login`,
    // OTP flow
    sendOtp: `${P}/auth/send-otp`,
    verifyOtp: `${P}/auth/verify-otp`,
    resendOtp: `${P}/auth/resend-otp`,
    verifyOTP: `${P}/auth/verify-otp`,
    resendOTP: `${P}/auth/resend-otp`,
    logout: `${P}/auth/logout`,
    refreshToken: `${P}/auth/refresh`,
  },

  // User endpoints
  user: {
    profile: `${P}/user/profile`,
    updateProfile: `${P}/user/profile`,
    changePassword: `${P}/user/change-password`,
  },

  // Product endpoints
  products: {
    list: `${P}/products`,
    detail: (id: string) => `${P}/products/${id}`,
    search: `${P}/products/search`,
    byCategory: (categoryId: string) => `${P}/products/category/${categoryId}`,
  },

  // Category endpoints
  categories: {
    list: `${P}/categories`,
    detail: (id: string) => `${P}/categories/${id}`,
  },

  // Cart endpoints
  cart: {
    get: `${P}/cart`,
    addItem: `${P}/cart/items`,
    updateItem: (itemId: string) => `${P}/cart/items/${itemId}`,
    removeItem: (itemId: string) => `${P}/cart/items/${itemId}`,
    clear: `${P}/cart/clear`,
  },

  // Order endpoints
  orders: {
    list: `${P}/orders`,
    detail: (id: string) => `${P}/orders/${id}`,
    create: `${P}/orders`,
    cancel: (id: string) => `${P}/orders/${id}/cancel`,
    rate: (id: string) => `${P}/orders/${id}/rate`,
    status: (id: string) => `${P}/orders/${id}/status`,
  },

  // Address endpoints
  addresses: {
    list: `${P}/addresses`,
    default: `${P}/addresses/default`,
    create: `${P}/addresses`,
    update: (id: string) => `${P}/addresses/${id}`,
    delete: (id: string) => `${P}/addresses/${id}`,
    setDefault: (id: string) => `${P}/addresses/${id}/default`,
  },

  // Payment endpoints
  payments: {
    methods: `${P}/payments/methods`,
    addMethod: `${P}/payments/methods`,
    removeMethod: (id: string) => `${P}/payments/methods/${id}`,
    setDefault: (id: string) => `${P}/payments/methods/${id}/default`,
  },

  // Coupon endpoints
  coupons: {
    list: `${P}/coupons`,
    validate: `${P}/coupons/validate`,
    apply: `${P}/coupons/apply`,
  },

  // Notification endpoints
  notifications: {
    list: `${P}/notifications`,
    markRead: (id: string) => `${P}/notifications/${id}/read`,
    markAllRead: `${P}/notifications/read-all`,
  },

  // Onboarding endpoints
  onboarding: {
    pages: `${P}/onboarding/pages`,
    pageByNumber: (pageNumber: number) => `${P}/onboarding/pages/${pageNumber}`,
    complete: `${P}/onboarding/complete`,
    status: `${P}/onboarding/status`,
  },
 
  // Home endpoints
  home: {
    payload: `${P}/home`,
  },

  // Legal (Terms, Privacy, login footer config)
  legal: {
    config: `${P}/legal/config`,
    terms: `${P}/legal/terms`,
    privacy: `${P}/legal/privacy`,
    accept: `${P}/legal/accept`,
  },
} as const;

