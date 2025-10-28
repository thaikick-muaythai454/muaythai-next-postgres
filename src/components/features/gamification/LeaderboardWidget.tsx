'use client';

import React from 'react';
import { LeaderboardData } from '@/types/gamification.types';

interface LeaderboardWidgetProps {
  leaderboard: LeaderboardData;
  className?: string;
}

export default function LeaderboardWidget({ leaderboard, className = '' }: LeaderboardWidgetProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-yellow-100 text-yellow-800';
      case 2: return 'bg-gray-100 text-gray-800';
      case 3: return 'bg-orange-100 text-orange-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getLeaderboardIcon = (type: string) => {
    switch (type) {
      case 'points': return '🏆';
      case 'bookings': return '📅';
      case 'streak': return '🔥';
      case 'monthly': return '📊';
      case 'all_time': return '⭐';
      default: return '🏅';
    }
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">
            {getLeaderboardIcon(leaderboard.leaderboard.leaderboard_type)}
          </span>
          <div>
            <h3 className="font-semibold text-gray-900">
              {leaderboard.leaderboard.name}
            </h3>
            <p className="text-sm text-gray-600">
              {leaderboard.leaderboard.description}
            </p>
          </div>
        </div>
        
        {leaderboard.user_rank && (
          <div className="text-right">
            <div className="text-sm text-gray-600">อันดับของคุณ</div>
            <div className="text-2xl font-bold text-blue-600">
              #{leaderboard.user_rank}
            </div>
            {leaderboard.user_score && (
              <div className="text-sm text-gray-500">
                {leaderboard.user_score} คะแนน
              </div>
            )}
          </div>
        )}
      </div>

      {/* Leaderboard Entries */}
      <div className="space-y-2">
        {leaderboard.entries.slice(0, 10).map((entry, index) => (
          <div
            key={entry.id}
            className={`flex items-center justify-between p-3 rounded-lg ${
              entry.user_id === leaderboard.user_rank ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getRankColor(entry.rank)}`}>
                {getRankIcon(entry.rank)}
              </div>
              
              <div className="flex items-center space-x-2">
                {entry.user?.avatar_url ? (
                  <img
                    src={entry.user.avatar_url}
                    alt={entry.user.username}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 text-sm">
                      {entry.user?.username?.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>
                )}
                
                <div>
                  <div className="font-medium text-gray-900">
                    {entry.user?.full_name || entry.user?.username || 'ผู้ใช้ไม่ระบุชื่อ'}
                  </div>
                  <div className="text-sm text-gray-500">
                    @{entry.user?.username || 'unknown'}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="font-bold text-gray-900">
                {entry.score.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">
                {leaderboard.leaderboard.leaderboard_type === 'points' ? 'คะแนน' :
                 leaderboard.leaderboard.leaderboard_type === 'bookings' ? 'การจอง' :
                 leaderboard.leaderboard.leaderboard_type === 'streak' ? 'สตรีค' : 'คะแนน'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Show More Button */}
      {leaderboard.entries.length > 10 && (
        <div className="mt-4 text-center">
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            ดูทั้งหมด ({leaderboard.entries.length} คน)
          </button>
        </div>
      )}

      {/* No Entries */}
      {leaderboard.entries.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">🏆</div>
          <p>ยังไม่มีข้อมูลในตารางคะแนนนี้</p>
        </div>
      )}
    </div>
  );
}
