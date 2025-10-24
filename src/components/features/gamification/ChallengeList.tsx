'use client';

import React, { useState } from 'react';
import { Challenge, ChallengeProgress } from '@/types/gamification.types';

interface ChallengeListProps {
  challenges: Challenge[] | ChallengeProgress[];
  className?: string;
}

export function ChallengeList({ challenges, className = '' }: ChallengeListProps) {
  const [joiningChallenge, setJoiningChallenge] = useState<string | null>(null);

  const isChallengeProgress = (challenge: Challenge | ChallengeProgress): challenge is ChallengeProgress => {
    return 'progress_percentage' in challenge;
  };

  const getChallengeTypeIcon = (type: string) => {
    switch (type) {
      case 'daily': return '📅';
      case 'weekly': return '📊';
      case 'monthly': return '🗓️';
      case 'special': return '🎉';
      default: return '🎯';
    }
  };

  const getChallengeTypeColor = (type: string) => {
    switch (type) {
      case 'daily': return 'bg-blue-100 text-blue-800';
      case 'weekly': return 'bg-green-100 text-green-800';
      case 'monthly': return 'bg-purple-100 text-purple-800';
      case 'special': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleJoinChallenge = async (challengeId: string) => {
    try {
      setJoiningChallenge(challengeId);
      
      const response = await fetch('/api/gamification/challenges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'join',
          challenge_id: challengeId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to join challenge');
      }

      // Refresh the page or update state
      window.location.reload();
    } catch (error) {
      console.error('Error joining challenge:', error);
      alert(error instanceof Error ? error.message : 'Failed to join challenge');
    } finally {
      setJoiningChallenge(null);
    }
  };

  if (challenges.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <div className="text-4xl mb-2">🎯</div>
        <p>ไม่มีความท้าทายในขณะนี้</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {challenges.map((challenge) => {
        const challengeData = isChallengeProgress(challenge) ? challenge.challenge : challenge;
        const progress = isChallengeProgress(challenge) ? challenge : null;
        
        return (
          <div
            key={challengeData.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">
                  {getChallengeTypeIcon(challengeData.challenge_type)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {challengeData.title}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getChallengeTypeColor(challengeData.challenge_type)}`}>
                      {challengeData.challenge_type}
                    </span>
                    <span className="text-sm text-gray-600">
                      {challengeData.points_reward} คะแนน
                    </span>
                  </div>
                </div>
              </div>
              
              {!progress && (
                <button
                  onClick={() => handleJoinChallenge(challengeData.id)}
                  disabled={joiningChallenge === challengeData.id}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {joiningChallenge === challengeData.id ? 'กำลังเข้าร่วม...' : 'เข้าร่วม'}
                </button>
              )}
            </div>

            <p className="text-gray-600 text-sm mb-3">
              {challengeData.description}
            </p>

            {/* Progress Bar for joined challenges */}
            {progress && (
              <div className="mb-3">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>ความคืบหน้า</span>
                  <span>{Math.round(progress.progress_percentage)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress.progress_percentage}%` }}
                  ></div>
                </div>
                {progress.is_completed && (
                  <div className="mt-2 text-green-600 text-sm font-medium">
                    ✅ เสร็จสิ้นแล้ว!
                  </div>
                )}
              </div>
            )}

            {/* Challenge Dates */}
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                {challengeData.start_date && (
                  <span>
                    เริ่ม: {new Date(challengeData.start_date).toLocaleDateString('th-TH')}
                  </span>
                )}
                {challengeData.end_date && (
                  <span>
                    สิ้นสุด: {new Date(challengeData.end_date).toLocaleDateString('th-TH')}
                  </span>
                )}
              </div>
              
              {challengeData.max_participants && (
                <span>
                  จำกัด {challengeData.max_participants} คน
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
