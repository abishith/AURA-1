import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { Song } from '../types';

interface MusicPlayerContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  playSong: (song: Song) => void;
  togglePlay: () => void;
  nextSong: () => void;
  prevSong: () => void;
  localSongs: Song[];
  addLocalSongs: (songs: Song[]) => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

export const MusicPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [localSongs, setLocalSongs] = useState<Song[]>([]);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio();
    const audio = audioRef.current;
    
    const handleTimeUpdate = () => setProgress(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.pause();
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      const currentIndex = localSongs.findIndex(s => s.id === currentSong?.id);
      if (currentIndex !== -1 && currentIndex < localSongs.length - 1) {
        playSong(localSongs[currentIndex + 1]);
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [currentSong, localSongs]);

  const playSong = (song: Song) => {
    if (!audioRef.current) return;
    
    if (currentSong?.id === song.id) {
      togglePlay();
      return;
    }

    setCurrentSong(song);
    audioRef.current.src = song.url || '';
    audioRef.current.play();
    setIsPlaying(true);
  };

  const togglePlay = () => {
    if (!audioRef.current || !currentSong) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const nextSong = () => {
    // Basic implementation: find index in localSongs and play next
    if (!currentSong || localSongs.length === 0) return;
    const currentIndex = localSongs.findIndex(s => s.id === currentSong.id);
    if (currentIndex !== -1 && currentIndex < localSongs.length - 1) {
      playSong(localSongs[currentIndex + 1]);
    }
  };

  const prevSong = () => {
    if (!currentSong || localSongs.length === 0) return;
    const currentIndex = localSongs.findIndex(s => s.id === currentSong.id);
    if (currentIndex > 0) {
      playSong(localSongs[currentIndex - 1]);
    }
  };

  const addLocalSongs = (songs: Song[]) => {
    setLocalSongs(prev => [...prev, ...songs]);
  };

  return (
    <MusicPlayerContext.Provider value={{
      currentSong,
      isPlaying,
      progress,
      duration,
      playSong,
      togglePlay,
      nextSong,
      prevSong,
      localSongs,
      addLocalSongs
    }}>
      {children}
    </MusicPlayerContext.Provider>
  );
};

export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  if (context === undefined) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider');
  }
  return context;
};
