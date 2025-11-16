import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";

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
    type: "audiobook" | "podcast";
    currentTime?: number;
  } | null;
  setCurrentAudio: (audio: AudioContextType["currentAudio"]) => void;
  isMainPlayerPage: boolean;
  currentChapter: number;
  setCurrentChapter: (index: number) => void;
  updateCurrentTime: (time: number) => void;
  audioRef: React.RefObject<HTMLAudioElement>;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  playlist: Array<{
    id: string;
    title: string;
    author: string;
    authorId?: string;
    authorUsername?: string;
    thumbnail: string;
    type: "audiobook" | "podcast" | "ebook";
    contentUrl: string;
  }>;
  setPlaylist: (playlist: AudioContextType["playlist"]) => void;
  currentTrackIndex: number;
  setCurrentTrackIndex: (index: number) => void;
  playNext: () => void;
  playPrevious: () => void;
  playAudio: (
    audio: {
      id: string;
      title: string;
      author: string;
      authorId?: string;
      authorUsername?: string;
      thumbnail: string;
      type: "audiobook" | "podcast";
    },
    immediate?: boolean
  ) => void;
}

const AudioContext = createContext<AudioContextType | null>(null);

interface AudioProviderProps {
  children: React.ReactNode;
  currentPathname?: string;
}

export function AudioProvider({
  children,
  currentPathname,
}: AudioProviderProps) {
  const [isPlayerVisible, setPlayerVisible] = useState(false);
  const [currentAudio, setCurrentAudio] =
    useState<AudioContextType["currentAudio"]>(null);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playlist, setPlaylist] = useState<AudioContextType["playlist"]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Check if current page is the main player page
  const pathname =
    currentPathname ??
    (typeof window !== "undefined" ? window.location.pathname : "");
  const isMainPlayerPage = pathname.startsWith("/player/");

  // Update current time function
  const updateCurrentTime = (time: number) => {
    if (currentAudio) {
      setCurrentAudio({
        ...currentAudio,
        currentTime: time,
      });
    }
  };

  // Play next track in playlist
  const playNext = () => {
    if (playlist.length === 0) return;
    const nextIndex = (currentTrackIndex + 1) % playlist.length;
    const nextTrack = playlist[nextIndex];
    if (nextTrack) {
      setCurrentTrackIndex(nextIndex);
      playAudio(nextTrack);
    }
  };

  // Play previous track in playlist
  const playPrevious = () => {
    if (playlist.length === 0) return;
    const prevIndex =
      (currentTrackIndex - 1 + playlist.length) % playlist.length;
    const prevTrack = playlist[prevIndex];
    if (prevTrack) {
      setCurrentTrackIndex(prevIndex);
      playAudio(prevTrack);
    }
  };

  // Play audio function - starts immediately in bottom player, then navigates
  const playAudio = (
    audio: {
      id: string;
      title: string;
      author: string;
      authorId?: string;
      authorUsername?: string;
      thumbnail: string;
      type: "audiobook" | "podcast";
    },
    immediate: boolean = false
  ) => {
    if (typeof window === "undefined") return;

    if (immediate) {
      // Start playing immediately in bottom player
      setPlayerVisible(true);
      setIsPlaying(true);
      // Navigate after a short delay to allow audio to start
      setTimeout(() => {
        window.location.href = `/player/${audio.type}-${audio.id}`;
      }, 100);
    } else {
      // Normal navigation
      window.location.href = `/player/${audio.type}-${audio.id}`;
    }
  };

  // Restore state from localStorage on mount
  useEffect(() => {
    try {
      const savedState = localStorage.getItem("audioState");
      if (savedState) {
        const state = JSON.parse(savedState);
        setCurrentAudio(state.currentAudio);
        setPlayerVisible(state.isPlayerVisible);
        setCurrentChapter(state.currentChapter || 0);
        setIsPlaying(state.isPlaying || false);
        setPlaylist(state.playlist || []);
        setCurrentTrackIndex(state.currentTrackIndex || 0);
      }
    } catch (error) {
      console.error("Error restoring audio state:", error);
      localStorage.removeItem("audioState");
    }
  }, []);

  // Save state to localStorage when it changes
  useEffect(() => {
    if (currentAudio || isPlayerVisible) {
      try {
        localStorage.setItem(
          "audioState",
          JSON.stringify({
            currentAudio,
            isPlayerVisible,
            currentChapter,
            isPlaying,
            playlist,
            currentTrackIndex,
          })
        );
      } catch (error) {
        console.error("Error saving audio state:", error);
      }
    }
  }, [
    currentAudio,
    isPlayerVisible,
    currentChapter,
    isPlaying,
    playlist,
    currentTrackIndex,
  ]);

  return (
    <AudioContext.Provider
      value={{
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
        setIsPlaying,
        playlist,
        setPlaylist,
        currentTrackIndex,
        setCurrentTrackIndex,
        playNext,
        playPrevious,
        playAudio,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
}
