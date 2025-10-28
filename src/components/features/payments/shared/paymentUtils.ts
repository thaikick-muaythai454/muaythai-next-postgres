/**
 * Shared payment utilities and helper functions
 * Consolidates common payment logic across components
 */

export type PaymentStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled' | 'refunded';
export type PaymentType = 'gym_booking' | 'product' | 'ticket';

export interface PaymentError {
  type: 'card_declined' | 'insufficient_funds' | 'expired_card' | 'incorrect_cvc' | 'processing_error' | 'network_error' | 'generic';
  title: string;
  message: string;
  retryable: boolean;
  suggestion?: string;
}

/**
 * Get status icon component name for payment status
 */
export const getStatusIconName = (status: PaymentStatus): string => {
  switch (status) {
    case 'succeeded':
      return 'CheckCircleIcon';
    case 'failed':
    case 'canceled':
      return 'XCircleIcon';
    case 'pending':
    case 'processing':
      return 'ClockIcon';
    case 'refunded':
      return 'ArrowPathIcon';
    default:
      return 'ExclamationTriangleIcon';
  }
};

/**
 * Get localized status text and color
 */
export const getStatusInfo = (status: PaymentStatus): { text: string; color: string } => {
  switch (status) {
    case 'succeeded':
      return { text: 'สำเร็จ', color: 'text-green-400' };
    case 'failed':
      return { text: 'ล้มเหลว', color: 'text-red-400' };
    case 'pending':
      return { text: 'รอดำเนินการ', color: 'text-yellow-400' };
    case 'processing':
      return { text: 'กำลังดำเนินการ', color: 'text-yellow-400' };
    case 'canceled':
      return { text: 'ยกเลิก', color: 'text-gray-400' };
    case 'refunded':
      return { text: 'คืนเงิน', color: 'text-blue-400' };
    default:
      return { text: 'ไม่ทราบสถานะ', color: 'text-gray-400' };
  }
};

/**
 * Get localized payment type text
 */
export const getPaymentTypeText = (type: PaymentType): string => {
  switch (type) {
    case 'gym_booking':
      return 'จองค่ายมวย';
    case 'product':
      return 'ซื้อสินค้า';
    case 'ticket':
      return 'ซื้อตั๋ว';
    default:
      return type;
  }
};

/**
 * Format date for Thai locale
 */
export const formatPaymentDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Parse Stripe error to user-friendly message
 */
export const parseStripeError = (error: { code?: string; decline_code?: string; message?: string }): PaymentError => {
  const code = error.code || error.decline_code;

  switch (code) {
    case 'card_declined':
      return {
        type: 'card_declined',
        title: 'บัตรถูกปฏิเสธ',
        message: 'ธนาคารของคุณปฏิเสธการทำรายการ',
        retryable: true,
        suggestion: 'กรุณาลองใช้บัตรอื่น หรือติดต่อธนาคารของคุณ',
      };
    case 'insufficient_funds':
      return {
        type: 'insufficient_funds',
        title: 'ยอดเงินไม่เพียงพอ',
        message: 'บัตรของคุณมีวงเงินไม่เพียงพอสำหรับการทำรายการนี้',
        retryable: true,
        suggestion: 'กรุณาใช้บัตรอื่น หรือเติมเงินในบัญชีของคุณ',
      };
    case 'expired_card':
      return {
        type: 'expired_card',
        title: 'บัตรหมดอายุ',
        message: 'บัตรของคุณหมดอายุแล้ว',
        retryable: false,
        suggestion: 'กรุณาใช้บัตรที่ยังไม่หมดอายุ',
      };
    case 'incorrect_cvc':
    case 'invalid_cvc':
      return {
        type: 'incorrect_cvc',
        title: 'รหัส CVV ไม่ถูกต้อง',
        message: 'รหัส CVV ที่คุณกรอกไม่ถูกต้อง',
        retryable: true,
        suggestion: 'กรุณาตรวจสอบรหัส CVV 3 หลักด้านหลังบัตร',
      };
    case 'processing_error':
      return {
        type: 'processing_error',
        title: 'เกิดข้อผิดพลาดในการประมวลผล',
        message: 'ธนาคารไม่สามารถดำเนินการได้ในขณะนี้',
        retryable: true,
        suggestion: 'กรุณาลองใหม่อีกครั้งในภายหลัง',
      };
    default:
      return {
        type: 'generic',
        title: 'เกิดข้อผิดพลาด',
        message: error.message || 'ไม่สามารถดำเนินการชำระเงินได้',
        retryable: true,
        suggestion: 'กรุณาตรวจสอบข้อมูลและลองใหม่อีกครั้ง',
      };
  }
};

/**
 * Validate phone number format (utility version)
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  if (!phone || phone.length < 9) return false;
  const phoneRegex = /^(0[689]\d{8}|0[2-7]\d{7,8})$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Format amount for display
 */
export const formatAmount = (amount: number): string => {
  return `฿${amount.toLocaleString()}`;
};

/**
 * Generate payment reference number
 */
export const generatePaymentReference = (): string => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `MT-${timestamp}${random}`;
};