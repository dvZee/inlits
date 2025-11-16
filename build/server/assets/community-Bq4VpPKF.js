import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useSearchParams } from "react-router-dom";
import React__default, { useState, useEffect } from "react";
import { u as useAuth, f as formatTimeAgo, s as supabase } from "./server-build-CQlMvEI0.js";
import { AlertCircle, Plus, MessageSquare, ThumbsUp, MessageCircle, Users, Target, Calendar, Trophy, ArrowRight, Clock, BookOpen, ChevronUp, ChevronDown } from "lucide-react";
import "node:stream";
import "isbot";
import "@remix-run/react";
import "react-dom/server";
import "@supabase/supabase-js";
import "zustand";
import "@remix-run/node";
import "clsx";
import "tailwind-merge";
function Discussions() {
  const { user } = useAuth();
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const loadDiscussions = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data: discussionsData, error: discussionsError } = await supabase.from("book_club_discussions").select(`
            *,
            author:profiles!book_club_discussions_creator_id_fkey (
              id,
              name,
              username,
              avatar_url
            ),
            club:book_clubs!book_club_discussions_club_id_fkey (
              name
            )
          `).order("created_at", { ascending: false });
        if (discussionsError) throw discussionsError;
        setDiscussions(discussionsData || []);
      } catch (err) {
        console.error("Error loading discussions:", err);
        setError(err instanceof Error ? err.message : "Failed to load discussions");
      } finally {
        setLoading(false);
      }
    };
    loadDiscussions();
  }, []);
  const handleLike = async (id) => {
    if (!user) return;
    try {
      console.log("Liked discussion:", id);
    } catch (err) {
      console.error("Error liking discussion:", err);
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "space-y-4", children: Array.from({ length: 3 }).map((_, i) => /* @__PURE__ */ jsxs("div", { className: "bg-card border rounded-lg p-6 animate-pulse", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
        /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-full bg-muted" }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2 flex-1", children: [
          /* @__PURE__ */ jsx("div", { className: "h-4 bg-muted rounded w-1/3" }),
          /* @__PURE__ */ jsx("div", { className: "h-3 bg-muted rounded w-1/4" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx("div", { className: "h-4 bg-muted rounded w-3/4" }),
        /* @__PURE__ */ jsx("div", { className: "h-3 bg-muted rounded w-1/2" })
      ] })
    ] }, i)) });
  }
  if (error) {
    return /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
      /* @__PURE__ */ jsx(AlertCircle, { className: "w-12 h-12 text-destructive mx-auto mb-4" }),
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium mb-2", children: "Failed to load discussions" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mb-4", children: error }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => window.location.reload(),
          className: "text-primary hover:underline",
          children: "Try again"
        }
      )
    ] });
  }
  if (discussions.length === 0) {
    return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold", children: "Discussions" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Join the conversation and share your knowledge" })
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => {
            },
            className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90",
            children: [
              /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4 mr-2" }),
              "New Discussion"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
        /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4", children: /* @__PURE__ */ jsx(MessageSquare, { className: "w-8 h-8 text-primary" }) }),
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium mb-2", children: "No discussions yet" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mb-6 max-w-md mx-auto", children: "Discussions will be available soon! We're working on exciting features to help you connect with fellow learners and share knowledge." }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => {
            },
            className: "inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",
            children: [
              /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }),
              "Start First Discussion"
            ]
          }
        )
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold", children: "Recent Discussions" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Join the conversation and share your knowledge" })
      ] }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => {
          },
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90",
          children: [
            /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4 mr-2" }),
            "New Discussion"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "space-y-4", children: discussions.map((discussion) => /* @__PURE__ */ jsx("div", { className: "bg-card border rounded-lg p-6 hover:border-primary/50 transition-colors", children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(
            "img",
            {
              src: discussion.author.avatar_url || `https://source.unsplash.com/random/100x100?face&sig=${discussion.author.id}`,
              alt: discussion.author.name,
              className: "w-10 h-10 rounded-full object-cover"
            }
          ),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "font-medium hover:text-primary transition-colors", children: discussion.title }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [
              /* @__PURE__ */ jsx("span", { children: discussion.author.name || discussion.author.username }),
              /* @__PURE__ */ jsx("span", { children: "•" }),
              /* @__PURE__ */ jsx("span", { children: formatTimeAgo(discussion.created_at) }),
              /* @__PURE__ */ jsx("span", { children: "•" }),
              /* @__PURE__ */ jsx("span", { className: "text-primary", children: discussion.club.name })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 text-sm text-muted-foreground", children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => handleLike(discussion.id),
              className: "flex items-center gap-1 hover:text-primary transition-colors",
              children: [
                /* @__PURE__ */ jsx(ThumbsUp, { className: "w-4 h-4" }),
                /* @__PURE__ */ jsx("span", { children: "0" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsx(MessageCircle, { className: "w-4 h-4" }),
            /* @__PURE__ */ jsx("span", { children: "0" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground line-clamp-2", children: discussion.content }),
      discussion.chapter && /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsx("span", { className: "px-2 py-1 text-xs rounded-full bg-primary/10 text-primary", children: discussion.chapter }) })
    ] }) }, discussion.id)) })
  ] });
}
function StudyGroups() {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const loadGroups = async () => {
      try {
        setLoading(true);
        setError(null);
        setGroups([]);
      } catch (err) {
        console.error("Error loading study groups:", err);
        setError(err instanceof Error ? err.message : "Failed to load study groups");
      } finally {
        setLoading(false);
      }
    };
    loadGroups();
  }, []);
  const handleJoinGroup = async (groupId) => {
    if (!user) return;
    try {
      setGroups(
        (prev) => prev.map(
          (group) => group.id === groupId ? { ...group, member_count: group.member_count + 1 } : group
        )
      );
      console.log("Joining group:", groupId);
    } catch (error2) {
      console.error("Error joining group:", error2);
      setGroups(
        (prev) => prev.map(
          (group) => group.id === groupId ? { ...group, member_count: group.member_count - 1 } : group
        )
      );
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "space-y-4", children: Array.from({ length: 3 }).map((_, i) => /* @__PURE__ */ jsxs("div", { className: "bg-card border rounded-lg p-6 animate-pulse", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
        /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-full bg-muted" }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2 flex-1", children: [
          /* @__PURE__ */ jsx("div", { className: "h-4 bg-muted rounded w-1/3" }),
          /* @__PURE__ */ jsx("div", { className: "h-3 bg-muted rounded w-1/4" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx("div", { className: "h-4 bg-muted rounded w-3/4" }),
        /* @__PURE__ */ jsx("div", { className: "h-3 bg-muted rounded w-1/2" })
      ] })
    ] }, i)) });
  }
  if (error) {
    return /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
      /* @__PURE__ */ jsx(AlertCircle, { className: "w-12 h-12 text-destructive mx-auto mb-4" }),
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium mb-2", children: "Failed to load study groups" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mb-4", children: error }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => window.location.reload(),
          className: "text-primary hover:underline",
          children: "Try again"
        }
      )
    ] });
  }
  if (groups.length === 0) {
    return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold", children: "Study Groups" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Join a group to learn together and stay accountable" })
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => {
            },
            className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90",
            children: [
              /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4 mr-2" }),
              "Create Group"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
        /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4", children: /* @__PURE__ */ jsx(Users, { className: "w-8 h-8 text-primary" }) }),
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium mb-2", children: "No study groups yet" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mb-6 max-w-md mx-auto", children: "Study groups will be available soon! We're working on features to help you learn together with others and stay motivated." }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => {
            },
            className: "inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",
            children: [
              /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }),
              "Create First Study Group"
            ]
          }
        )
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold", children: "Study Groups" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Join a group to learn together and stay accountable" })
      ] }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => {
          },
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90",
          children: [
            /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4 mr-2" }),
            "Create Group"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: groups.map((group) => /* @__PURE__ */ jsx("div", { className: "bg-card border rounded-lg p-6 hover:border-primary/50 transition-colors", children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-medium", children: group.name }),
          group.is_private && /* @__PURE__ */ jsx("span", { className: "px-2 py-1 text-xs rounded-full bg-primary/10 text-primary", children: "Private" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: group.description })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex -space-x-2", children: [
            Array.from({ length: Math.min(3, group.member_count) }).map((_, i) => /* @__PURE__ */ jsx(
              "img",
              {
                src: `https://source.unsplash.com/random/100x100?face&sig=${group.id}-${i}`,
                alt: "Member",
                className: "w-8 h-8 rounded-full border-2 border-background object-cover"
              },
              i
            )),
            group.member_count > 3 && /* @__PURE__ */ jsxs("div", { className: "w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs border-2 border-background", children: [
              "+",
              group.member_count - 3
            ] })
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "text-sm text-muted-foreground", children: [
            group.member_count,
            "/",
            group.max_members,
            " members"
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => handleJoinGroup(group.id),
            className: "px-3 py-1.5 text-sm rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors",
            children: "Join"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 pt-2 border-t", children: [
        /* @__PURE__ */ jsx(
          "img",
          {
            src: group.creator.avatar_url || `https://source.unsplash.com/random/100x100?face&sig=${group.creator.id}`,
            alt: group.creator.name,
            className: "w-6 h-6 rounded-full object-cover"
          }
        ),
        /* @__PURE__ */ jsxs("span", { className: "text-sm text-muted-foreground", children: [
          "Created by ",
          group.creator.name || group.creator.username
        ] })
      ] })
    ] }) }, group.id)) })
  ] });
}
function LearningChallenges() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const loadChallenges = async () => {
      try {
        setLoading(true);
        setError(null);
        setChallenges([]);
      } catch (err) {
        console.error("Error loading challenges:", err);
        setError(err instanceof Error ? err.message : "Failed to load challenges");
      } finally {
        setLoading(false);
      }
    };
    loadChallenges();
  }, []);
  const handleJoinChallenge = async (challengeId) => {
    if (!user) return;
    try {
      setChallenges(
        (prev) => prev.map(
          (challenge) => challenge.id === challengeId ? {
            ...challenge,
            is_joined: true,
            participant_count: challenge.participant_count + 1
          } : challenge
        )
      );
      console.log("Joining challenge:", challengeId);
    } catch (error2) {
      console.error("Error joining challenge:", error2);
      setChallenges(
        (prev) => prev.map(
          (challenge) => challenge.id === challengeId && challenge.is_joined ? {
            ...challenge,
            is_joined: false,
            participant_count: challenge.participant_count - 1
          } : challenge
        )
      );
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "space-y-4", children: Array.from({ length: 3 }).map((_, i) => /* @__PURE__ */ jsxs("div", { className: "bg-card border rounded-lg p-6 animate-pulse", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
        /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-lg bg-muted" }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2 flex-1", children: [
          /* @__PURE__ */ jsx("div", { className: "h-4 bg-muted rounded w-1/3" }),
          /* @__PURE__ */ jsx("div", { className: "h-3 bg-muted rounded w-1/4" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx("div", { className: "h-4 bg-muted rounded w-3/4" }),
        /* @__PURE__ */ jsx("div", { className: "h-3 bg-muted rounded w-1/2" })
      ] })
    ] }, i)) });
  }
  if (error) {
    return /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
      /* @__PURE__ */ jsx(AlertCircle, { className: "w-12 h-12 text-destructive mx-auto mb-4" }),
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium mb-2", children: "Failed to load learning challenges" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mb-4", children: error }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => window.location.reload(),
          className: "text-primary hover:underline",
          children: "Try again"
        }
      )
    ] });
  }
  if (challenges.length === 0) {
    return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold", children: "Learning Challenges" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Join challenges to accelerate your learning and earn rewards" })
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => {
            },
            className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90",
            children: [
              /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4 mr-2" }),
              "Create Challenge"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
        /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4", children: /* @__PURE__ */ jsx(Target, { className: "w-8 h-8 text-primary" }) }),
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium mb-2", children: "No learning challenges yet" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mb-6 max-w-md mx-auto", children: "Learning challenges will be available soon! We're working on gamified learning experiences to help you achieve your goals and earn rewards." }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => {
            },
            className: "inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",
            children: [
              /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }),
              "Create First Challenge"
            ]
          }
        )
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold", children: "Learning Challenges" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Join challenges to accelerate your learning and earn rewards" })
      ] }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => {
          },
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90",
          children: [
            /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4 mr-2" }),
            "Create Challenge"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: challenges.map((challenge) => /* @__PURE__ */ jsxs("div", { className: "group bg-card border rounded-lg overflow-hidden hover:border-primary/50 transition-colors", children: [
      /* @__PURE__ */ jsx("div", { className: "px-4 py-1.5 text-xs font-medium text-center text-white bg-primary", children: new Date(challenge.end_date) > /* @__PURE__ */ new Date() ? "In Progress" : "Completed" }),
      /* @__PURE__ */ jsxs("div", { className: "p-6 space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
            /* @__PURE__ */ jsx("h3", { className: "font-medium", children: challenge.title }),
            /* @__PURE__ */ jsx("span", { className: `text-xs px-2 py-1 rounded-full ${challenge.difficulty === "beginner" ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : challenge.difficulty === "intermediate" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"}`, children: challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1) })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: challenge.description })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 text-sm text-muted-foreground", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsx(Calendar, { className: "w-4 h-4" }),
            /* @__PURE__ */ jsx("span", { children: new Date(challenge.end_date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric"
            }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsx(Users, { className: "w-4 h-4" }),
            /* @__PURE__ */ jsxs("span", { children: [
              challenge.participant_count,
              challenge.max_participants && ` / ${challenge.max_participants}`,
              " joined"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
          /* @__PURE__ */ jsx(Trophy, { className: "w-4 h-4 text-yellow-500" }),
          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Rewards:" }),
          /* @__PURE__ */ jsxs("span", { className: "font-medium", children: [
            challenge.rewards.points,
            " points"
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "•" }),
          /* @__PURE__ */ jsx("span", { className: "font-medium", children: challenge.rewards.badge })
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => !challenge.is_joined && handleJoinChallenge(challenge.id),
            disabled: challenge.is_joined,
            className: `w-full inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow transition-colors group-hover:gap-2 ${challenge.is_joined ? "bg-primary/10 text-primary cursor-not-allowed" : "bg-primary text-primary-foreground hover:bg-primary/90"}`,
            children: [
              /* @__PURE__ */ jsx("span", { children: challenge.is_joined ? "Already Joined" : "Join Challenge" }),
              !challenge.is_joined && /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" })
            ]
          }
        )
      ] })
    ] }, challenge.id)) })
  ] });
}
function BookClubs() {
  const { user } = useAuth();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedClub, setExpandedClub] = useState(null);
  useEffect(() => {
    const loadBookClubs = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data: bookClubs, error: clubsError } = await supabase.from("book_clubs").select(`
            *,
            book:books (
              title,
              cover_url,
              author:profiles!books_author_id_fkey (
                name
              )
            ),
            creator:profiles!book_clubs_creator_id_fkey (
              name,
              avatar_url
            ),
            member_count:book_club_members (
              count
            )
          `).eq("status", "active").order("created_at", { ascending: false });
        if (clubsError) throw clubsError;
        setClubs(bookClubs || []);
      } catch (err) {
        console.error("Error loading book clubs:", err);
        setError(err instanceof Error ? err.message : "Failed to load book clubs");
      } finally {
        setLoading(false);
      }
    };
    loadBookClubs();
  }, []);
  const handleJoinClub = async (clubId) => {
    if (!user) return;
    try {
      const { error: error2 } = await supabase.from("book_club_members").insert({
        club_id: clubId,
        user_id: user.id,
        role: "member"
      });
      if (error2) throw error2;
      setClubs(
        (prev) => prev.map(
          (club) => club.id === clubId ? { ...club, member_count: club.member_count + 1 } : club
        )
      );
    } catch (error2) {
      console.error("Error joining club:", error2);
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "space-y-4", children: Array.from({ length: 3 }).map((_, i) => /* @__PURE__ */ jsx("div", { className: "animate-pulse", children: /* @__PURE__ */ jsx("div", { className: "bg-card border rounded-lg p-6", children: /* @__PURE__ */ jsxs("div", { className: "flex gap-4", children: [
      /* @__PURE__ */ jsx("div", { className: "w-32 h-48 bg-muted rounded-lg" }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 space-y-4", children: [
        /* @__PURE__ */ jsx("div", { className: "h-4 bg-muted rounded w-3/4" }),
        /* @__PURE__ */ jsx("div", { className: "h-4 bg-muted rounded w-1/2" }),
        /* @__PURE__ */ jsx("div", { className: "h-4 bg-muted rounded w-1/4" })
      ] })
    ] }) }) }, i)) });
  }
  if (error) {
    return /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
      /* @__PURE__ */ jsx("p", { className: "text-destructive", children: error }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => window.location.reload(),
          className: "mt-4 text-sm text-primary hover:underline",
          children: "Try again"
        }
      )
    ] });
  }
  if (clubs.length === 0) {
    return /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium", children: "No book clubs yet" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mt-2", children: "Be the first to start a book club!" }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => {
          },
          className: "mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",
          children: [
            /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }),
            "Create Book Club"
          ]
        }
      )
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold", children: "Book Clubs" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Join a club to read and discuss books with others" })
      ] }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => {
          },
          className: "inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",
          children: [
            /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }),
            /* @__PURE__ */ jsx("span", { children: "Create Club" })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "space-y-4", children: clubs.map((club) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: "bg-card border rounded-lg overflow-hidden",
        children: [
          /* @__PURE__ */ jsx("div", { className: "p-6", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row gap-6", children: [
            /* @__PURE__ */ jsx("div", { className: "shrink-0", children: /* @__PURE__ */ jsx("div", { className: "w-32 h-48 rounded-lg overflow-hidden", children: /* @__PURE__ */ jsx(
              "img",
              {
                src: club.book.cover_url || `https://source.unsplash.com/random/400x600?book&sig=${club.id}`,
                alt: club.book.title,
                className: "w-full h-full object-cover"
              }
            ) }) }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0 space-y-4", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold", children: club.name }),
                /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground mt-1", children: [
                  "Reading: ",
                  club.book.title,
                  " by ",
                  club.book.author.name
                ] })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: club.description }),
              /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-6 text-sm", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx(Users, { className: "w-4 h-4 text-muted-foreground" }),
                  /* @__PURE__ */ jsxs("span", { children: [
                    club.member_count,
                    "/",
                    club.max_members,
                    " members"
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx(Clock, { className: "w-4 h-4 text-muted-foreground" }),
                  /* @__PURE__ */ jsxs("span", { children: [
                    "Meets ",
                    club.meeting_day,
                    "s at ",
                    club.meeting_time,
                    " ",
                    club.timezone
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx(BookOpen, { className: "w-4 h-4 text-muted-foreground" }),
                  /* @__PURE__ */ jsxs("span", { children: [
                    club.completion_percentage,
                    "% complete"
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => handleJoinClub(club.id),
                    className: "px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",
                    children: "Join Club"
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => setExpandedClub(expandedClub === club.id ? null : club.id),
                    className: "flex items-center gap-2 text-sm text-primary hover:underline",
                    children: expandedClub === club.id ? /* @__PURE__ */ jsxs(Fragment, { children: [
                      /* @__PURE__ */ jsx(ChevronUp, { className: "w-4 h-4" }),
                      "Show Less"
                    ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                      /* @__PURE__ */ jsx(ChevronDown, { className: "w-4 h-4" }),
                      "Show More"
                    ] })
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "shrink-0 text-right", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Created by" }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mt-1", children: [
                /* @__PURE__ */ jsx("span", { className: "font-medium", children: club.creator.name }),
                /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: club.creator.avatar_url || `https://source.unsplash.com/random/100x100?face&sig=${club.creator_id}`,
                    alt: club.creator.name,
                    className: "w-8 h-8 rounded-full"
                  }
                )
              ] })
            ] })
          ] }) }),
          expandedClub === club.id && /* @__PURE__ */ jsx("div", { className: "border-t p-6 bg-muted/30", children: /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h4", { className: "font-medium mb-2", children: "Current Progress" }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
                /* @__PURE__ */ jsx("div", { className: "flex-1 h-2 bg-muted rounded-full overflow-hidden", children: /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: "h-full bg-primary transition-all",
                    style: { width: `${club.completion_percentage}%` }
                  }
                ) }),
                /* @__PURE__ */ jsxs("span", { className: "text-sm text-muted-foreground", children: [
                  "Currently on: ",
                  club.current_chapter
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h4", { className: "font-medium mb-2", children: "Next Meeting" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm", children: new Date(club.next_meeting_date).toLocaleDateString(void 0, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              }) })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h4", { className: "font-medium mb-2", children: "Recent Activity" }),
              /* @__PURE__ */ jsx("div", { className: "space-y-2", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
                /* @__PURE__ */ jsx("div", { className: "w-2 h-2 rounded-full bg-primary" }),
                /* @__PURE__ */ jsxs("span", { children: [
                  "New discussion started on Chapter ",
                  i
                ] }),
                /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "2 hours ago" })
              ] }, i)) })
            ] })
          ] }) })
        ]
      },
      club.id
    )) })
  ] });
}
function CommunityTabs({ defaultTab = "discussions" }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  React__default.useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);
  const tabs = [
    { id: "discussions", label: "Discussions" },
    { id: "study-groups", label: "Study Groups" },
    { id: "book-clubs", label: "Book Clubs" },
    { id: "challenges", label: "Learning Challenges" }
  ];
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tabId);
    window.history.replaceState({}, "", url.toString());
  };
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("div", { className: "border-b", children: /* @__PURE__ */ jsx("div", { className: "flex gap-4", children: tabs.map((tab) => /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => handleTabChange(tab.id),
        className: `px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`,
        children: tab.label
      },
      tab.id
    )) }) }),
    /* @__PURE__ */ jsxs("div", { className: "py-6", children: [
      activeTab === "discussions" && /* @__PURE__ */ jsx(Discussions, {}),
      activeTab === "study-groups" && /* @__PURE__ */ jsx(StudyGroups, {}),
      activeTab === "book-clubs" && /* @__PURE__ */ jsx(BookClubs, {}),
      activeTab === "challenges" && /* @__PURE__ */ jsx(LearningChallenges, {})
    ] })
  ] });
}
function CommunityPage() {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "discussions";
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold", children: "Community" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Connect, learn, and grow together" })
    ] }),
    /* @__PURE__ */ jsx(CommunityTabs, { defaultTab: activeTab })
  ] });
}
export {
  CommunityPage
};
