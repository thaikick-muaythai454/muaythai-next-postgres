'use client';

import React from 'react';
import { GamificationStats } from '@/types/gamification.types';
import { 
  GamificationCard, 
  GamificationProgressBar,
  useLevelDisplay
} from './shared';

interface LevelDisplayProps {
  userStats: GamificationStats;
  className?: string;
}

export default function LevelDisplay({ userStats, className = '' }: LevelDisplayProps) {
  const levelDisplay = useLevelDisplay(userStats);

  return (
    <GamificationCard variant="elevated" size="lg" className={className}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center">
          {levelDisplay.levelIcon} ระดับของคุณ
        </h2>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">{levelDisplay.formattedPoints}</div>
          <div className="text-sm text-gray-600">คะแนนรวม</div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-lg font-medium">{levelDisplay.levelTitle}</span>
          <span className="text-sm text-gray-600">ระดับ {userStats.current_level}</span>
        </div>
        
        <GamificationProgressBar
          progress={levelDisplay.progressPercentage}
          variant="level"
          size="lg"
          label={`ต้องการอีก ${levelDisplay.pointsToNext} คะแนน`}
          showPercentage={true}
        />
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
    </GamificationCard>
  );
}
