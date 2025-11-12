import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Sparkles, Clock, Target, BookOpen, Headphones, Users, Brain, Heart, Briefcase, GraduationCap, Mic, Coffee } from 'lucide-react';

interface QuizData {
  ageGroup: string;
  primaryInterest: string;
  specificInterests: string[];
  timeCommitment: string;
  motivation: string;
  formatPreference: string;
}

const ageGroups = [
  { value: 'under-18', label: 'Under 18', icon: '🎓' },
  { value: '18-24', label: '18–24', icon: '🚀' },
  { value: '25-34', label: '25–34', icon: '💼' },
  { value: '35-44', label: '35–44', icon: '🏆' },
  { value: '45+', label: '45+', icon: '🌟' }
];

const primaryInterests = [
  { 
    value: 'fiction', 
    label: 'Fiction', 
    description: 'Novels, Stories, Drama, Romance',
    icon: <Heart className="w-6 h-6" />,
    color: 'from-pink-500 to-rose-500'
  },
  { 
    value: 'non-fiction', 
    label: 'Non-Fiction', 
    description: 'Self-Help, Business, Biographies, Philosophy',
    icon: <Brain className="w-6 h-6" />,
    color: 'from-blue-500 to-indigo-500'
  },
  { 
    value: 'education', 
    label: 'Education', 
    description: 'Academic, Research, Islamic Studies, Exam Prep',
    icon: <GraduationCap className="w-6 h-6" />,
    color: 'from-green-500 to-emerald-500'
  },
  { 
    value: 'entertainment', 
    label: 'Entertainment & Lifestyle', 
    description: 'Comedy, Health, Travel, Motivation',
    icon: <Coffee className="w-6 h-6" />,
    color: 'from-orange-500 to-amber-500'
  },
  { 
    value: 'podcasts', 
    label: 'Podcasts & Discussions', 
    description: 'Talk shows, Interviews, Social Issues',
    icon: <Mic className="w-6 h-6" />,
    color: 'from-purple-500 to-violet-500'
  }
];

const specificInterestsByCategory = {
  fiction: [
    'Romance', 'Thriller', 'Historical', 'Fantasy', 'Horror', 'Urdu Classics'
  ],
  'non-fiction': [
    'Business', 'Self-Help', 'Finance/Investing', 'Productivity', 'Philosophy', 'Psychology'
  ],
  education: [
    'School/College Texts', 'Religious Studies', 'Competitive Exams', 'Research Papers', 'Islamic Studies'
  ],
  entertainment: [
    'Health & Fitness', 'Travel Stories', 'Food', 'Social Media Trends', 'Motivation', 'Comedy'
  ],
  podcasts: [
    'Expert Talks', 'Storytelling', 'Interviews', 'Panel Discussions', 'News & Current Affairs'
  ]
};

const timeCommitments = [
  { value: 'less-1', label: 'Less than 1 hour', icon: '⚡' },
  { value: '1-3', label: '1–3 hours', icon: '📚' },
  { value: '4-6', label: '4–6 hours', icon: '🎯' },
  { value: '7+', label: '7+ hours', icon: '🚀' }
];

const motivations = [
  { value: 'learning', label: 'For learning & growth', icon: '🧠' },
  { value: 'entertainment', label: 'For entertainment & relaxation', icon: '😌' },
  { value: 'professional', label: 'For professional/career skills', icon: '💼' },
  { value: 'trends', label: 'For staying updated with ideas & trends', icon: '📈' }
];

const formatPreferences = [
  { value: 'audiobooks', label: 'Audiobooks', icon: <Headphones className="w-6 h-6" /> },
  { value: 'summaries', label: 'Summaries (Quick reads/listens)', icon: <Clock className="w-6 h-6" /> },
  { value: 'ebooks', label: 'Full Ebooks', icon: <BookOpen className="w-6 h-6" /> },
  { value: 'community', label: 'Community Discussions/Challenges', icon: <Users className="w-6 h-6" /> }
];

