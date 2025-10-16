import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, ChevronLeft, Sparkles, ChevronRight, Heart, Brain, GraduationCap, Coffee, Mic, Headphones, Clock, Users } from "lucide-react";
const ageGroups = [
  { value: "under-18", label: "Under 18", icon: "🎓" },
  { value: "18-24", label: "18–24", icon: "🚀" },
  { value: "25-34", label: "25–34", icon: "💼" },
  { value: "35-44", label: "35–44", icon: "🏆" },
  { value: "45+", label: "45+", icon: "🌟" }
];
const primaryInterests = [
  {
    value: "fiction",
    label: "Fiction",
    description: "Novels, Stories, Drama, Romance",
    icon: /* @__PURE__ */ jsx(Heart, { className: "w-6 h-6" }),
    color: "from-pink-500 to-rose-500"
  },
  {
    value: "non-fiction",
    label: "Non-Fiction",
    description: "Self-Help, Business, Biographies, Philosophy",
    icon: /* @__PURE__ */ jsx(Brain, { className: "w-6 h-6" }),
    color: "from-blue-500 to-indigo-500"
  },
  {
    value: "education",
    label: "Education",
    description: "Academic, Research, Islamic Studies, Exam Prep",
    icon: /* @__PURE__ */ jsx(GraduationCap, { className: "w-6 h-6" }),
    color: "from-green-500 to-emerald-500"
  },
  {
    value: "entertainment",
    label: "Entertainment & Lifestyle",
    description: "Comedy, Health, Travel, Motivation",
    icon: /* @__PURE__ */ jsx(Coffee, { className: "w-6 h-6" }),
    color: "from-orange-500 to-amber-500"
  },
  {
    value: "podcasts",
    label: "Podcasts & Discussions",
    description: "Talk shows, Interviews, Social Issues",
    icon: /* @__PURE__ */ jsx(Mic, { className: "w-6 h-6" }),
    color: "from-purple-500 to-violet-500"
  }
];
const specificInterestsByCategory = {
  fiction: [
    "Romance",
    "Thriller",
    "Historical",
    "Fantasy",
    "Horror",
    "Urdu Classics"
  ],
  "non-fiction": [
    "Business",
    "Self-Help",
    "Finance/Investing",
    "Productivity",
    "Philosophy",
    "Psychology"
  ],
  education: [
    "School/College Texts",
    "Religious Studies",
    "Competitive Exams",
    "Research Papers",
    "Islamic Studies"
  ],
  entertainment: [
    "Health & Fitness",
    "Travel Stories",
    "Food",
    "Social Media Trends",
    "Motivation",
    "Comedy"
  ],
  podcasts: [
    "Expert Talks",
    "Storytelling",
    "Interviews",
    "Panel Discussions",
    "News & Current Affairs"
  ]
};
const timeCommitments = [
  { value: "less-1", label: "Less than 1 hour", icon: "⚡" },
  { value: "1-3", label: "1–3 hours", icon: "📚" },
  { value: "4-6", label: "4–6 hours", icon: "🎯" },
  { value: "7+", label: "7+ hours", icon: "🚀" }
];
const motivations = [
  { value: "learning", label: "For learning & growth", icon: "🧠" },
  { value: "entertainment", label: "For entertainment & relaxation", icon: "😌" },
  { value: "professional", label: "For professional/career skills", icon: "💼" },
  { value: "trends", label: "For staying updated with ideas & trends", icon: "📈" }
];
const formatPreferences = [
  { value: "audiobooks", label: "Audiobooks", icon: /* @__PURE__ */ jsx(Headphones, { className: "w-6 h-6" }) },
  { value: "summaries", label: "Summaries (Quick reads/listens)", icon: /* @__PURE__ */ jsx(Clock, { className: "w-6 h-6" }) },
  { value: "ebooks", label: "Full Ebooks", icon: /* @__PURE__ */ jsx(BookOpen, { className: "w-6 h-6" }) },
  { value: "community", label: "Community Discussions/Challenges", icon: /* @__PURE__ */ jsx(Users, { className: "w-6 h-6" }) }
];
function OnboardingQuiz() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [quizData, setQuizData] = useState({
    ageGroup: "",
    primaryInterest: "",
    specificInterests: [],
    timeCommitment: "",
    motivation: "",
    formatPreference: ""
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
    localStorage.setItem("onboardingData", JSON.stringify(quizData));
    navigate("/signup");
  };
  const handleSkip = () => {
    navigate("/signup");
  };
  const updateQuizData = (field, value) => {
    setQuizData((prev) => ({ ...prev, [field]: value }));
  };
  const toggleSpecificInterest = (interest) => {
    setQuizData((prev) => ({
      ...prev,
      specificInterests: prev.specificInterests.includes(interest) ? prev.specificInterests.filter((i) => i !== interest) : [...prev.specificInterests, interest]
    }));
  };
  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return quizData.ageGroup !== "";
      case 2:
        return quizData.primaryInterest !== "";
      case 3:
        return quizData.specificInterests.length > 0;
      case 4:
        return quizData.timeCommitment !== "";
      case 5:
        return quizData.motivation !== "";
      case 6:
        return quizData.formatPreference !== "";
      default:
        return false;
    }
  };
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
            /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold mb-2", children: "What's your age group?" }),
            /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "This helps us personalize your experience" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: ageGroups.map((group) => /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => updateQuizData("ageGroup", group.value),
              className: `p-4 rounded-lg border-2 transition-all text-left ${quizData.ageGroup === group.value ? "border-primary bg-primary/10 text-primary" : "border-input hover:border-primary/50"}`,
              children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx("span", { className: "text-2xl", children: group.icon }),
                /* @__PURE__ */ jsx("span", { className: "font-medium", children: group.label })
              ] })
            },
            group.value
          )) })
        ] });
      case 2:
        return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
            /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold mb-2", children: "Which type of content excites you most?" }),
            /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Choose your primary area of interest" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "space-y-4", children: primaryInterests.map((interest) => /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => updateQuizData("primaryInterest", interest.value),
              className: `w-full p-4 rounded-lg border-2 transition-all text-left ${quizData.primaryInterest === interest.value ? "border-primary bg-primary/10" : "border-input hover:border-primary/50"}`,
              children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
                /* @__PURE__ */ jsx("div", { className: `w-12 h-12 rounded-lg bg-gradient-to-br ${interest.color} flex items-center justify-center text-white`, children: interest.icon }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("h3", { className: "font-semibold", children: interest.label }),
                  /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: interest.description })
                ] })
              ] })
            },
            interest.value
          )) })
        ] });
      case 3:
        const availableInterests = specificInterestsByCategory[quizData.primaryInterest] || [];
        return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
            /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold mb-2", children: "What specifically interests you?" }),
            /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Select all that apply (you can choose multiple)" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-3", children: availableInterests.map((interest) => /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => toggleSpecificInterest(interest),
              className: `p-3 rounded-lg border-2 transition-all text-center text-sm ${quizData.specificInterests.includes(interest) ? "border-primary bg-primary/10 text-primary" : "border-input hover:border-primary/50"}`,
              children: interest
            },
            interest
          )) })
        ] });
      case 4:
        return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
            /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold mb-2", children: "How much time can you dedicate?" }),
            /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Per week for reading/listening" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: timeCommitments.map((time) => /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => updateQuizData("timeCommitment", time.value),
              className: `p-4 rounded-lg border-2 transition-all text-left ${quizData.timeCommitment === time.value ? "border-primary bg-primary/10 text-primary" : "border-input hover:border-primary/50"}`,
              children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx("span", { className: "text-2xl", children: time.icon }),
                /* @__PURE__ */ jsx("span", { className: "font-medium", children: time.label })
              ] })
            },
            time.value
          )) })
        ] });
      case 5:
        return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
            /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold mb-2", children: "What's your main goal?" }),
            /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Why do you want to use Inlits?" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "space-y-3", children: motivations.map((motivation) => /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => updateQuizData("motivation", motivation.value),
              className: `w-full p-4 rounded-lg border-2 transition-all text-left ${quizData.motivation === motivation.value ? "border-primary bg-primary/10 text-primary" : "border-input hover:border-primary/50"}`,
              children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx("span", { className: "text-2xl", children: motivation.icon }),
                /* @__PURE__ */ jsx("span", { className: "font-medium", children: motivation.label })
              ] })
            },
            motivation.value
          )) })
        ] });
      case 6:
        return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
            /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold mb-2", children: "Which format do you prefer?" }),
            /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Choose your favorite way to consume content" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: formatPreferences.map((format) => /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => updateQuizData("formatPreference", format.value),
              className: `p-4 rounded-lg border-2 transition-all text-center ${quizData.formatPreference === format.value ? "border-primary bg-primary/10 text-primary" : "border-input hover:border-primary/50"}`,
              children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-2", children: [
                format.icon,
                /* @__PURE__ */ jsx("span", { className: "font-medium", children: format.label })
              ] })
            },
            format.value
          )) })
        ] });
      default:
        return null;
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-background flex items-center justify-center p-4", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-2xl", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center mb-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-2 mb-4", children: [
        /* @__PURE__ */ jsx(BookOpen, { className: "w-8 h-8 text-primary" }),
        /* @__PURE__ */ jsx("span", { className: "text-2xl font-bold", children: "Inlits" })
      ] }),
      /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold mb-2", children: "Let's personalize your experience" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "This will take about 2 minutes" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mb-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
        /* @__PURE__ */ jsxs("span", { className: "text-sm text-muted-foreground", children: [
          "Step ",
          currentStep,
          " of ",
          totalSteps
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleSkip,
            className: "text-sm text-primary hover:underline",
            children: "Skip Quiz"
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "h-2 bg-muted rounded-full overflow-hidden", children: /* @__PURE__ */ jsx(
        "div",
        {
          className: "h-full bg-primary transition-all duration-300",
          style: { width: `${currentStep / totalSteps * 100}%` }
        }
      ) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "bg-card border rounded-xl p-8 mb-8", children: renderStep() }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: handleBack,
          disabled: currentStep === 1,
          className: "flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
          children: [
            /* @__PURE__ */ jsx(ChevronLeft, { className: "w-4 h-4" }),
            "Back"
          ]
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: Array.from({ length: totalSteps }).map((_, i) => /* @__PURE__ */ jsx(
        "div",
        {
          className: `w-2 h-2 rounded-full transition-colors ${i + 1 <= currentStep ? "bg-primary" : "bg-muted"}`
        },
        i
      )) }),
      currentStep === totalSteps ? /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: handleComplete,
          disabled: !canProceed(),
          className: "flex items-center gap-2 px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
          children: [
            /* @__PURE__ */ jsx(Sparkles, { className: "w-4 h-4" }),
            "Complete Setup"
          ]
        }
      ) : /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: handleNext,
          disabled: !canProceed(),
          className: "flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
          children: [
            "Next",
            /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4" })
          ]
        }
      )
    ] }),
    currentStep === totalSteps && /* @__PURE__ */ jsxs("div", { className: "mt-8 p-6 bg-primary/5 border border-primary/20 rounded-lg text-center", children: [
      /* @__PURE__ */ jsx(Sparkles, { className: "w-8 h-8 text-primary mx-auto mb-3" }),
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold mb-2", children: "Great! We've built a personalized feed for you 🎧" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Based on your preferences, we'll show you the best content to help you achieve your goals" })
    ] })
  ] }) });
}
export {
  OnboardingQuiz
};
