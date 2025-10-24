'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  EyeIcon,
  CalendarIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

interface PaymentRecord {
  id: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed' | 'cancelled';
  paymentType: 'gym_booking' | 'product' | 'ticket';
  orderNumber: string;
  createdAt: string;
  description: string;
  metadata?: Record<string, any>;
}

export default function PaymentHistory() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);

  useEffect(() => {
    if (user) {
      fetchPaymentHistory();
    }
  }, [user]);

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/payments/history');
      
      if (!response.ok) {
        throw new Error('Failed to fetch payment history');
      }
      
      const data = await response.json();
      setPayments(data.payments || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch payment history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      case 'failed':
      case 'cancelled':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'สำเร็จ';
      case 'pending':
        return 'รอดำเนินการ';
      case 'failed':
        return 'ล้มเหลว';
      case 'cancelled':
        return 'ยกเลิก';
      default:
        return 'ไม่ทราบสถานะ';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400';
      case 'pending':
        return 'text-yellow-400';
      case 'failed':
      case 'cancelled':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getPaymentTypeText = (type: string) => {
    switch (type) {
      case 'gym_booking':
        return 'จองค่ายมวย';
      case 'product':
        return 'ซื้อสินค้า';
      case 'ticket':
        return 'ซื้อตั๋ว';
      default:
        return 'ไม่ทราบประเภท';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-zinc-800 rounded-lg p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-zinc-400">กำลังโหลดประวัติการชำระเงิน...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-zinc-800 rounded-lg p-6">
        <div className="text-center py-12">
          <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">เกิดข้อผิดพลาด</h3>
          <p className="text-zinc-400 mb-6">{error}</p>
          <button
            onClick={fetchPaymentHistory}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-zinc-800 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">ประวัติการชำระเงิน</h3>
            <p className="text-zinc-400">รายการการชำระเงินทั้งหมดของคุณ</p>
          </div>
          <div className="text-right">
            <p className="text-zinc-400 text-sm">จำนวนรายการ</p>
            <p className="text-white text-2xl font-bold">{payments.length}</p>
          </div>
        </div>
      </div>

      {/* Payment List */}
      {payments.length === 0 ? (
        <div className="bg-zinc-800 rounded-lg p-6">
          <div className="text-center py-12">
            <CurrencyDollarIcon className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">ยังไม่มีประวัติการชำระเงิน</h3>
            <p className="text-zinc-400">เมื่อคุณทำการชำระเงิน รายการจะปรากฏที่นี่</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <div key={payment.id} className="bg-zinc-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {getStatusIcon(payment.status)}
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-lg font-semibold text-white">
                        {getPaymentTypeText(payment.paymentType)}
                      </h4>
                      <span className={`text-sm font-medium ${getStatusColor(payment.status)}`}>
                        {getStatusText(payment.status)}
                      </span>
                    </div>
                    <p className="text-zinc-400 text-sm">
                      หมายเลขคำสั่งซื้อ: {payment.orderNumber}
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center space-x-1">
                        <CalendarIcon className="w-4 h-4 text-zinc-500" />
                        <span className="text-zinc-400 text-sm">
                          {formatDate(payment.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">
                    ฿{payment.amount.toLocaleString()}
                  </p>
                  <button
                    onClick={() => setSelectedPayment(payment)}
                    className="mt-2 flex items-center space-x-1 text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                  >
                    <EyeIcon className="w-4 h-4" />
                    <span>ดูรายละเอียด</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payment Detail Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">รายละเอียดการชำระเงิน</h3>
              <button
                onClick={() => setSelectedPayment(null)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-zinc-400 text-sm">หมายเลขคำสั่งซื้อ</label>
                  <p className="text-white font-mono">{selectedPayment.orderNumber}</p>
                </div>
                <div>
                  <label className="text-zinc-400 text-sm">สถานะ</label>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(selectedPayment.status)}
                    <span className={`font-medium ${getStatusColor(selectedPayment.status)}`}>
                      {getStatusText(selectedPayment.status)}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-zinc-400 text-sm">ประเภท</label>
                  <p className="text-white">{getPaymentTypeText(selectedPayment.paymentType)}</p>
                </div>
                <div>
                  <label className="text-zinc-400 text-sm">จำนวนเงิน</label>
                  <p className="text-white text-xl font-bold">
                    ฿{selectedPayment.amount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-zinc-400 text-sm">วันที่สร้าง</label>
                  <p className="text-white">{formatDate(selectedPayment.createdAt)}</p>
                </div>
                <div>
                  <label className="text-zinc-400 text-sm">รายละเอียด</label>
                  <p className="text-white">{selectedPayment.description}</p>
                </div>
              </div>

              {selectedPayment.metadata && Object.keys(selectedPayment.metadata).length > 0 && (
                <div>
                  <label className="text-zinc-400 text-sm">ข้อมูลเพิ่มเติม</label>
                  <div className="bg-zinc-700 rounded-lg p-4 mt-2">
                    <pre className="text-zinc-300 text-sm whitespace-pre-wrap">
                      {JSON.stringify(selectedPayment.metadata, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setSelectedPayment(null)}
                className="bg-zinc-600 hover:bg-zinc-500 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
