import AdminConfirmDialog from '../../shared/AdminConfirmDialog';
import type { GymDeleteDialogProps } from '..';

export default function GymDeleteDialog({
  isOpen,
  onClose,
  gym,
  onConfirm,
  isProcessing,
}: GymDeleteDialogProps) {
  if (!gym) return null;

  return (
    <AdminConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      title="ยืนยันการลบยิม"
      message={`คุณต้องการลบยิม ${gym.gym_name || ''} ใช่หรือไม่?`}
      warningMessage="การลบนี้ไม่สามารถย้อนกลับได้ ข้อมูลยิมทั้งหมดจะถูกลบออกจากระบบอย่างถาวร"
      confirmText="ยืนยันการลบ"
      confirmColor="danger"
      onConfirm={() => onConfirm(gym.id)}
      isProcessing={isProcessing}
    />
  );
}
