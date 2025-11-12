import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '@/lib/audio-context';
import { Play, Pause, SkipForward, SkipBack, X, Maximize2 } from 'lucide-react';
import { getTextLanguageClass } from '@/lib/utils';

export function MiniPlayer() {
  const {
    currentAudio,
    isPlayerVisible,
    setPlayerVisible,
    isMainPlayerPage,
    audioRef,
    isPlaying,
    setIsPlaying,
    updateCurrentTime
  } = useAudio();

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
      updateCurrentTime(audio.currentTime);
    };

    const updateDuration = () => setDuration(audio.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [audioRef, updateCurrentTime, setIsPlaying]);

  const togglePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
  };

  const handleSkipForward = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioRef.current) {
      audioRef.current.currentTime += 15;
    }
  };

  const handleSkipBack = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioRef.current) {
      audioRef.current.currentTime -= 15;
    }
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setPlayerVisible(false);
  };

  const handleMaximize = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(currentAudio?.contentUrl || '/');
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!currentAudio || !isPlayerVisible || isMainPlayerPage) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t shadow-lg backdrop-blur-xl bg-opacity-95 animate-slide-up">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Thumbnail */}
          <button
            onClick={handleMaximize}
            className="flex-shrink-0 group relative overflow-hidden rounded-lg transition-transform hover:scale-105"
          >
            <img
              src={currentAudio.thumbnail}
              alt={currentAudio.title}
              className="w-16 h-16 object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Maximize2 className="w-6 h-6 text-white" />
            </div>
          </button>

          {/* Content Info */}
          <div className="flex-1 min-w-0">
            <button
              onClick={handleMaximize}
              className="text-left hover:text-primary transition-colors"
            >
              <h3 className={`font-medium truncate ${getTextLanguageClass(currentAudio.title)}`}>
                {currentAudio.title}
              </h3>
              <p className="text-sm text-muted-foreground truncate">
                {currentAudio.author}
              </p>
            </button>

            {/* Progress Bar */}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-muted-foreground">{formatTime(currentTime)}</span>
              <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSkipBack}
              className="p-2 hover:bg-muted rounded-full transition-colors"
              title="Rewind 15s"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={togglePlayPause}
              className="p-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all hover:scale-110 active:scale-95"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </button>

            <button
              onClick={handleSkipForward}
              className="p-2 hover:bg-muted rounded-full transition-colors"
              title="Forward 15s"
            >
              <SkipForward className="w-5 h-5" />
            </button>

            <button
              onClick={handleClose}
              className="p-2 hover:bg-muted rounded-full transition-colors ml-2"
              title="Close player"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
