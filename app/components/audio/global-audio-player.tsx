import React, { useEffect } from "react";
import { useAudio } from "@/lib/audio-context";

export function GlobalAudioPlayer() {
  const {
    audioRef,
    currentAudio,
    currentChapter,
    isPlaying,
    setIsPlaying,
    updateCurrentTime,
  } = useAudio();

  useEffect(() => {
    if (!currentAudio || !audioRef.current) return;

    const audio = audioRef.current;
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

  return <audio ref={audioRef} className="hidden" preload="auto" />;
}
