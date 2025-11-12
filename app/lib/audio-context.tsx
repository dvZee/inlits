import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

interface AudioContextType {
  isPlayerVisible: boolean;
  setPlayerVisible: (visible: boolean) => void;
  currentAudio: {
    title: string;
    author: string;
    authorId?: string;
    authorUsername?: string;
    thumbnail: string;
    contentUrl: string;
    audioUrl?: string;
    chapters?: Array<{
      id: number;
      title: string;
      audio_url: string;
      duration: string;
    }>;
    type: 'audiobook' | 'podcast';
    currentTime?: number;
  } | null;
  setCurrentAudio: (audio: AudioContextType['currentAudio']) => void;
  isMainPlayerPage: boolean;
  currentChapter: number;
  setCurrentChapter: (index: number) => void;
  updateCurrentTime: (time: number) => void;
  audioRef: React.RefObject<HTMLAudioElement>;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
}

const AudioContext = createContext<AudioContextType | null>(null);

interface AudioProviderProps {
  children: React.ReactNode;
  currentPathname?: string;
}

export function AudioProvider({
  children,
  currentPathname
}: AudioProviderProps) {
  const [isPlayerVisible, setPlayerVisible] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<AudioContextType['currentAudio']>(null);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Check if current page is the main player page
  const pathname =
    currentPathname ??
    (typeof window !== 'undefined' ? window.location.pathname : '');
  const isMainPlayerPage = pathname.startsWith('/player/');

  // Update current time function
  const updateCurrentTime = (time: number) => {
    if (currentAudio) {
      setCurrentAudio({
        ...currentAudio,
        currentTime: time
      });
    }
  };

  // Restore state from localStorage on mount
  useEffect(() => {
    try {
      const savedState = localStorage.getItem('audioState');
      if (savedState) {
        const state = JSON.parse(savedState);
        setCurrentAudio(state.currentAudio);
        setPlayerVisible(state.isPlayerVisible);
        setCurrentChapter(state.currentChapter || 0);
        setIsPlaying(state.isPlaying || false);
      }
    } catch (error) {
      console.error('Error restoring audio state:', error);
      localStorage.removeItem('audioState');
    }
  }, []);

  // Save state to localStorage when it changes
  useEffect(() => {
    if (currentAudio || isPlayerVisible) {
      try {
        localStorage.setItem('audioState', JSON.stringify({
          currentAudio,
          isPlayerVisible,
          currentChapter,
          isPlaying
        }));
      } catch (error) {
        console.error('Error saving audio state:', error);
      }
    }
  }, [currentAudio, isPlayerVisible, currentChapter, isPlaying]);

  return (
    <AudioContext.Provider value={{
      isPlayerVisible,
      setPlayerVisible,
      currentAudio,
      setCurrentAudio,
      isMainPlayerPage,
      currentChapter,
      setCurrentChapter,
      updateCurrentTime,
      audioRef,
      isPlaying,
      setIsPlaying
    }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
