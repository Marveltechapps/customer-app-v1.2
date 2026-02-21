import { api } from '../api/client';
import { endpoints } from '../api/endpoints';

export interface DefaultAddress {
  _id?: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  pincode?: string;
  label?: string;
}

export const addressService = {
  getDefault: async (): Promise<{ success: boolean; data: DefaultAddress | null }> => {
    const res = await api.get<DefaultAddress | null>(endpoints.addresses.default);
    return { success: Boolean(res?.success), data: res?.data ?? null };
  },
};

export default addressService;
