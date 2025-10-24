'use client';

import React from 'react';
import { UserStreak } from '@/types/gamification.types';

interface StreakDisplayProps {
  streak: UserStreak;
  className?: string;
}

export function StreakDisplay({ streak, className = '' }: StreakDisplayProps) {
  const getStreakIcon = (type: string) => {
    switch (type) {
      case 'booking': return '📅';
      case 'login': return '🔑';
      case 'review': return '⭐';
      case 'article_read': return '📖';
      default: return '🔥';
    }
  };

  const getStreakColor = (type: string) => {
    switch (type) {
      case 'booking': return 'text-green-600 bg-green-100';
      case 'login': return 'text-blue-600 bg-blue-100';
      case 'review': return 'text-yellow-600 bg-yellow-100';
      case 'article_read': return 'text-purple-600 bg-purple-100';
      default: return 'text-orange-600 bg-orange-100';
    }
  };

  const getStreakTitle = (type: string) => {
    switch (type) {
      case 'booking': return 'สตรีคการจอง';
      case 'login': return 'สตรีคการเข้าสู่ระบบ';
      case 'review': return 'สตรีคการรีวิว';
      case 'article_read': return 'สตรีคการอ่าน';
      default: return 'สตรีค';
    }
  };

  const getStreakDescription = (type: string) => {
    switch (type) {
      case 'booking': return 'จองค่ายมวยต่อเนื่อง';
      case 'login': return 'เข้าสู่ระบบต่อเนื่อง';
      case 'review': return 'เขียนรีวิวต่อเนื่อง';
      case 'article_read': return 'อ่านบทความต่อเนื่อง';
      default: return 'กิจกรรมต่อเนื่อง';
    }
  };

  const getStreakStatus = (currentStreak: number) => {
    if (currentStreak === 0) return { text: 'เริ่มต้นใหม่', color: 'text-gray-600' };
    if (currentStreak < 3) return { text: 'กำลังเริ่มต้น', color: 'text-blue-600' };
    if (currentStreak < 7) return { text: 'กำลังมาแรง', color: 'text-green-600' };
    if (currentStreak < 30) return { text: 'กำลังร้อนแรง', color: 'text-orange-600' };
    return { text: 'ไฟแรงมาก!', color: 'text-red-600' };
  };

  const status = getStreakStatus(streak.current_streak);

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{getStreakIcon(streak.streak_type)}</span>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">
              {getStreakTitle(streak.streak_type)}
            </h3>
            <p className="text-xs text-gray-600">
              {getStreakDescription(streak.streak_type)}
            </p>
          </div>
        </div>
      </div>

      {/* Streak Numbers */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">
            {streak.current_streak}
          </div>
          <div className="text-xs text-gray-600">สตรีคปัจจุบัน</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {streak.longest_streak}
          </div>
          <div className="text-xs text-gray-600">สตรีคสูงสุด</div>
        </div>
      </div>

      {/* Status */}
      <div className="text-center">
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStreakColor(streak.streak_type)}`}>
          <span className={`${status.color}`}>{status.text}</span>
        </div>
      </div>

      {/* Progress Bar */}
      {streak.current_streak > 0 && (
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${Math.min((streak.current_streak / 30) * 100, 100)}%` 
              }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 mt-1 text-center">
            {streak.current_streak < 30 
              ? `อีก ${30 - streak.current_streak} วันถึง 30 วัน`
              : 'สตรีคยาวนานมาก!'
            }
          </div>
        </div>
      )}

      {/* Last Activity */}
      {streak.last_activity_date && (
        <div className="mt-3 text-center">
          <div className="text-xs text-gray-500">
            กิจกรรมล่าสุด: {new Date(streak.last_activity_date).toLocaleDateString('th-TH')}
          </div>
        </div>
      )}

      {/* Motivational Message */}
      {streak.current_streak === 0 && (
        <div className="mt-3 text-center">
          <div className="text-sm text-gray-600">
            เริ่มต้นสตรีคใหม่วันนี้!
          </div>
        </div>
      )}
    </div>
  );
}
