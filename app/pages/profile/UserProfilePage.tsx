import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { ProfileHeader } from '@/components/profile/profile-header';
import { IntellectualIdentity } from '@/components/profile/intellectual-identity';
import { ProfileCircles } from '@/components/profile/profile-circles';
import { ProfileContributions } from '@/components/profile/profile-contributions';
import { ProfileAchievements } from '@/components/profile/profile-achievements';
import { Loader2, AlertCircle } from 'lucide-react';
import type { Profile } from '@/lib/types';
import { CreatorProfilePage } from '@/pages/creator/CreatorProfilePage';

export function UserProfilePage() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userStats, setUserStats] = useState<any>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const cleanUsername = username?.startsWith('@') ? username.slice(1) : username;
        if (!cleanUsername) {
          throw new Error('Username is required');
        }

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', cleanUsername)
          .single();

        if (profileError || !profileData) {
          throw new Error('Profile not found');
        }

        if (user && profileData.id === user.id) {
          navigate('/profile', { replace: true });
          return;
        }

        setProfile(profileData as Profile);

        if (profileData.role !== 'creator') {
          const { data: userProfileData, error: userProfileError } = await supabase.rpc(
            'get_user_profile',
            { p_username: cleanUsername }
          );

          if (!userProfileError && userProfileData && userProfileData.length > 0) {
            const userData = userProfileData[0];
            setUserStats(userData.stats);
          }
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [username, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <h1 className="text-2xl font-semibold">Profile not found</h1>
        <p className="text-muted-foreground">
          {error || "The profile you're looking for doesn't exist or has been removed."}
        </p>
        <button onClick={() => navigate(-1)} className="text-primary hover:underline">
          Go back
        </button>
      </div>
    );
  }

  if (profile.role === 'creator') {
    return (
      <CreatorProfilePage
        usernameOverride={profile.username}
        viewerId={user?.id ?? null}
      />
    );
  }

  return (
    <div className="space-y-8">
      <ProfileHeader profile={profile} isOwnProfile={false} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <IntellectualIdentity userId={profile.id} isOwnProfile={false} stats={userStats} />
          <ProfileContributions userId={profile.id} isOwnProfile={false} />
        </div>

        <div className="space-y-8">
          <ProfileCircles />
          <ProfileAchievements stats={userStats} />
        </div>
      </div>
    </div>
  );
}
