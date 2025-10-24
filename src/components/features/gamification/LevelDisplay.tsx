'use client';

import React from 'react';
import { GamificationStats } from '@/types/gamification.types';

interface LevelDisplayProps {
  userStats: GamificationStats;
  className?: string;
}

export function LevelDisplay({ userStats, className = '' }: LevelDisplayProps) {
  const levelTitles = [
    'นักชกหน้าใหม่', 'นักชกฝึกหัด', 'นักชกมือใหม่', 'นักชกประจำ', 'นักชกมืออาชีพ',
    'นักชกแชมป์', 'นักชกตำนาน', 'นักชกเทพ', 'นักชกอมตะ', 'นักชกสูงสุด'
  ];

  const levelIcons = [
    '🥊', '🥋', '👊', '💪', '🏆', '👑', '⭐', '🌟', '✨', '💎'
  ];

  const levelIndex = Math.min(userStats.current_level - 1, levelTitles.length - 1);
  const progressPercentage = Math.min(
    ((userStats.total_points - ((userStats.current_level - 1) ** 2 * 100)) / 
     (userStats.points_to_next_level - ((userStats.current_level - 1) ** 2 * 100))) * 100,
    100
  );

  const getLevelColor = (level: number) => {
    if (level <= 3) return 'from-gray-400 to-gray-600';
    if (level <= 6) return 'from-blue-400 to-blue-600';
    if (level <= 8) return 'from-purple-400 to-purple-600';
    return 'from-yellow-400 to-yellow-600';
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center">
          {levelIcons[levelIndex]} ระดับของคุณ
        </h2>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">{userStats.total_points}</div>
          <div className="text-sm text-gray-600">คะแนนรวม</div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-lg font-medium">{levelTitles[levelIndex]}</span>
          <span className="text-sm text-gray-600">ระดับ {userStats.current_level}</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full bg-gradient-to-r ${getLevelColor(userStats.current_level)} transition-all duration-500`}
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between text-sm text-gray-600 mt-1">
          <span>ต้องการอีก {userStats.points_to_next_level - userStats.total_points} คะแนน</span>
          <span>{Math.round(progressPercentage)}%</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-blue-600">{userStats.current_level}</div>
          <div className="text-sm text-gray-600">ระดับปัจจุบัน</div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-green-600">{userStats.badges_earned}</div>
          <div className="text-sm text-gray-600">เหรียญที่ได้รับ</div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-purple-600">{userStats.active_challenges.length}</div>
          <div className="text-sm text-gray-600">ความท้าทาย</div>
        </div>
        
        <div className="bg-orange-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-orange-600">{userStats.current_streaks.length}</div>
          <div className="text-sm text-gray-600">สตรีค</div>
        </div>
      </div>
    </div>
  );
}
