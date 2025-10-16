import { create } from 'zustand';
import { supabase } from './supabase';
import type { User, Provider } from '@supabase/supabase-js';
import type { Profile, UserRole } from './types';

const isBrowser = typeof window !== 'undefined';

type StorageLike = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

const safeStorage: StorageLike = isBrowser && typeof window.localStorage !== 'undefined'
  ? window.localStorage
  : {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {}
    };

const cachedProfile: Profile | null = (() => {
  if (!isBrowser) return null;
  try {
    const raw = safeStorage.getItem('userProfile');
    return raw ? (JSON.parse(raw) as Profile) : null;
  } catch (error) {
    console.warn('Failed to restore cached profile:', error);
    return null;
  }
})();

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string, role: UserRole) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithProvider: (provider: Provider) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  resendVerificationEmail: () => Promise<void>;
  isAuthenticated: () => boolean;
  hasRole: (roles: UserRole[]) => boolean;
  refreshSession: () => Promise<void>;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  profile: cachedProfile,
  loading: true,

  refreshSession: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      
      if (session?.user) {
        set({ user: session.user });
        
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError) throw profileError;
        if (profile) {
          set({ profile });
          safeStorage.setItem('userProfile', JSON.stringify(profile));
        }
      } else {
        set({ user: null, profile: null });
        safeStorage.removeItem('userProfile');
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
      set({ user: null, profile: null });
      safeStorage.removeItem('userProfile');
    } finally {
      set({ loading: false });
    }
  },

  signUp: async (email: string, password: string, username: string, role: UserRole) => {
    try {
      console.log('Creating user account with role:', role);
      
      // Simple signup without metadata to avoid database trigger issues
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });

      if (error) throw error;
      if (!data.user) throw new Error('No user returned from signup');

      console.log('User created successfully, now creating profile...');
      
      // Create profile manually with proper role
      await new Promise(resolve => setTimeout(resolve, 1000)); // Brief delay
      
      // Create profile with the specified role
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          username: username,
          role: role, // Use the role parameter directly
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        // If it's a duplicate key error, try to update the existing profile
        if (profileError.code === '23505') {
          console.log('Profile already exists, updating role...');
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ 
              role: role,
              username: username,
              updated_at: new Date().toISOString()
            })
            .eq('id', data.user.id);
            
          if (updateError) {
            console.error('Error updating profile role:', updateError);
            throw new Error('Failed to set user role. Please try again.');
          }
        } else {
          console.error('Profile creation error:', profileError);
          throw new Error('Failed to create user profile. Please try again.');
        }
      }
      
      // Verify profile was created with correct role
      const { data: verifyProfile, error: verifyError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();
      
      if (verifyError) {
        console.error('Error verifying profile:', verifyError);
        throw new Error('Account created but profile verification failed. Please try signing in.');
      }

      if (verifyProfile) {
        console.log('Profile created successfully with role:', verifyProfile.role);
      } else {
        console.warn('Profile not found after creation, but user was created successfully');
      }
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      set({ loading: true });

      const { data: { user, session }, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;
      if (!user) throw new Error('No user returned from sign in');

      set({ user });

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Profile error:', profileError);
        
        // If profile doesn't exist, try to create it
        if (profileError.code === 'PGRST116' || !profile) {
          try {
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                username: email.split('@')[0],
                role: 'consumer',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
              
            if (insertError) {
              console.error('Error creating profile on sign in:', insertError);
              throw insertError;
            }
            
            // Fetch the newly created profile
            const { data: newProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single();
              
            if (newProfile) {
              set({ profile: newProfile, loading: false });
              safeStorage.setItem('userProfile', JSON.stringify(newProfile));
              return;
            }
          } catch (insertError: any) {
            console.error('Error creating profile on sign in:', insertError);
            
            // If it's a duplicate key error (23505), try to fetch the existing profile
            if (insertError.code === '23505' || insertError.message?.includes('duplicate key')) {
              console.log('Profile already exists during sign in, fetching existing profile');
              const { data: existingProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
                
              if (existingProfile) {
                console.log('Successfully fetched existing profile during sign in');
                set({ profile: existingProfile, loading: false });
                safeStorage.setItem('userProfile', JSON.stringify(existingProfile));
                return;
              }
            }
            
            throw new Error('Failed to create user profile. Please try again.');
          }
        }
        
        throw new Error('Failed to load user profile. Please try again.');
      }

      if (!profile) throw new Error('No profile found');

      // Send welcome email for new users
      try {
        await supabase.functions.invoke('send-welcome-email', {
          body: {
            to: email,
            name: profile.name || profile.username,
            role: profile.role
          }
        });
        console.log('Welcome email sent successfully');
      } catch (emailError) {
        console.error('Error sending welcome email:', emailError);
        // Don't throw here, as the main signup was successful
      }

      safeStorage.setItem('sb-session', JSON.stringify(session));
      set({ profile, loading: false });
      safeStorage.setItem('userProfile', JSON.stringify(profile));
    } catch (error) {
      set({ user: null, profile: null, loading: false });
      safeStorage.removeItem('sb-session');
      safeStorage.removeItem('userProfile');
      throw error;
    }
  },

  signInWithProvider: async (provider: Provider) => {
    try {
      const redirectTo =
        typeof window !== 'undefined'
          ? `${window.location.origin}/auth/callback`
          : undefined;

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo
        }
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('OAuth sign in error:', error);
      throw error;
    }
  },

  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      safeStorage.removeItem('sb-session');
      safeStorage.removeItem('userProfile');
      
      set({ user: null, profile: null, loading: false });
      
      // Force a page reload to clear all state
      if (isBrowser) {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Error signing out:', error);
      safeStorage.removeItem('sb-session');
      safeStorage.removeItem('userProfile');
      set({ user: null, profile: null, loading: false });
      if (isBrowser) {
        window.location.href = '/';
      }
    }
  },

  setUser: async (user) => {
    if (!user) {
      set({ user: null, profile: null, loading: false });
      safeStorage.removeItem('userProfile');
      return;
    }

    console.log('Setting user:', user.email, 'Provider:', user.app_metadata?.provider);
    set({ user, loading: true });

    try {
      const cachedProfile = safeStorage.getItem('userProfile');
      if (cachedProfile) {
        const profile = JSON.parse(cachedProfile);
        if (profile.id === user.id) {
          console.log('Using cached profile');
          set({ profile, loading: false });
          return;
        }
      }

      console.log('Fetching profile from database');
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        
        // If profile doesn't exist, try to create it
        if (error.code === 'PGRST116' || !profile) {
          console.log('Profile not found, creating new profile for OAuth user');
          // For OAuth users, extract info from user metadata
          const displayName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User';
          let username = user.user_metadata?.user_name || user.user_metadata?.preferred_username || user.email?.split('@')[0]?.replace(/[^a-zA-Z0-9_]/g, '');
          
          // Ensure username is valid and unique
          if (!username || username.length < 3) {
            username = `user_${Date.now()}`;
          }
          
          // Check if username already exists and make it unique if needed
          const { data: existingUser } = await supabase
            .from('profiles')
            .select('username')
            .eq('username', username)
            .maybeSingle();
            
          if (existingUser) {
            username = `${username}_${Date.now()}`;
          }
          
          console.log('Creating profile with username:', username);
          
          try {
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                username: username,
                name: displayName,
                role: 'consumer',
                avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
              
            if (insertError) {
              console.error('Error creating profile on setUser:', insertError);
              throw insertError;
            }
            
            // Fetch the newly created profile
            const { data: newProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single();
              
            if (newProfile) {
              console.log('Successfully created and fetched new profile');
              safeStorage.setItem('userProfile', JSON.stringify(newProfile));
              set({ profile: newProfile, loading: false });
              
              // Send welcome email for new OAuth users
              try {
                await supabase.functions.invoke('send-welcome-email', {
                  body: {
                    to: user.email,
                    name: displayName,
                    role: 'consumer'
                  }
                });
                console.log('Welcome email sent successfully');
              } catch (emailError) {
                console.error('Error sending welcome email:', emailError);
              }
              
              return;
            }
          } catch (insertError: any) {
            console.error('Error creating profile on setUser:', insertError);
            
            // If it's a duplicate key error (23505), try to fetch the existing profile
            if (insertError.code === '23505' || insertError.message?.includes('duplicate key')) {
              console.log('Profile already exists, fetching existing profile');
              const { data: existingProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
                
              if (existingProfile) {
                console.log('Successfully fetched existing profile after duplicate key error');
                safeStorage.setItem('userProfile', JSON.stringify(existingProfile));
                set({ profile: existingProfile, loading: false });
                return;
              }
            }
          }
        }
        
        set({ loading: false });
        return;
      }
      
      if (profile) {
        console.log('Profile found, setting in state');
        safeStorage.setItem('userProfile', JSON.stringify(profile));
        set({ profile, loading: false });
      } else {
        console.log('No profile found');
        set({ loading: false });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      set({ loading: false });
    }
  },

  setProfile: (profile) => {
    if (profile) {
      safeStorage.setItem('userProfile', JSON.stringify(profile));
    }
    set({ profile, loading: false });
  },

  resendVerificationEmail: async () => {
    const { user } = get();
    if (!user?.email) throw new Error('No email address found');

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: user.email,
      options: {
        emailRedirectTo: isBrowser ? `${window.location.origin}/verify-email` : undefined,
      },
    });
    if (error) throw error;
  },

  isAuthenticated: () => {
    const { user, profile } = get();
    return !!user && !!profile;
  },

  hasRole: (roles: UserRole[]) => {
    const { profile } = get();
    return !!profile && roles.includes(profile.role);
  },
}));

