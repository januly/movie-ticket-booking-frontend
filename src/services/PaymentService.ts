import { ApiClient } from './ApiClient';
import type { PaymentDTO, PaymentMethod, PaymentStatus } from '../types/api';

export class PaymentService {
  static create(bookingId: string, paymentMethod: PaymentMethod) {
    return ApiClient.request<PaymentDTO>('/payments', {
      method: 'POST',
      data: { bookingId, paymentMethod },
    });
  }
  static get(id: string) {
    return ApiClient.request<PaymentDTO>(`/payments/${encodeURIComponent(id)}`);
  }
  static getAll() {
    return ApiClient.request<PaymentDTO[]>('/payments');
  }
  static process(id: string, status: 'COMPLETED' | 'FAILED') {
    return ApiClient.request<PaymentDTO>(`/payments/${encodeURIComponent(id)}/process`, {
      method: 'PUT',
      data: { status },
    });
  }
  static getStatus(id: string) {
    return ApiClient.request<PaymentStatus>(`/payments/${encodeURIComponent(id)}/status`);
  }
}
