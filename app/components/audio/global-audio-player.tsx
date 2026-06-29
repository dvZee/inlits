import React, { useEffect } from "react";
import { useAudio } from "@/lib/audio-context";
import { useAuth } from "@/lib/auth";
import { X, Check, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function GlobalAudioPlayer() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const {
    audioRef,
    currentAudio,
    currentChapter,
    isPlaying,
    setIsPlaying,
    updateCurrentTime,
    showUpgradeModal,
    setShowUpgradeModal,
  } = useAudio();

  useEffect(() => {
    if (!currentAudio || !audioRef.current) return;

    const audio = audioRef.current;
    
    // Check if audiobook is locked for free user (intro chapter 0 is free/unlocked)
    const isPremium = profile?.subscription_status === 'active' || profile?.role === 'creator';
    const isLocked = currentAudio.type === "audiobook" && currentChapter > 0 && !isPremium;

    if (isLocked) {
      if (isPlaying) {
        setIsPlaying(false);
      }
      if (audio.src) {
        audio.src = "";
      }
      return;
    }

    const currentChapterData = currentAudio.chapters?.[currentChapter];
    const source = currentChapterData?.audio_url || currentAudio.audioUrl;

    if (!source) return;

    const normalizeUrl = (url: string) => {
      try {
        return new URL(url).href;
      } catch {
        return url;
      }
    };

    const currentSrc = audio.src ? normalizeUrl(audio.src) : "";
    const newSrc = normalizeUrl(source);
    const isSameSource = currentSrc === newSrc;

    if (isSameSource) {
      // Restore playback position if needed
      if (
        currentAudio.currentTime &&
        currentAudio.currentTime > 0 &&
        Math.abs(audio.currentTime - currentAudio.currentTime) > 2
      ) {
        audio.currentTime = currentAudio.currentTime;
      }

      // Sync play/pause state
      if (isPlaying && audio.paused) {
        audio.play().catch(console.error);
      } else if (!isPlaying && !audio.paused) {
        audio.pause();
      }
      return;
    }

    // Load new source
    audio.src = source;
    audio.load();

    const handleCanPlay = () => {
      if (currentAudio.currentTime && currentAudio.currentTime > 0) {
        audio.currentTime = currentAudio.currentTime;
      }

      // Always try to play when chapter changes if isPlaying is true
      if (isPlaying) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error("Autoplay failed:", error);
            // If autoplay fails, set isPlaying to false
            setIsPlaying(false);
          });
        }
      }
    };

    audio.addEventListener("canplay", handleCanPlay, { once: true });

    return () => {
      audio.removeEventListener("canplay", handleCanPlay);
    };
  }, [currentAudio, currentChapter, audioRef, isPlaying, setIsPlaying]);

  // Sync isPlaying state with actual audio state (prevent loops)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    let isUpdating = false;

    const handlePlay = () => {
      if (!isUpdating) {
        isUpdating = true;
        setIsPlaying(true);
        setTimeout(() => {
          isUpdating = false;
        }, 100);
      }
    };

    const handlePause = () => {
      if (!isUpdating) {
        isUpdating = true;
        setIsPlaying(false);
        setTimeout(() => {
          isUpdating = false;
        }, 100);
      }
    };

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
    };
  }, [audioRef, setIsPlaying]);

  // Track current time
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      updateCurrentTime(audio.currentTime);

      try {
        const savedState = JSON.parse(
          localStorage.getItem("audioState") || "{}"
        );
        if (savedState.currentAudio) {
          savedState.currentAudio.currentTime = audio.currentTime;
          localStorage.setItem("audioState", JSON.stringify(savedState));
        }
      } catch (e) {
        console.error("Error saving playback position:", e);
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [audioRef, updateCurrentTime]);

  return (
    <>
      <audio ref={audioRef} className="hidden" preload="auto" />
      {showUpgradeModal && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-[99999] flex items-center justify-center animate-in fade-in duration-200"
          onClick={() => setShowUpgradeModal(false)}
        >
          <div 
            className="bg-card/98 border border-amber-500/20 rounded-2xl shadow-2xl w-[480px] max-w-[95%] mx-4 relative overflow-hidden animate-in zoom-in-95 duration-200 bg-gradient-to-br from-amber-500/5 via-background to-primary/5 p-8"
            onClick={e => e.stopPropagation()}
          >
            {/* Elegant Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -ml-16 -mb-16" />

            <button 
              onClick={() => setShowUpgradeModal(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-accent rounded-lg transition-colors z-10"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            <div className="text-center space-y-6 relative">
              {/* Crown Icon */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/25 transform hover:scale-105 transition-all">
                <Lock className="w-7 h-7 text-white fill-current" />
              </div>

              <div className="space-y-3">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                  Continue Your Journey of Growth
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This chapter is part of Inlits Premium. When you upgrade, you're not just buying a subscription—you're investing in your own daily potential and expanding your intellectual horizons. 
                </p>
                <p className="text-xs text-amber-500/90 font-medium">
                  By joining, you directly support independent authors and narrators who bring these ideas to life.
                </p>
              </div>

              {/* Emotional Benefits list */}
              <div className="bg-muted/40 border border-border/50 rounded-xl p-5 text-left space-y-3.5">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">Daily Self-Investment</span> — Build a lifelong habit of learning with unlimited access to premium summaries and audiobooks.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">Empower Global Thinkers</span> — Directly fund the research, translation, and production of world-changing ideas.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">Clarity of Mind</span> — Completely ad-free, high-quality audio experience designed to respect your focus.
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2.5 pt-2">
                <button
                  onClick={() => {
                    setShowUpgradeModal(false);
                    if (user) {
                      navigate("/subscription");
                    } else {
                      navigate("/signin", {
                        state: { from: { pathname: "/subscription" } }
                      });
                    }
                  }}
                  className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-md shadow-amber-500/15 hover:shadow-lg hover:shadow-amber-500/20 active:scale-[0.98] text-sm"
                >
                  {user ? "Invest in Myself" : "Sign In to Unlock"}
                </button>
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="w-full text-muted-foreground hover:text-foreground text-xs font-medium py-2 rounded-lg transition-colors"
                >
                  Return to Free Chapter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
