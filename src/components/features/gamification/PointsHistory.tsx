'use client';

import React from 'react';
import { PointsHistory as PointsHistoryType } from '@/types/gamification.types';
import { 
  GamificationEmptyState,
  usePointsHistoryDisplay
} from './shared';

interface PointsHistoryProps {
  activities: PointsHistoryType[];
  className?: string;
}

export default function PointsHistory({ activities, className = '' }: PointsHistoryProps) {
  const displayActivities = usePointsHistoryDisplay(activities);

  if (activities.length === 0) {
    return <GamificationEmptyState type="activities" className={className} />;
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
