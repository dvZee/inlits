import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
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

  return (
    <CreatorProfilePage
      usernameOverride={profile.username}
      viewerId={user?.id ?? null}
    />
  );
}
