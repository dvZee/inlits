import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Settings,
  List,
  Loader2,
  X,
  Car,
  Timer,
  Moon as MoonIcon,
  Dumbbell,
  Lock,
  SkipBack as PreviousChapter,
  SkipForward as NextChapter,
  MoreHorizontal,
  Repeat,
  Shuffle,
  Download,
  Share2,
  Heart,
  Bookmark,
  RotateCcw,
  RotateCw,
  Zap,
  Headphones
} from 'lucide-react';
import { useAudio } from '@/lib/audio-context';
import { ImageLoader } from '@/components/image-loader';
import { useAuth } from '@/lib/auth';

interface AudioPlayerProps {
  title: string;
  author: string;
  thumbnail: string;
  type: 'audiobook' | 'podcast';
  isMobile?: boolean;
  authorId?: string;
  authorUsername?: string;
}

interface Settings {
  playbackSpeed: number;
  autoplay: boolean;
  skipSilence: boolean;
  sleepTimer: number;
  repeat: 'off' | 'one' | 'all';
  shuffle: boolean;
}

type ListeningMode = 'normal' | 'driving' | 'walking' | 'sleep' | 'workout';

export function AudioPlayer({
  title,
  author,
  thumbnail,
  type,
  isMobile = false,
  authorId,
  authorUsername
}: AudioPlayerProps) {
  const { user } = useAuth();
  const {
    setPlayerVisible,
    isMainPlayerPage,
    currentAudio,
    currentChapter,
    setCurrentChapter,
    playlist,
    currentTrackIndex,
    playNext,
    playPrevious
  } = useAudio();

  const audioRef = React.useRef<HTMLAudioElement>(null);
  const progressRef = React.useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [volume, setVolume] = React.useState(1);
  const [isMuted, setIsMuted] = React.useState(false);
  const [playbackRate, setPlaybackRate] = React.useState(1);
  const [showPlaylist, setShowPlaylist] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [settings, setSettings] = React.useState<Settings>({
    playbackSpeed: 1,
    autoplay: true,
    skipSilence: false,
    sleepTimer: 0,
    repeat: 'all',
    shuffle: false
  });
  const [listeningMode, setListeningMode] = React.useState<ListeningMode>('normal');
  const [showModeSelector, setShowModeSelector] = React.useState(false);
  const [isLiked, setIsLiked] = React.useState(false);
  const [isBookmarked, setIsBookmarked] = React.useState(false);
  const [showTimeRemaining, setShowTimeRemaining] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const [hoverTime, setHoverTime] = React.useState<number | null>(null);
  const [sleepTimerRemaining, setSleepTimerRemaining] = React.useState(0);

  const hasInitialized = React.useRef(false);

  React.useEffect(() => {
    if (!currentAudio) return;

    const isChapterLocked = !user && currentChapter > 0 && currentAudio.chapters && currentAudio.chapters.length > 0;

    if (isChapterLocked) {
      setError('Please sign in to access this chapter');
      setIsPlaying(false);
      if (audioRef.current) {
        audioRef.current.pause();
      }
      return;
    }

    try {
      const source = currentAudio.chapters && currentAudio.chapters.length > 0 && currentAudio.chapters[currentChapter]
        ? currentAudio.chapters[currentChapter].audio_url
        : currentAudio.audioUrl;

      if (audioRef.current && source) {
        const normalizeUrl = (url: string) => {
          try {
            return new URL(url).href;
          } catch {
            return url;
          }
        };

        const currentSrc = audioRef.current.src ? normalizeUrl(audioRef.current.src) : '';
        const newSrc = normalizeUrl(source);
        const isSameSource = currentSrc === newSrc;

        if (isSameSource) {
          if (currentAudio.currentTime && currentAudio.currentTime > 0 && Math.abs(audioRef.current.currentTime - currentAudio.currentTime) > 2) {
            audioRef.current.currentTime = currentAudio.currentTime;
          }

          if (!audioRef.current.paused && !isPlaying) {
            setIsPlaying(true);
          } else if (audioRef.current.paused && isPlaying) {
            audioRef.current.play().catch(err => console.error('Error resuming:', err));
          }

          if (hasInitialized.current) {
            return;
          }
          hasInitialized.current = true;
          return;
        }

        hasInitialized.current = false;
        audioRef.current.src = source;
        audioRef.current.load();

        const handleCanPlayThrough = () => {
          if (audioRef.current) {
            if (currentAudio.currentTime && currentAudio.currentTime > 0) {
              audioRef.current.currentTime = currentAudio.currentTime;
            }

            audioRef.current.play()
              .then(() => {
                setIsPlaying(true);
                setError(null);
                hasInitialized.current = true;
              })
              .catch(err => {
                console.error('Error auto-playing:', err);
                setIsPlaying(false);
              });
          }
        };

        audioRef.current.addEventListener('canplaythrough', handleCanPlayThrough, { once: true });

        return () => {
          if (audioRef.current) {
            audioRef.current.removeEventListener('canplaythrough', handleCanPlayThrough);
          }
        };
      }
    } catch (err) {
      console.error('Error setting audio source:', err);
      setError('Failed to load audio source');
    }
  }, [currentAudio, currentChapter, isPlaying]);

  React.useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.playbackRate = settings.playbackSpeed;
    audio.volume = isMuted ? 0 : volume;
    
    const handleLoadStart = () => { setIsLoading(true); setError(null); };
    const handleCanPlay = () => { setIsLoading(false); };
    const handleLoadedMetadata = () => { setDuration(audio.duration); };
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (currentAudio) {
        try {
          const savedState = JSON.parse(localStorage.getItem('audioState') || '{}');
          if (savedState.currentAudio) {
            savedState.currentAudio.currentTime = audio.currentTime;
            localStorage.setItem('audioState', JSON.stringify(savedState));
          }
        } catch (e) {
          console.error('Error saving playback position:', e);
        }
      }
    };
    const handleEnded = () => {
      if (currentAudio?.chapters && currentChapter < currentAudio.chapters.length - 1) {
        const nextChapterIndex = currentChapter + 1;
        const isNextChapterLocked = !user && nextChapterIndex > 0;

        if (isNextChapterLocked) {
          setIsPlaying(false);
          return;
        }

        if (settings.autoplay || settings.repeat === 'all') {
          setCurrentChapter(nextChapterIndex);
        } else {
          setIsPlaying(false);
        }
      } else if (settings.repeat === 'all' && currentAudio?.chapters) {
        setCurrentChapter(0);
      } else {
        setIsPlaying(false);
      }
    };
    const handleError = (e: Event) => {
      const audioError = (e.target as HTMLAudioElement).error;
      setError(audioError?.message || 'Error playing audio');
      setIsLoading(false);
      setIsPlaying(false);
    };

    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [currentAudio, currentChapter, settings, setCurrentChapter]);

  React.useEffect(() => {
    if (settings.sleepTimer > 0 && isPlaying) {
      setSleepTimerRemaining(settings.sleepTimer * 60);
      
      const interval = setInterval(() => {
        setSleepTimerRemaining(prev => {
          if (prev <= 1) {
            if (audioRef.current) {
              audioRef.current.pause();
              setIsPlaying(false);
            }
            setSettings(prev => ({ ...prev, sleepTimer: 0 }));
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [settings.sleepTimer, isPlaying]);

  const togglePlay = async () => {
    if (!audioRef.current || isLoading) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error toggling play:', error);
      setError('Failed to play audio');
      setIsPlaying(false);
    }
  };

  const handleProgressMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !audioRef.current || isLoading) return;
    
    setIsDragging(true);
    const rect = progressRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = percent * duration;
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!progressRef.current || !audioRef.current) return;
      
      const rect = progressRef.current.getBoundingClientRect();
      const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const newTime = percent * duration;
      
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    };
    
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
    
    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
  };

  const handleProgressMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !duration) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const time = percent * duration;
    setHoverTime(time);
  };

  const handleProgressMouseLeave = () => {
    setHoverTime(null);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      const newMuted = !isMuted;
      audioRef.current.volume = newMuted ? 0 : volume;
      setIsMuted(newMuted);
    }
  };

  const handlePlaybackRateChange = (rate: number) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
      setPlaybackRate(rate);
      setSettings(prev => ({ ...prev, playbackSpeed: rate }));
    }
  };

  const skipTime = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(currentTime + seconds, duration));
    }
  };

  const nextChapter = () => {
    if (currentAudio?.chapters && currentChapter < currentAudio.chapters.length - 1) {
      setCurrentChapter(currentChapter + 1);
    }
  };

  const previousChapter = () => {
    if (currentAudio?.chapters && currentChapter > 0) {
      setCurrentChapter(currentChapter - 1);
    }
  };

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatSleepTimer = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleModeChange = (mode: ListeningMode) => {
    setListeningMode(mode);
    closeAllExcept(null);

    switch (mode) {
      case 'driving':
        setSettings(prev => ({
          ...prev,
          skipSilence: true,
          playbackSpeed: 1,
          autoplay: true
        }));
        break;
      case 'walking':
        setSettings(prev => ({
          ...prev,
          skipSilence: false,
          playbackSpeed: 1.2,
          autoplay: true
        }));
        break;
      case 'sleep':
        setSettings(prev => ({
          ...prev,
          autoplay: false,
          playbackSpeed: 0.9,
          sleepTimer: 30
        }));
        break;
      case 'workout':
        setSettings(prev => ({
          ...prev,
          autoplay: true,
          playbackSpeed: 1.5,
          skipSilence: true
        }));
        break;
      default:
        setSettings(prev => ({
          ...prev,
          autoplay: true,
          playbackSpeed: 1,
          skipSilence: false,
          sleepTimer: 0
        }));
    }
  };

  const getModeIcon = (mode: ListeningMode) => {
    switch (mode) {
      case 'driving':
        return <Car className="w-4 h-4" />;
      case 'walking':
        return <Timer className="w-4 h-4" />;
      case 'sleep':
        return <MoonIcon className="w-4 h-4" />;
      case 'workout':
        return <Dumbbell className="w-4 h-4" />;
      default:
        return <Headphones className="w-4 h-4" />;
    }
  };

  const handleLike = async () => {
    if (!user) return;
    setIsLiked(!isLiked);
  };

  const handleBookmark = async () => {
    if (!user) return;
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: title,
          text: `Listen to "${title}" by ${author}`,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const closeAllExcept = (keep: 'settings' | 'playlist' | 'mode' | 'volume' | null) => {
    if (keep !== 'settings') setShowSettings(false);
    if (keep !== 'playlist') setShowPlaylist(false);
    if (keep !== 'mode') setShowModeSelector(false);
    if (keep !== 'volume') setShowVolumeSlider(false);
  };

  return (
    <div className={`bg-background/95 backdrop-blur-sm ${
      isMobile ? 'h-auto' : 'h-20'
    }`}>
      <audio 
        ref={audioRef}
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      <div
        ref={progressRef}
        onMouseDown={handleProgressMouseDown}
        onMouseMove={handleProgressMouseMove}
        onMouseLeave={handleProgressMouseLeave}
        className="relative h-2 bg-muted cursor-pointer group hover:h-3 transition-all duration-200"
      >
        <div className="absolute inset-0 bg-muted rounded-full" />
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-75 shadow-sm"
          style={{ width: `${(currentTime / duration) * 100}%` }}
        />
        <div
          className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full shadow-lg transition-all duration-200 ${
            isDragging || hoverTime !== null ? 'opacity-100 scale-110' : 'opacity-0 group-hover:opacity-100'
          }`}
          style={{ left: `${(currentTime / duration) * 100}%`, transform: 'translateX(-50%) translateY(-50%)' }}
        />
        {hoverTime !== null && (
          <div
            className="absolute bottom-full mb-2 px-2 py-1 bg-black/90 text-white text-xs rounded whitespace-nowrap transform -translate-x-1/2"
            style={{ left: `${(hoverTime / duration) * 100}%` }}
          >
            {formatTime(hoverTime)}
          </div>
        )}
      </div>

      {isMobile ? (
        <div className="px-2 py-1 flex items-center justify-between">
          <div className="flex items-center gap-1 min-w-0 flex-1">
            <Link
              to={currentAudio?.contentUrl || '/'}
              className="flex items-center gap-1 hover:text-primary transition-colors flex-shrink-0"
            >
              <div className="w-6 h-6 rounded overflow-hidden bg-muted">
                <ImageLoader
                  src={thumbnail}
                  alt={title}
                  className="w-full h-full object-cover"
                  lowQualityUrl={`${thumbnail}?w=50`}
                  fallback={
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                      <Play className="w-2 h-2 text-primary" />
                    </div>
                  }
                />
              </div>
            </Link>
            <div className="min-w-0 flex-1">
              <Link
                to={currentAudio?.contentUrl || '/'}
                className="block hover:text-primary transition-colors"
              >
                <h3 className="font-medium text-xs line-clamp-1">{title}</h3>
              </Link>
              <Link
                to={authorUsername ? `/user/${authorUsername}` : '#'}
                className="text-xs text-muted-foreground line-clamp-1 hover:text-primary transition-colors"
                onClick={(e) => !authorUsername && e.preventDefault()}
              >
                {author}
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {playlist.length > 1 && (
              <button
                onClick={playPrevious}
                className="p-1.5 hover:bg-primary hover:text-primary-foreground rounded-lg transition-all"
                disabled={isLoading}
                title="Previous track"
              >
                <SkipBack className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => skipTime(-15)}
              className="p-1.5 hover:bg-primary hover:text-primary-foreground rounded-lg transition-all"
              disabled={isLoading}
              title="Skip back 15s"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <button
              onClick={togglePlay}
              disabled={isLoading || (!currentAudio?.audioUrl && !(currentAudio?.chapters && currentAudio.chapters.length > 0))}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </button>
            <button
              onClick={() => skipTime(30)}
              className="p-1.5 hover:bg-primary hover:text-primary-foreground rounded-lg transition-all"
              disabled={isLoading}
              title="Skip forward 30s"
            >
              <RotateCw className="w-5 h-5" />
            </button>
            {playlist.length > 1 && (
              <button
                onClick={playNext}
                className="p-1.5 hover:bg-primary hover:text-primary-foreground rounded-lg transition-all"
                disabled={isLoading}
                title="Next track"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1">
            <div className="relative">
              <button
                onClick={() => { closeAllExcept('volume'); setShowVolumeSlider(!showVolumeSlider); }}
                className="p-1.5 hover:bg-primary hover:text-primary-foreground rounded-lg transition-all"
                title="Volume"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              {showVolumeSlider && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 bg-popover border rounded-lg shadow-xl">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="h-24 w-2 bg-muted rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-runnable-track]:bg-muted [&::-webkit-slider-runnable-track]:rounded-lg"
                    style={{ writingMode: 'bt-lr', WebkitAppearance: 'slider-vertical' }}
                  />
                </div>
              )}
            </div>
            <button
              onClick={() => { closeAllExcept('mode'); setShowModeSelector(!showModeSelector); }}
              className={`p-1.5 rounded-lg transition-all ${listeningMode !== 'normal' ? 'bg-primary/10 text-primary' : 'hover:bg-primary hover:text-primary-foreground'}`}
              title={`${listeningMode.charAt(0).toUpperCase() + listeningMode.slice(1)} Mode`}
            >
              {getModeIcon(listeningMode)}
            </button>
            <button
              onClick={() => { closeAllExcept('settings'); setShowSettings(!showSettings); }}
              className={`p-1.5 rounded-lg transition-all ${showSettings ? 'bg-primary/10 text-primary' : 'hover:bg-primary hover:text-primary-foreground'}`}
              disabled={isLoading}
              title="Player Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            {currentAudio?.chapters && currentAudio.chapters.length > 1 && (
              <button
                onClick={() => { closeAllExcept('playlist'); setShowPlaylist(!showPlaylist); }}
                className={`p-1.5 rounded-lg transition-all ${showPlaylist ? 'bg-primary/10 text-primary' : 'hover:bg-primary hover:text-primary-foreground'}`}
                disabled={isLoading}
                title="Chapters"
              >
                <List className="w-5 h-5" />
              </button>
            )}
            {!isMainPlayerPage && (
              <button
                onClick={() => setPlayerVisible(false)}
                className="p-1 hover:bg-primary hover:text-primary-foreground rounded-lg transition-all"
                title="Close Player"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-4 h-full">
          <div className="flex items-center h-full">
            <div className="flex items-center gap-3 min-w-0 w-80 flex-shrink-0">
              <Link
                to={currentAudio?.contentUrl || '/'}
                className="flex items-center gap-3 hover:text-primary transition-colors flex-shrink-0"
              >
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted shadow-md">
                  <ImageLoader
                    src={thumbnail}
                    alt={title}
                    className="w-full h-full object-cover"
                    lowQualityUrl={`${thumbnail}?w=50`}
                    fallback={
                      <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                        <Play className="w-6 h-6 text-primary" />
                      </div>
                    }
                  />
                </div>
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  to={currentAudio?.contentUrl || '/'}
                  className="block hover:text-primary transition-colors"
                >
                  <h3 className="font-semibold line-clamp-1 text-sm">{title}</h3>
                </Link>
                <Link
                  to={authorUsername ? `/user/${authorUsername}` : '#'}
                  className="text-xs text-muted-foreground line-clamp-1 hover:text-primary transition-colors block"
                  onClick={(e) => !authorUsername && e.preventDefault()}
                >
                  {author}
                </Link>
                {currentAudio?.chapters && currentAudio.chapters.length > 1 && (
                  <p className="text-xs text-primary">
                    Chapter {currentChapter + 1} of {currentAudio.chapters.length}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 flex-1">
              <button
                onClick={() => skipTime(-15)}
                className="p-2 hover:bg-primary hover:text-primary-foreground rounded-lg transition-all"
                disabled={isLoading}
                title="Skip back 15s"
              >
                <RotateCcw className="w-6 h-6" />
              </button>
              <button
                onClick={togglePlay}
                disabled={isLoading || (!currentAudio?.audioUrl && !(currentAudio?.chapters && currentAudio.chapters.length > 0))}
                className="w-14 h-14 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              >
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 ml-0.5" />
                )}
              </button>
              <button
                onClick={() => skipTime(30)}
                className="p-2 hover:bg-primary hover:text-primary-foreground rounded-lg transition-all"
                disabled={isLoading}
                title="Skip forward 30s"
              >
                <RotateCw className="w-6 h-6" />
              </button>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0 justify-end w-80">
              <div className="flex items-center gap-1 text-sm text-muted-foreground font-mono">
                <button
                  onClick={() => setShowTimeRemaining(!showTimeRemaining)}
                  className="hover:text-foreground transition-colors"
                  title="Toggle time remaining"
                >
                  {formatTime(currentTime)}
                </button>
                <span>/</span>
                <span>
                  {showTimeRemaining ? `-${formatTime(duration - currentTime)}` : formatTime(duration)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button
                    onClick={() => { closeAllExcept('volume'); setShowVolumeSlider(!showVolumeSlider); }}
                    className="p-2 hover:bg-primary hover:text-primary-foreground rounded-lg transition-all"
                    title="Volume"
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                  {showVolumeSlider && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 bg-popover border rounded-lg shadow-xl">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="h-24 w-2 bg-muted rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-runnable-track]:bg-muted [&::-webkit-slider-runnable-track]:rounded-lg"
                        style={{ writingMode: 'bt-lr', WebkitAppearance: 'slider-vertical' }}
                      />
                    </div>
                  )}
                </div>
                <div className="relative">
                  <button
                    onClick={() => { closeAllExcept('mode'); setShowModeSelector(!showModeSelector); }}
                    className={`p-2 rounded-lg transition-all ${listeningMode !== 'normal' ? 'bg-primary/10 text-primary' : 'hover:bg-primary hover:text-primary-foreground'}`}
                    title={`${listeningMode.charAt(0).toUpperCase() + listeningMode.slice(1)} Mode`}
                  >
                    {getModeIcon(listeningMode)}
                  </button>
                  {showModeSelector && (
                    <div className="absolute bottom-full right-0 mb-2 w-48 bg-popover border rounded-lg shadow-xl">
                      <div className="p-3">
                        <h4 className="text-sm font-medium mb-3">Listening Mode</h4>
                        <div className="space-y-1">
                          {[
                            { mode: 'normal', label: 'Normal', icon: Headphones, desc: 'Standard listening' },
                            { mode: 'driving', label: 'Driving', icon: Car, desc: 'Skip silence, clear audio' },
                            { mode: 'walking', label: 'Walking', icon: Timer, desc: 'Slightly faster pace' },
                            { mode: 'sleep', label: 'Sleep', icon: MoonIcon, desc: 'Slower, with sleep timer' },
                            { mode: 'workout', label: 'Workout', icon: Dumbbell, desc: 'Faster pace, auto-continue' }
                          ].map(({ mode, label, icon: Icon, desc }) => (
                            <button
                              key={mode}
                              onClick={() => handleModeChange(mode as ListeningMode)}
                              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                                listeningMode === mode
                                  ? 'bg-primary text-primary-foreground'
                                  : 'hover:bg-primary hover:text-primary-foreground'
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                              <div className="text-left">
                                <div className="font-medium">{label}</div>
                                <div className="text-xs opacity-80">{desc}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="relative">
                  <button 
                    onClick={() => { closeAllExcept('settings'); setShowSettings(!showSettings); }}
                    className={`p-2 rounded-lg transition-all ${showSettings ? 'bg-primary/10 text-primary' : 'hover:bg-primary hover:text-primary-foreground'}`}
                    disabled={isLoading}
                    title="Player Settings"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  {showSettings && (
                    <div className="absolute bottom-full right-0 mb-2 w-80 bg-popover border rounded-lg shadow-xl max-h-96 overflow-y-auto">
                      <div className="p-4 space-y-6">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Settings</h4>
                          <button
                            onClick={() => setShowSettings(false)}
                            className="p-1 hover:bg-accent rounded transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium">Speed</h5>
                          <div className="grid grid-cols-5 gap-1">
                            {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map(speed => (
                              <button
                                key={speed}
                                onClick={() => handlePlaybackRateChange(speed)}
                                className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                                  settings.playbackSpeed === speed 
                                    ? 'bg-primary text-primary-foreground' 
                                    : 'hover:bg-primary hover:text-primary-foreground bg-muted'
                                }`}
                              >
                                {speed}x
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h5 className="text-sm font-medium">Auto-play</h5>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settings.autoplay}
                                onChange={(e) => setSettings(prev => ({ ...prev, autoplay: e.target.checked }))}
                                className="sr-only peer"
                              />
                              <div className="w-9 h-5 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                          </div>
                          <p className="text-xs text-muted-foreground">Automatically play next chapter</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h5 className="text-sm font-medium">Skip Silence</h5>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settings.skipSilence}
                                onChange={(e) => setSettings(prev => ({ ...prev, skipSilence: e.target.checked }))}
                                className="sr-only peer"
                              />
                              <div className="w-9 h-5 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                          </div>
                          <p className="text-xs text-muted-foreground">Automatically skip silent parts</p>
                        </div>
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium">Repeat</h5>
                          <div className="grid grid-cols-3 gap-1">
                            {[
                              { value: 'off', label: 'Off' },
                              { value: 'one', label: 'One' },
                              { value: 'all', label: 'All' }
                            ].map(option => (
                              <button
                                key={option.value}
                                onClick={() => setSettings(prev => ({ ...prev, repeat: option.value as any }))}
                                className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                                  settings.repeat === option.value 
                                    ? 'bg-primary text-primary-foreground' 
                                    : 'hover:bg-primary hover:text-primary-foreground bg-muted'
                                }`}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h5 className="text-sm font-medium">Shuffle</h5>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settings.shuffle}
                                onChange={(e) => setSettings(prev => ({ ...prev, shuffle: e.target.checked }))}
                                className="sr-only peer"
                              />
                              <div className="w-9 h-5 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                          </div>
                          <p className="text-xs text-muted-foreground">Randomize chapter order</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h5 className="text-sm font-medium">Sleep Timer</h5>
                            {sleepTimerRemaining > 0 && (
                              <span className="text-xs text-primary font-mono">
                                {formatSleepTimer(sleepTimerRemaining)}
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-4 gap-1">
                            {[0, 15, 30, 60].map(minutes => (
                              <button
                                key={minutes}
                                onClick={() => setSettings(prev => ({ ...prev, sleepTimer: minutes }))}
                                className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                                  settings.sleepTimer === minutes 
                                    ? 'bg-primary text-primary-foreground' 
                                    : 'hover:bg-primary hover:text-primary-foreground bg-muted'
                                }`}
                              >
                                {minutes === 0 ? 'Off' : minutes >= 60 ? `${minutes/60}h` : `${minutes}m`}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                {currentAudio?.chapters && currentAudio.chapters.length > 1 && (
                  <div className="relative">
                    <button
                      onClick={() => { closeAllExcept('playlist'); setShowPlaylist(!showPlaylist); }}
                      className={`p-2 rounded-lg transition-all ${showPlaylist ? 'bg-primary/10 text-primary' : 'hover:bg-primary hover:text-primary-foreground'}`}
                      disabled={isLoading}
                      title="Chapters"
                    >
                      <List className="w-4 h-4" />
                    </button>
                    {showPlaylist && currentAudio?.chapters && (
                      <div className="absolute bottom-full right-0 mb-2 w-72 bg-popover border rounded-lg shadow-xl max-h-80 overflow-hidden">
                        <div className="p-3 border-b">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-sm">Chapters</h3>
                            <button
                              onClick={() => setShowPlaylist(false)}
                              className="p-1 hover:bg-accent rounded transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="overflow-y-auto max-h-64">
                          <div className="p-2 space-y-1">
                            {currentAudio.chapters.map((chapter, index) => {
                              const isLocked = !user && index > 0;
                              const isCurrent = currentChapter === index;
                              
                              return (
                                <button
                                  key={chapter.id}
                                  onClick={() => {
                                    if (!isLocked) {
                                      setCurrentChapter(index);
                                      setShowPlaylist(false);
                                    }
                                  }}
                                  className={`w-full flex items-center justify-between p-2 rounded text-sm transition-all ${
                                    isLocked 
                                      ? 'bg-muted/30 cursor-not-allowed opacity-60' 
                                      : isCurrent
                                        ? 'bg-primary text-primary-foreground'
                                        : 'hover:bg-primary hover:text-primary-foreground'
                                  }`}
                                  disabled={isLoading || isLocked}
                                >
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <div className="flex-shrink-0">
                                      {isLocked ? (
                                        <Lock className="w-3 h-3" />
                                      ) : isLoading && isCurrent ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                      ) : isCurrent && isPlaying ? (
                                        <Pause className="w-3 h-3" />
                                      ) : (
                                        <Play className="w-3 h-3" />
                                      )}
                                    </div>
                                    <div className="font-medium line-clamp-1 text-left">
                                      {chapter.title}
                                    </div>
                                  </div>
                                  <div className="text-xs opacity-80 ml-2 flex-shrink-0">
                                    {chapter.duration}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {!isMainPlayerPage && (
                  <button
                    onClick={() => setPlayerVisible(false)}
                    className="p-2 hover:bg-primary hover:text-primary-foreground rounded-lg transition-all"
                    title="Close Player"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {isMobile && showModeSelector && (
        <div className="absolute bottom-full left-0 right-0 mb-2 mx-3 bg-popover border rounded-lg shadow-xl">
          <div className="p-3">
            <h4 className="text-sm font-medium mb-3">Listening Mode</h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                { mode: 'normal', label: 'Normal', icon: Headphones },
                { mode: 'driving', label: 'Driving', icon: Car },
                { mode: 'walking', label: 'Walking', icon: Timer },
                { mode: 'sleep', label: 'Sleep', icon: MoonIcon },
                { mode: 'workout', label: 'Workout', icon: Dumbbell }
              ].map(({ mode, label, icon: Icon }) => (
                <button
                  key={mode}
                  onClick={() => handleModeChange(mode as ListeningMode)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                    listeningMode === mode
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-primary hover:text-primary-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {isMobile && showSettings && (
        <div className="absolute bottom-full left-0 right-0 mb-2 mx-3 bg-popover border rounded-lg shadow-xl max-h-80 overflow-y-auto">
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Settings</h4>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1 hover:bg-accent rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              <h5 className="text-sm font-medium">Speed</h5>
              <div className="grid grid-cols-4 gap-1">
                {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map(speed => (
                  <button
                    key={speed}
                    onClick={() => handlePlaybackRateChange(speed)}
                    className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                      settings.playbackSpeed === speed 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-primary hover:text-primary-foreground bg-muted'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h5 className="text-sm font-medium">Sleep Timer</h5>
                {sleepTimerRemaining > 0 && (
                  <span className="text-xs text-primary font-mono">
                    {formatSleepTimer(sleepTimerRemaining)}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-4 gap-1">
                {[0, 15, 30, 60].map(minutes => (
                  <button
                    key={minutes}
                    onClick={() => setSettings(prev => ({ ...prev, sleepTimer: minutes }))}
                    className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                      settings.sleepTimer === minutes 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-primary hover:text-primary-foreground bg-muted'
                    }`}
                  >
                    {minutes === 0 ? 'Off' : minutes >= 60 ? `${minutes/60}h` : `${minutes}m`}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h5 className="text-sm font-medium">Auto-play</h5>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.autoplay}
                      onChange={(e) => setSettings(prev => ({ ...prev, autoplay: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:start-[1px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h5 className="text-sm font-medium">Skip Silence</h5>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.skipSilence}
                      onChange={(e) => setSettings(prev => ({ ...prev, skipSilence: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:start-[1px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isMobile && showPlaylist && (
        <div className="absolute bottom-full left-0 right-0 mb-2 mx-3 bg-popover border rounded-lg shadow-xl max-h-80 overflow-hidden">
          <div className="p-3 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm">Chapters</h3>
              <button
                onClick={() => setShowPlaylist(false)}
                className="p-1 hover:bg-accent rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="overflow-y-auto max-h-64">
            <div className="p-2 space-y-1">
              {currentAudio?.chapters?.map((chapter, index) => {
                const isLocked = !user && index > 0;
                const isCurrent = currentChapter === index;
                
                return (
                  <button
                    key={chapter.id}
                    onClick={() => {
                      if (!isLocked) {
                        setCurrentChapter(index);
                        setShowPlaylist(false);
                      }
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded text-sm transition-all ${
                      isLocked 
                        ? 'bg-muted/30 cursor-not-allowed opacity-60' 
                        : isCurrent
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-primary hover:text-primary-foreground'
                    }`}
                    disabled={isLoading || isLocked}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="flex-shrink-0">
                        {isLocked ? (
                          <Lock className="w-3 h-3" />
                        ) : isLoading && isCurrent ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : isCurrent && isPlaying ? (
                          <Pause className="w-3 h-3" />
                        ) : (
                          <Play className="w-3 h-3" />
                        )}
                      </div>
                      <div className="font-medium line-clamp-1 text-left">
                        {chapter.title}
                      </div>
                    </div>
                    <div className="text-xs opacity-80 ml-2 flex-shrink-0">
                      {chapter.duration}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-2 px-3 py-1.5 bg-destructive/10 text-destructive rounded text-xs flex items-center gap-2">
          <Zap className="w-3 h-3" />
          {error}
        </div>
      )}

      {sleepTimerRemaining > 0 && (
        <div className="mt-2 px-3 py-1.5 bg-primary/10 text-primary rounded text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MoonIcon className="w-3 h-3" />
            <span>Sleep: {formatSleepTimer(sleepTimerRemaining)}</span>
          </div>
          <button
            onClick={() => setSettings(prev => ({ ...prev, sleepTimer: 0 }))}
            className="text-xs hover:underline"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}