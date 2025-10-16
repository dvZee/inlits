import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Loader2, AlertCircle } from 'lucide-react';

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Auth callback started');
        
        // Get the session from the URL hash
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          throw sessionError;
        }

        if (!session?.user) {
          console.log('No session found, checking URL hash');
          // Try to get session from URL hash
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          
          if (accessToken) {
            console.log('Found tokens in URL, setting session');
            const { data: { user }, error: setSessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || ''
            });
            
            if (setSessionError) throw setSessionError;
            if (!user) throw new Error('Failed to set session');
            
            console.log('Session set successfully');
          } else {
            throw new Error('No user session found');
          }
        }

        // Get the current session again
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (!currentSession?.user) {
          throw new Error('No user session found');
        }

        const user = currentSession.user;
        console.log('OAuth user:', user.email);

        // Check if profile exists
        const { data: existingProfile, error: profileCheckError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (profileCheckError && profileCheckError.code !== 'PGRST116') {
          console.error('Profile check error:', profileCheckError);
          throw profileCheckError;
        }

        if (!existingProfile) {
          console.log('Creating new profile for OAuth user');
          // Create profile for OAuth user
          const displayName = user.user_metadata?.full_name || 
                             user.user_metadata?.name || 
                             user.email?.split('@')[0] || 
                             'User';
          
          let username = user.user_metadata?.user_name || 
                        user.user_metadata?.preferred_username || 
                        user.email?.split('@')[0]?.replace(/[^a-zA-Z0-9_]/g, '') ||
                        'user';
          
          // Ensure username is valid
          if (username.length < 3) {
            username = `user_${Date.now()}`;
          }
          
          // Check if username already exists and make it unique if needed
          const { data: existingUser } = await supabase
            .from('profiles')
            .select('username')
            .eq('username', username)
            .maybeSingle();
            
          if (existingUser) {
            username = `${username}_${Math.floor(Math.random() * 1000)}`;
          }
          
          console.log('Creating profile for OAuth user:', {
            id: user.id,
            username,
            name: displayName,
            email: user.email
          });
          
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              username: username,
              name: displayName,
              role: 'consumer', // Default role for OAuth users
              avatar_url: user.user_metadata?.avatar_url || 
                         user.user_metadata?.picture,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
            
          if (insertError) {
            console.error('Error creating OAuth profile:', insertError);
            throw insertError;
          }

          // Send welcome email
          try {
            await supabase.functions.invoke('send-welcome-email', {
              body: {
                to: user.email,
                name: displayName,
                role: 'consumer'
              }
            });
            console.log('Welcome email sent');
          } catch (emailError) {
            console.error('Error sending welcome email:', emailError);
            // Don't throw here, as the main signup was successful
          }
        } else {
          console.log('Profile already exists for OAuth user');
        }

        // Set the user in auth state
        console.log('Setting user in auth state');
        await setUser(user);
        
        // Navigate to home page
        console.log('Redirecting to home page');
        navigate('/', { replace: true });
        
      } catch (err) {
        console.error('Auth callback error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        
        // Redirect to signin with error after a delay
        setTimeout(() => {
          navigate('/signin', { 
            state: { 
              message: 'Authentication failed. Please try again.' 
            },
            replace: true 
          });
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate, setUser]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Completing authentication...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
          <h1 className="text-2xl font-semibold">Authentication Error</h1>
          <p className="text-muted-foreground">{error}</p>
          <p className="text-sm text-muted-foreground">
            Redirecting you back to sign in...
          </p>
        </div>
      </div>
    );
  }

  return null;
}