import React, { useState } from 'react';
import { useNavigate, Link } from '@remix-run/react';
import { useAuth } from '@/lib/auth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronLeft, ChevronRight, Upload, Eye, EyeOff, Loader2, BookOpen, FileText, Headphones, Mic, Users, Target, Zap } from 'lucide-react';
import { CATEGORIES } from '@/lib/constants/categories';

export function BecomeCreatorPage() {
  const navigate = useNavigate();
  const { signUp, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    // Personal Info
    fullName: '',
    email: '',
    username: '',
    password: '',
    
    // Creator Info
    bio: '',
    expertise: [] as string[],
    contentTypes: [] as string[],
    sampleWork: '',
    socialLinks: {
      website: '',
      twitter: '',
      linkedin: '',
      youtube: ''
    }
  });

  const contentTypeOptions = [
    { value: 'articles', label: 'Articles & Blog Posts', icon: <FileText className="w-5 h-5" /> },
    { value: 'books', label: 'Books & E-books', icon: <BookOpen className="w-5 h-5" /> },
    { value: 'audiobooks', label: 'Audiobooks', icon: <Headphones className="w-5 h-5" /> },
    { value: 'podcasts', label: 'Podcasts', icon: <Mic className="w-5 h-5" /> }
  ];

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => {
        const parentKey = parent as keyof typeof prev;
        const parentValue = prev[parentKey];

        if (typeof parentValue !== 'object' || parentValue === null) {
          return prev;
        }

        return {
          ...prev,
          [parentKey]: {
            ...(parentValue as Record<string, unknown>),
            [child]: value
          }
        };
      });
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const toggleExpertise = (category: string) => {
    setFormData(prev => ({
      ...prev,
      expertise: prev.expertise.includes(category)
        ? prev.expertise.filter(c => c !== category)
        : [...prev.expertise, category]
    }));
  };

  const toggleContentType = (type: string) => {
    setFormData(prev => ({
      ...prev,
      contentTypes: prev.contentTypes.includes(type)
        ? prev.contentTypes.filter(t => t !== type)
        : [...prev.contentTypes, type]
    }));
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError('Full name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!formData.username.trim()) {
      setError('Username is required');
      return false;
    }
    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters');
      return false;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      setError('Username can only contain letters, numbers, and underscores');
      return false;
    }
    if (!formData.password.trim()) {
      setError('Password is required');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    if (!formData.bio.trim()) {
      setError('Bio is required');
      return false;
    }
    if (formData.expertise.length === 0) {
      setError('Please select at least one area of expertise');
      return false;
    }
    if (formData.contentTypes.length === 0) {
      setError('Please select at least one content type you plan to create');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      // If user is already logged in, we need to update their role
      if (user) {
        // TODO: Implement role upgrade for existing users
        setError('Role upgrade for existing users will be available soon');
        return;
      }

      // Create new creator account
      await signUp(
        formData.email,
        formData.password,
        formData.username,
        'creator'
      );

      // Store additional creator data for profile completion
      localStorage.setItem('creatorOnboardingData', JSON.stringify({
        fullName: formData.fullName,
        bio: formData.bio,
        expertise: formData.expertise,
        contentTypes: formData.contentTypes,
        sampleWork: formData.sampleWork,
        socialLinks: formData.socialLinks
      }));

      // Navigate to success page or dashboard
      navigate('/signin', {
        state: {
          message: 'Creator account created successfully! Please sign in to complete your profile setup.'
        }
      });
    } catch (err) {
      console.error('Creator signup error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create creator account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold">Become a Creator</h1>
            <p className="text-muted-foreground">
              Share your knowledge and build an audience on Inlits
            </p>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="text-center p-6 rounded-lg bg-card border">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Build Your Audience</h3>
            <p className="text-sm text-muted-foreground">
              Reach thousands of engaged learners who are hungry for quality content
            </p>
          </div>
          
          <div className="text-center p-6 rounded-lg bg-card border">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Monetize Your Knowledge</h3>
            <p className="text-sm text-muted-foreground">
              Earn money from your content through subscriptions and one-time purchases
            </p>
          </div>
          
          <div className="text-center p-6 rounded-lg bg-card border">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Powerful Tools</h3>
            <p className="text-sm text-muted-foreground">
              Access advanced analytics, publishing tools, and community features
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-card border rounded-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Personal Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="Your full name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    placeholder="your_username"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    This will be your unique identifier on Inlits
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Create a strong password"
                      className="pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Creator Information */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Creator Information</h2>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Tell us about yourself and what you create..."
                  className="w-full px-3 py-2 rounded-md border bg-background min-h-[100px] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  {formData.bio.length}/500 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label>Areas of Expertise</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Select the topics you're knowledgeable about
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {CATEGORIES.slice(0, 16).map(category => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => toggleExpertise(category)}
                      className={`p-2 text-sm rounded-lg border transition-colors ${
                        formData.expertise.includes(category)
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-input hover:border-primary/50'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Content Types You Plan to Create</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {contentTypeOptions.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => toggleContentType(option.value)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        formData.contentTypes.includes(option.value)
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-input hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {option.icon}
                        <span className="font-medium">{option.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sampleWork">Sample Work or Portfolio (Optional)</Label>
                <textarea
                  id="sampleWork"
                  value={formData.sampleWork}
                  onChange={(e) => handleInputChange('sampleWork', e.target.value)}
                  placeholder="Share links to your previous work, portfolio, or describe your experience..."
                  className="w-full px-3 py-2 rounded-md border bg-background min-h-[80px] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Social Links (Optional)</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.socialLinks.website}
                    onChange={(e) => handleInputChange('socialLinks.website', e.target.value)}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter</Label>
                  <Input
                    id="twitter"
                    value={formData.socialLinks.twitter}
                    onChange={(e) => handleInputChange('socialLinks.twitter', e.target.value)}
                    placeholder="@yourusername"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    type="url"
                    value={formData.socialLinks.linkedin}
                    onChange={(e) => handleInputChange('socialLinks.linkedin', e.target.value)}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="youtube">YouTube</Label>
                  <Input
                    id="youtube"
                    type="url"
                    value={formData.socialLinks.youtube}
                    onChange={(e) => handleInputChange('socialLinks.youtube', e.target.value)}
                    placeholder="https://youtube.com/@yourchannel"
                  />
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <div className="flex items-center justify-between pt-6 border-t">
              <div className="text-sm text-muted-foreground">
                By creating an account, you agree to our{' '}
                <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-8 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 font-medium"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Creator Account
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Already have account */}
        <div className="text-center mt-8">
          <span className="text-muted-foreground">Already have an account? </span>
          <Link to="/signin" className="text-primary hover:underline font-medium">
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
}