// Helper function to create profile manually
async function createProfileManually(userId: string, username: string, role: UserRole) {
  try {
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        username,
        role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('Error creating profile:', insertError);
      
      if (insertError.message?.includes('duplicate key')) {
        console.log('Profile already exists, continuing...');
        return;
      }
      
      // Don't throw error here - user was created successfully
      console.warn('Profile creation failed but user exists. User can complete profile later.');
    }
  } catch (error) {
    console.error('Failed to create profile manually:', error);
    // Don't throw - user creation was successful
  }
}

const initAuth = async () => {
  try {
    useAuth.setState({ loading: true });

    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error getting initial session:', error);
      useAuth.setState({ user: null, profile: null, loading: false });
      return;
    }

    if (session?.user) {
      await useAuth.getState().setUser(session.user);
    } else {
      useAuth.setState({ user: null, profile: null, loading: false });
    }
  } catch (error) {
    console.error('Error initializing auth:', error);
    useAuth.setState({ user: null, profile: null, loading: false });
  }
};

if (isBrowser) {
  initAuth();

  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state change:', event, session?.user?.email);

    (async () => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          console.log('User signed in, setting user state');
          await useAuth.getState().setUser(session.user);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        useAuth.setState({ user: null, profile: null, loading: false });
      }
    })();
  });
}
