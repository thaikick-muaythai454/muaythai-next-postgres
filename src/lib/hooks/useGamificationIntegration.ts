'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useGamification } from './useGamification';

/**
 * Hook to automatically handle gamification integration
 * This hook should be used in the main app to automatically award points
 * for common user actions like login, profile updates, etc.
 */
export function useGamificationIntegration() {
  const { user } = useAuth();
  const { awardPoints, updateStreak } = useGamification();

  // Handle login streak
  useEffect(() => {
    if (user) {
      // Update login streak when user is authenticated
      updateStreak('login').catch(console.error);
    }
  }, [user, updateStreak]);

  // Award points for profile completion
  const handleProfileUpdate = async (profileData: any) => {
    if (!user) return;

    try {
      // Check if profile is complete (has all required fields)
      const requiredFields = ['full_name', 'phone', 'bio'];
      const completedFields = requiredFields.filter(field => profileData[field]);
      
      if (completedFields.length >= 2) {
        await awardPoints(
          50,
          'profile_update',
          'อัปเดตโปรไฟล์ครบถ้วน',
          user.id,
          'profile'
        );
      }
    } catch (error) {
      console.error('Error awarding profile update points:', error);
    }
  };

  // Award points for reading articles
  const handleArticleRead = async (articleId: string, articleTitle: string) => {
    if (!user) return;

    try {
      await awardPoints(
        10,
        'article_read',
        `อ่านบทความ: ${articleTitle}`,
        articleId,
        'article'
      );

      // Update reading streak
      await updateStreak('article_read');
    } catch (error) {
      console.error('Error awarding article read points:', error);
    }
  };

  // Award points for watching videos
  const handleVideoWatched = async (videoId: string, videoTitle: string) => {
    if (!user) return;

    try {
      await awardPoints(
        15,
        'video_watched',
        `ดูวิดีโอ: ${videoTitle}`,
        videoId,
        'video'
      );
    } catch (error) {
      console.error('Error awarding video watch points:', error);
    }
  };

  // Award points for writing reviews
  const handleReviewSubmit = async (reviewId: string, gymName: string) => {
    if (!user) return;

    try {
      await awardPoints(
        25,
        'review',
        `เขียนรีวิว: ${gymName}`,
        reviewId,
        'review'
      );

      // Update review streak
      await updateStreak('review');
    } catch (error) {
      console.error('Error awarding review points:', error);
    }
  };

  // Award points for social sharing
  const handleSocialShare = async (contentType: string, contentId: string) => {
    if (!user) return;

    try {
      await awardPoints(
        10,
        'social_share',
        `แชร์${contentType}`,
        contentId,
        'social_share'
      );
    } catch (error) {
      console.error('Error awarding social share points:', error);
    }
  };

  // Award points for referrals
  const handleReferral = async (referredUserId: string) => {
    if (!user) return;

    try {
      await awardPoints(
        200,
        'referral',
        'แนะนำเพื่อนเข้าร่วมแพลตฟอร์ม',
        referredUserId,
        'referral'
      );
    } catch (error) {
      console.error('Error awarding referral points:', error);
    }
  };

  return {
    handleProfileUpdate,
    handleArticleRead,
    handleVideoWatched,
    handleReviewSubmit,
    handleSocialShare,
    handleReferral,
  };
}
