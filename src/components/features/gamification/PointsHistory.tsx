'use client';

import React from 'react';
import { PointsHistory as PointsHistoryType } from '@/types/gamification.types';

interface PointsHistoryProps {
  activities: PointsHistoryType[];
  className?: string;
}

export function PointsHistory({ activities, className = '' }: PointsHistoryProps) {
  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'booking': return '📅';
      case 'profile_update': return '👤';
      case 'review': return '⭐';
      case 'social_share': return '📤';
      case 'article_read': return '📖';
      case 'video_watched': return '🎥';
      case 'login': return '🔑';
      case 'referral': return '👥';
      case 'challenge_complete': return '🎯';
      case 'booking_streak_bonus': return '🔥';
      case 'login_streak_bonus': return '🔥';
      default: return '🏅';
    }
  };

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'booking': return 'text-green-600 bg-green-100';
      case 'profile_update': return 'text-blue-600 bg-blue-100';
      case 'review': return 'text-yellow-600 bg-yellow-100';
      case 'social_share': return 'text-purple-600 bg-purple-100';
      case 'article_read': return 'text-indigo-600 bg-indigo-100';
      case 'video_watched': return 'text-pink-600 bg-pink-100';
      case 'login': return 'text-gray-600 bg-gray-100';
      case 'referral': return 'text-orange-600 bg-orange-100';
      case 'challenge_complete': return 'text-red-600 bg-red-100';
      case 'booking_streak_bonus': return 'text-orange-600 bg-orange-100';
      case 'login_streak_bonus': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getActionTitle = (actionType: string) => {
    switch (actionType) {
      case 'booking': return 'จองค่ายมวย';
      case 'profile_update': return 'อัปเดตโปรไฟล์';
      case 'review': return 'เขียนรีวิว';
      case 'social_share': return 'แชร์โซเชียล';
      case 'article_read': return 'อ่านบทความ';
      case 'video_watched': return 'ดูวิดีโอ';
      case 'login': return 'เข้าสู่ระบบ';
      case 'referral': return 'แนะนำเพื่อน';
      case 'challenge_complete': return 'ทำความท้าทาย';
      case 'booking_streak_bonus': return 'โบนัสสตรีคการจอง';
      case 'login_streak_bonus': return 'โบนัสสตรีคการเข้าสู่ระบบ';
      default: return 'กิจกรรม';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'เมื่อสักครู่';
    if (diffInHours < 24) return `${diffInHours} ชั่วโมงที่แล้ว`;
    if (diffInHours < 48) return 'เมื่อวาน';
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} วันที่แล้ว`;
    return date.toLocaleDateString('th-TH');
  };

  if (activities.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <div className="text-4xl mb-2">📊</div>
        <p>ยังไม่มีกิจกรรมล่าสุด</p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="text-2xl">
              {getActionIcon(activity.action_type)}
            </div>
            
            <div>
              <div className="font-medium text-gray-900">
                {getActionTitle(activity.action_type)}
              </div>
              {activity.action_description && (
                <div className="text-sm text-gray-600">
                  {activity.action_description}
                </div>
              )}
              <div className="text-xs text-gray-500">
                {formatDate(activity.created_at)}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${getActionColor(activity.action_type)}`}>
              {activity.points > 0 ? '+' : ''}{activity.points}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
