import AdminConfirmDialog from '../shared/AdminConfirmDialog';
import { Event } from '@/types';

interface EventDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
  onDelete: (eventId: string) => Promise<boolean>;
  isProcessing: boolean;
}

export default function EventDeleteDialog({
  isOpen,
  onClose,
  event,
  onDelete,
  isProcessing,
}: EventDeleteDialogProps) {
  if (!event) return null;

  const eventName = event.name || 'อีเวนต์นี้';

  const handleConfirm = async () => {
    const success = await onDelete(event.id);
    if (success) {
      onClose();
    }
  };

  return (
    <AdminConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      title="ลบอีเวนต์"
      message={`คุณแน่ใจหรือไม่ที่จะลบอีเวนต์ "${eventName}"?`}
      warningMessage="การลบอีเวนต์นี้จะไม่สามารถกู้คืนได้ และจะลบข้อมูลตั๋วที่เกี่ยวข้องทั้งหมด"
      confirmText="ลบอีเวนต์"
      confirmColor="danger"
      onConfirm={handleConfirm}
      isProcessing={isProcessing}
    />
  );
}

