'use client';

import React, { useState } from 'react';
import { Challenge, ChallengeProgress } from '@/types/gamification.types';
import { 
  GamificationCard, 
  GamificationEmptyState,
  GamificationProgressBar,
  useChallengeDisplay,
  getChallengeTypeIcon,
  getChallengeTypeColor
} from './shared';

interface ChallengeListProps {
  challenges: Challenge[] | ChallengeProgress[];
  className?: string;
}

export default function ChallengeList({ challenges, className = '' }: ChallengeListProps) {
  const [joiningChallenge, setJoiningChallenge] = useState<string | null>(null);

  const isChallengeProgress = (challenge: Challenge | ChallengeProgress): challenge is ChallengeProgress => {
    return 'progress_percentage' in challenge;
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
    return <GamificationEmptyState type="challenges" className={className} />;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {challenges.map((challenge) => {
        const challengeData = isChallengeProgress(challenge) ? challenge.challenge : challenge;
        const progress = isChallengeProgress(challenge) ? challenge : null;
        const challengeDisplay = useChallengeDisplay(challenge);
        
        return (
          <GamificationCard
            key={challengeData.id}
            variant="default"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">
                  {challengeDisplay.typeIcon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {challengeData.title}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${challengeDisplay.typeColor}`}>
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
            {challengeDisplay.isProgress && (
              <div className="mb-3">
                <GamificationProgressBar
                  progress={challengeDisplay.progressPercentage}
                  label="ความคืบหน้า"
                  showPercentage={true}
                  variant="default"
                />
                {challengeDisplay.isCompleted && (
                  <div className="mt-2 text-green-600 text-sm font-medium">
                    ✅ เสร็จสิ้นแล้ว!
                  </div>
                )}
              </div>
            )}

            {/* Challenge Dates */}
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                {challengeDisplay.formattedStartDate && (
                  <span>
                    เริ่ม: {challengeDisplay.formattedStartDate}
                  </span>
                )}
                {challengeDisplay.formattedEndDate && (
                  <span>
                    สิ้นสุด: {challengeDisplay.formattedEndDate}
                  </span>
                )}
              </div>
              
              {challengeData.max_participants && (
                <span>
                  จำกัด {challengeData.max_participants} คน
                </span>
              )}
            </div>
          </GamificationCard>
        );
      })}
    </div>
  );
}
