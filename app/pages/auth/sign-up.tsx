import React, { useState, useEffect } from 'react';
import { useNavigate } from '@remix-run/react';
import { useAuth } from '@/lib/auth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Link } from '@remix-run/react';
export function SignUpPage() {
  const navigate = useNavigate();
  const { signUp, user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: ''
  });
  const [usernameError, setUsernameError] = useState<string | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !authLoading) {
      navigate('/', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const validateUsername = (value: string): boolean => {
    if (value.length < 3) {
      setUsernameError('Username must be at least 3 characters long');
      return false;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      setUsernameError('Username can only contain letters, numbers, and underscores');
      return false;
    }
    setUsernameError(null);
    return true;
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'username') {
      validateUsername(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateUsername(formData.username)) {
      return;
    }

    setLoading(true);

    try {
      // Always create as consumer for simple signup
      await signUp(formData.email, formData.password, formData.username, 'consumer');
      
      navigate('/signin', { 
        state: { 
          message: 'Account created successfully! Please sign in to start your learning journey.' 
        },
        replace: true
      });
    } catch (err) {
      console.error('Signup error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create account');
      setLoading(false);
    }
  };

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="container max-w-[400px] mx-auto px-4 py-8 flex justify-center">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // If already authenticated, don't render the form
  if (user) {
    return null;
  }

  return (
    <div className="container max-w-[400px] mx-auto px-4 py-8">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Join Inlits</h1>
          <p className="text-sm text-muted-foreground">
            Start your learning journey today
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="name@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              placeholder="johndoe"
              required
              autoComplete="username"
              className={usernameError ? 'border-destructive' : ''}
            />
            {usernameError && (
              <p className="text-sm text-destructive">{usernameError}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
                autoComplete="new-password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-sm text-destructive">{error}</div>
          )}

          <button
            type="submit"
            className="w-full inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:opacity-50"
            disabled={loading || !!usernameError}
          >
            {loading ? 'Creating account...' : 'Join Inlits'}
          </button>
        </form>

        <div className="text-center text-sm">
          Already have an account?{' '}
          <Link to="/signin" className="text-primary hover:underline">
            Login
          </Link>
        </div>

      </div>
    </div>
  );
}