export function OnboardingQuiz() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [quizData, setQuizData] = useState<QuizData>({
    ageGroup: '',
    primaryInterest: '',
    specificInterests: [],
    timeCommitment: '',
    motivation: '',
    formatPreference: ''
  });

  const totalSteps = 6;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Store quiz data in localStorage for use during signup
    localStorage.setItem('onboardingData', JSON.stringify(quizData));
    
    // Navigate to signup with quiz completion flag
    navigate('/signup');
  };

  const handleSkip = () => {
    navigate('/signup');
  };

  const updateQuizData = (field: keyof QuizData, value: any) => {
    setQuizData(prev => ({ ...prev, [field]: value }));
  };

  const toggleSpecificInterest = (interest: string) => {
    setQuizData(prev => ({
      ...prev,
      specificInterests: prev.specificInterests.includes(interest)
        ? prev.specificInterests.filter(i => i !== interest)
        : [...prev.specificInterests, interest]
    }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return quizData.ageGroup !== '';
      case 2: return quizData.primaryInterest !== '';
      case 3: return quizData.specificInterests.length > 0;
      case 4: return quizData.timeCommitment !== '';
      case 5: return quizData.motivation !== '';
      case 6: return quizData.formatPreference !== '';
      default: return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">What's your age group?</h2>
              <p className="text-muted-foreground">This helps us personalize your experience</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ageGroups.map(group => (
                <button
                  key={group.value}
                  onClick={() => updateQuizData('ageGroup', group.value)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    quizData.ageGroup === group.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-input hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{group.icon}</span>
                    <span className="font-medium">{group.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Which type of content excites you most?</h2>
              <p className="text-muted-foreground">Choose your primary area of interest</p>
            </div>
            <div className="space-y-4">
              {primaryInterests.map(interest => (
                <button
                  key={interest.value}
                  onClick={() => updateQuizData('primaryInterest', interest.value)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    quizData.primaryInterest === interest.value
                      ? 'border-primary bg-primary/10'
                      : 'border-input hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${interest.color} flex items-center justify-center text-white`}>
                      {interest.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold">{interest.label}</h3>
                      <p className="text-sm text-muted-foreground">{interest.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        const availableInterests = specificInterestsByCategory[quizData.primaryInterest as keyof typeof specificInterestsByCategory] || [];
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">What specifically interests you?</h2>
              <p className="text-muted-foreground">Select all that apply (you can choose multiple)</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {availableInterests.map(interest => (
                <button
                  key={interest}
                  onClick={() => toggleSpecificInterest(interest)}
                  className={`p-3 rounded-lg border-2 transition-all text-center text-sm ${
                    quizData.specificInterests.includes(interest)
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-input hover:border-primary/50'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">How much time can you dedicate?</h2>
              <p className="text-muted-foreground">Per week for reading/listening</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {timeCommitments.map(time => (
                <button
                  key={time.value}
                  onClick={() => updateQuizData('timeCommitment', time.value)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    quizData.timeCommitment === time.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-input hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{time.icon}</span>
                    <span className="font-medium">{time.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">What's your main goal?</h2>
              <p className="text-muted-foreground">Why do you want to use Inlits?</p>
            </div>
            <div className="space-y-3">
              {motivations.map(motivation => (
                <button
                  key={motivation.value}
                  onClick={() => updateQuizData('motivation', motivation.value)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    quizData.motivation === motivation.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-input hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{motivation.icon}</span>
                    <span className="font-medium">{motivation.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Which format do you prefer?</h2>
              <p className="text-muted-foreground">Choose your favorite way to consume content</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {formatPreferences.map(format => (
                <button
                  key={format.value}
                  onClick={() => updateQuizData('formatPreference', format.value)}
                  className={`p-4 rounded-lg border-2 transition-all text-center ${
                    quizData.formatPreference === format.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-input hover:border-primary/50'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    {format.icon}
                    <span className="font-medium">{format.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold">Inlits</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Let's personalize your experience</h1>
          <p className="text-muted-foreground">This will take about 2 minutes</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Step {currentStep} of {totalSteps}</span>
            <button
              onClick={handleSkip}
              className="text-sm text-primary hover:underline"
            >
              Skip Quiz
            </button>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Quiz Content */}
        <div className="bg-card border rounded-xl p-8 mb-8">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i + 1 <= currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          {currentStep === totalSteps ? (
            <button
              onClick={handleComplete}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-4 h-4" />
              Complete Setup
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Completion Preview */}
        {currentStep === totalSteps && (
          <div className="mt-8 p-6 bg-primary/5 border border-primary/20 rounded-lg text-center">
            <Sparkles className="w-8 h-8 text-primary mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-2">Great! We've built a personalized feed for you 🎧</h3>
            <p className="text-sm text-muted-foreground">
              Based on your preferences, we'll show you the best content to help you achieve your goals
            </p>
          </div>
        )}
      </div>
    </div>
  );
}