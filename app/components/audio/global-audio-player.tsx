import React, { useEffect } from 'react';
import { useAudio } from '@/lib/audio-context';

export function GlobalAudioPlayer() {
  const { audioRef, currentAudio, currentChapter, isPlaying, updateCurrentTime } = useAudio();

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

    const currentSrc = audio.src ? normalizeUrl(audio.src) : '';
    const newSrc = normalizeUrl(source);
    const isSameSource = currentSrc === newSrc;

    if (isSameSource) {
      if (currentAudio.currentTime && currentAudio.currentTime > 0 && Math.abs(audio.currentTime - currentAudio.currentTime) > 2) {
        audio.currentTime = currentAudio.currentTime;
      }

      if (isPlaying && audio.paused) {
        audio.play().catch(console.error);
      } else if (!isPlaying && !audio.paused) {
        audio.pause();
      }
      return;
    }

    audio.src = source;
    audio.load();

    const handleCanPlay = () => {
      if (currentAudio.currentTime && currentAudio.currentTime > 0) {
        audio.currentTime = currentAudio.currentTime;
      }

      if (isPlaying) {
        audio.play().catch(console.error);
      }
    };

    audio.addEventListener('canplay', handleCanPlay, { once: true });

    return () => {
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [currentAudio, currentChapter, audioRef, isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      updateCurrentTime(audio.currentTime);

      try {
        const savedState = JSON.parse(localStorage.getItem('audioState') || '{}');
        if (savedState.currentAudio) {
          savedState.currentAudio.currentTime = audio.currentTime;
          localStorage.setItem('audioState', JSON.stringify(savedState));
        }
      } catch (e) {
        console.error('Error saving playback position:', e);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [audioRef, updateCurrentTime]);

  return <audio ref={audioRef} className="hidden" />;
}
