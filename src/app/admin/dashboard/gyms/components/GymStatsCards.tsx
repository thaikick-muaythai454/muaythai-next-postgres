import { Card, CardBody } from '@heroui/react';
import type { Gym } from '@/types/database.types';

interface GymStatsCardsProps {
  gyms: Gym[];
}

export default function GymStatsCards({ gyms }: GymStatsCardsProps) {
  // คำนวณจำนวนยิมแต่ละสถานะ
  const totalGyms = gyms.length;
  const approvedGyms = gyms.filter(g => g.status === 'approved').length;
  const pendingGyms = gyms.filter(g => g.status === 'pending').length;
  const rejectedGyms = gyms.filter(g => g.status === 'rejected').length;

  const stats = [
    {
      title: 'ยิมทั้งหมด',
      value: totalGyms,
      color: 'default',
      bgColor: 'bg-default-100/50',
      textColor: 'text-white',
    },
    {
      title: 'อนุมัติแล้ว',
      value: approvedGyms,
      color: 'success',
      bgColor: 'bg-success/10',
      textColor: 'text-success',
    },
    {
      title: 'รออนุมัติ',
      value: pendingGyms,
      color: 'warning',
      bgColor: 'bg-warning/10',
      textColor: 'text-warning',
    },
    {
      title: 'ไม่อนุมัติ',
      value: rejectedGyms,
      color: 'danger',
      bgColor: 'bg-danger/10',
      textColor: 'text-danger',
    },
  ];

  return (
    <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card
          key={index}
          className={`${stat.bgColor} backdrop-blur-sm border-none`}
        >
          <CardBody>
            <p className="mb-2 text-default-400 text-sm">{stat.title}</p>
            <p className={`font-bold text-3xl ${stat.textColor}`}>
              {stat.value}
            </p>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
