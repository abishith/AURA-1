import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, 
  Search, 
  Home, 
  Library, 
  ListMusic, 
  Settings as SettingsIcon, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Heart, 
  MoreVertical, 
  Shuffle, 
  Repeat, 
  ChevronDown, 
  Share2, 
  Mic2, 
  Smartphone,
  Plus,
  ArrowLeft,
  FolderOpen,
  Trash2,
  Star,
  Activity,
  LogOut,
  LogIn
} from 'lucide-react';
import { cn } from './lib/utils';
import { RECENT_SONGS, HEAVY_ROTATION, FAVORITE_ALBUMS, RECENTLY_PLAYED_ALBUMS, PLAYLISTS } from './constants';
import { Song, Album, Playlist } from './types';
import { FirebaseProvider, ErrorBoundary, useFirebase } from './components/FirebaseProvider';
import { MusicPlayerProvider, useMusicPlayer } from './context/MusicPlayerContext';
import { signInWithGoogle, logout, db } from './firebase';
import { collection, onSnapshot, query, where, orderBy, limit } from 'firebase/firestore';

// --- Components ---

const AuraCloud = () => (
  <div className="fixed inset-0 aura-cloud -z-10 pointer-events-none" />
);

const IconButton = ({ icon: Icon, className, onClick }: { icon: any, className?: string, onClick?: (e: any) => void }) => (
  <motion.button 
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className={cn("text-primary hover:text-primary-container transition-all", className)}
  >
    <Icon size={24} />
  </motion.button>
);

// --- Screens ---

const LoginScreen = ({ onGuestLogin }: { onGuestLogin: () => void }) => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-surface flex flex-col items-center justify-center overflow-hidden">
      <AuraCloud />
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center space-y-12 px-6"
      >
        <div className="space-y-4">
          <h1 className="font-headline text-7xl font-bold tracking-tighter text-primary drop-shadow-[0_0_20px_rgba(161,250,255,0.5)]">
            Aura
          </h1>
          <p className="font-label text-xs uppercase tracking-[0.6em] text-on-surface-variant font-medium">
            The Sonic Atmosphere
          </p>
        </div>
        
        <div className="flex flex-col gap-4 w-full max-w-xs mx-auto">
          <button 
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="group relative px-8 py-4 bg-primary text-on-primary rounded-full font-headline font-bold text-lg shadow-[0_0_30px_rgba(161,250,255,0.4)] hover:shadow-[0_0_50px_rgba(161,250,255,0.6)] transition-all active:scale-95 disabled:opacity-50"
          >
            <div className="flex items-center justify-center gap-3">
              <LogIn size={24} />
              {isLoggingIn ? 'Connecting...' : 'Connect with Google'}
            </div>
          </button>

          <button 
            onClick={onGuestLogin}
            className="px-8 py-4 bg-surface-container-highest text-on-surface rounded-full font-headline font-bold text-lg border border-white/5 hover:bg-surface-container-high transition-all active:scale-95"
          >
            Continue as Guest
          </button>
        </div>

        <p className="text-on-surface-variant text-xs font-body max-w-[240px] mx-auto opacity-60">
          Guest mode allows local playback only. Connect to sync playlists and access cloud features.
        </p>
      </motion.div>
    </div>
  );
};

const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-surface flex flex-col items-center justify-center overflow-hidden"
    >
      <AuraCloud />
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative flex flex-col items-center gap-12"
      >
        <div className="relative w-32 h-32 bg-surface-container-low rounded-full flex items-center justify-center backdrop-blur-3xl shadow-[0_0_40px_rgba(0,244,254,0.3)]">
          <motion.div
            animate={{ height: [20, 40, 20] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="w-2 bg-primary mx-1 rounded-full"
          />
          <motion.div
            animate={{ height: [40, 20, 40] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
            className="w-2 bg-primary mx-1 rounded-full"
          />
          <motion.div
            animate={{ height: [30, 50, 30] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className="w-2 bg-primary mx-1 rounded-full"
          />
        </div>
        <div className="text-center space-y-2">
          <h1 className="font-headline text-5xl font-bold tracking-tighter text-primary drop-shadow-[0_0_10px_rgba(161,250,255,0.5)]">
            Aura
          </h1>
          <p className="font-label text-[10px] uppercase tracking-[0.4em] text-on-surface-variant font-medium">
            The Sonic Atmosphere
          </p>
        </div>
      </motion.div>
      <div className="absolute bottom-20 w-full max-w-[240px] px-6 space-y-6">
        <div className="space-y-3">
          <div className="h-[2px] w-full bg-surface-variant rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2 }}
              className="h-full bg-primary"
            />
          </div>
          <div className="flex justify-between items-center px-1">
            <span className="font-label text-[10px] text-primary/60 font-medium">Synchronizing</span>
            <span className="font-label text-[10px] text-on-surface-variant">100%</span>
          </div>
        </div>
        <div className="flex flex-col items-center gap-1 opacity-40">
          <span className="font-label text-[8px] uppercase tracking-widest">v2.4.0 Codename: Nebula</span>
        </div>
      </div>
    </motion.div>
  );
};

const HomeScreen = () => {
  const { userProfile } = useFirebase();
  const { localSongs, playSong, currentSong, isPlaying } = useMusicPlayer();
  
  return (
    <div className="space-y-12 pb-32">
      <section className="space-y-2">
        <p className="text-primary font-label text-xs tracking-widest uppercase">Good Evening, {userProfile?.displayName?.split(' ')[0] || 'Listener'}</p>
        <h2 className="text-5xl font-headline font-bold tracking-tighter">Your Sonic <span className="text-secondary">Atmosphere</span></h2>
      </section>

      {localSongs.length > 0 ? (
        <>
          <section className="space-y-6">
            <div className="flex justify-between items-end">
              <h3 className="text-xl font-headline font-medium">Recently Added</h3>
              <button className="text-primary text-sm font-label uppercase tracking-widest">View All</button>
            </div>
            <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4 -mx-6 px-6">
              {localSongs.slice(0, 5).map((song, i) => (
                <motion.div 
                  key={song.id} 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => playSong(song)} 
                  className={cn("flex-shrink-0 group space-y-4 cursor-pointer", i === 1 ? "w-72 pt-8" : "w-64")}
                >
                  <div className={cn("relative overflow-hidden rounded-xl bg-surface-container-high shadow-xl transition-transform duration-500 group-hover:scale-[1.02]", i === 1 ? "aspect-[4/5]" : "aspect-square")}>
                    <img 
                      src={song.coverUrl} 
                      alt={song.title}
                      className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {currentSong?.id === song.id && isPlaying ? (
                        <Pause fill="currentColor" className="text-primary" size={48} />
                      ) : (
                        <Play fill="currentColor" className="text-primary" size={48} />
                      )}
                    </div>
                  </div>
                  <div className="px-1">
                    <h4 className={cn("text-lg font-headline font-medium tracking-tight truncate", currentSong?.id === song.id ? "text-primary" : "text-on-surface")}>{song.title}</h4>
                    <p className="text-on-surface-variant font-label text-sm uppercase tracking-wide truncate">{song.artist}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <section className="lg:col-span-2 space-y-6">
              <h3 className="text-xl font-headline font-medium">Heavy Rotation</h3>
              <div className="space-y-2">
                {localSongs.slice(0, 6).map((track, i) => (
                  <motion.div 
                    key={track.id} 
                    whileHover={{ x: 10, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => playSong(track)}
                    className={cn(
                      "flex items-center gap-4 p-3 rounded-xl transition-colors group cursor-pointer",
                      currentSong?.id === track.id ? "bg-primary/10" : ""
                    )}
                  >
                    <span className="text-zinc-600 font-headline w-6 text-center group-hover:text-primary">0{i+1}</span>
                    <img src={track.coverUrl} alt={track.title} className="w-12 h-12 rounded-lg object-cover" referrerPolicy="no-referrer" />
                    <div className="flex-grow min-w-0">
                      <h5 className={cn("font-headline font-medium tracking-tight truncate", currentSong?.id === track.id ? "text-primary" : "text-on-surface")}>{track.title}</h5>
                      <p className="text-xs text-on-surface-variant uppercase tracking-widest font-label truncate">{track.artist}</p>
                    </div>
                    <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="text-zinc-500 hover:text-tertiary"><Heart size={20} /></button>
                      <button className="text-zinc-500 hover:text-primary"><MoreVertical size={20} /></button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            <section className="space-y-6">
              <h3 className="text-xl font-headline font-medium">Collections</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-panel p-4 rounded-xl space-y-3 hover:bg-primary/5 transition-all cursor-pointer group border border-white/5">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                    <Play size={20} fill="currentColor" />
                  </div>
                  <div>
                    <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant">Playlist</p>
                    <h6 className="font-headline font-bold">Focus Mode</h6>
                  </div>
                </div>
                <div className="glass-panel p-4 rounded-xl space-y-3 hover:bg-secondary/5 transition-all cursor-pointer group border border-white/5">
                  <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center text-secondary">
                    <Smartphone size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant">Playlist</p>
                    <h6 className="font-headline font-bold">Late Night</h6>
                  </div>
                </div>
                <div className="glass-panel p-4 rounded-xl space-y-3 hover:bg-tertiary/5 transition-all cursor-pointer group border border-white/5">
                  <div className="w-10 h-10 rounded-lg bg-tertiary/20 flex items-center justify-center text-tertiary">
                    <Heart size={20} fill="currentColor" />
                  </div>
                  <div>
                    <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant">Pinned</p>
                    <h6 className="font-headline font-bold">Liked Songs</h6>
                  </div>
                </div>
                <div className="glass-panel p-4 rounded-xl space-y-3 hover:bg-zinc-400/5 transition-all cursor-pointer group border border-white/5">
                  <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
                    <Plus size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant">Custom</p>
                    <h6 className="font-headline font-bold">Create New</h6>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-6">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary animate-pulse">
            <Library size={48} />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-headline font-bold">Your Atmosphere is Empty</h3>
            <p className="text-on-surface-variant max-w-md mx-auto">Start by adding your local music collection to create your unique sonic identity.</p>
          </div>
          <button 
            onClick={() => {
              // We can't directly trigger the file input from here easily without refs,
              // so we'll just navigate to the library tab.
              // But HomeScreen doesn't have access to setActiveTab.
              // For now, just a hint.
            }}
            className="px-8 py-3 bg-primary text-on-primary rounded-full font-headline font-bold shadow-lg hover:scale-105 transition-transform"
          >
            Go to Library
          </button>
        </div>
      )}
    </div>
  );
};

const LibraryScreen = () => {
  const [activeLibraryTab, setActiveLibraryTab] = useState<'Songs' | 'Albums' | 'Artists' | 'Folders'>('Songs');
  const { localSongs, addLocalSongs, playSong, currentSong, isPlaying } = useMusicPlayer();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newSongs: Song[] = Array.from(files).map((file: File, index) => ({
      id: `local-${Date.now()}-${index}`,
      title: file.name.replace(/\.[^/.]+$/, ""),
      artist: "Local Artist",
      album: "Local Album",
      coverUrl: "https://picsum.photos/seed/local/200/200",
      duration: "0:00",
      url: URL.createObjectURL(file),
      isLocal: true
    }));

    addLocalSongs(newSongs);
  };

  return (
    <div className="space-y-10 pb-32">
      <section>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="font-headline text-4xl font-medium tracking-tight mb-2">Your Library</h2>
            <p className="text-on-surface-variant font-body text-sm tracking-wide">{localSongs.length} local tracks synchronized</p>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <div className="relative group w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors" size={20} />
              <input 
                className="w-full bg-surface-container-low/60 border-none rounded-full py-3 pl-12 pr-6 focus:ring-1 focus:ring-primary/40 backdrop-blur-md text-sm placeholder:text-on-surface-variant/50 outline-none" 
                placeholder="Search your music..." 
                type="text"
              />
            </div>
            <motion.label 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-6 py-3 bg-secondary text-on-secondary rounded-full font-headline font-bold shadow-lg cursor-pointer w-full md:w-auto justify-center"
            >
              <Plus size={20} /> Add Local
              <input type="file" multiple accept="audio/*" className="hidden" onChange={handleFileSelect} />
            </motion.label>
          </div>
        </div>
      </section>

      <nav className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
        {['Songs', 'Albums', 'Artists', 'Folders'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveLibraryTab(tab as any)}
            className={cn(
              "px-6 py-2.5 rounded-full font-headline text-sm transition-all whitespace-nowrap",
              activeLibraryTab === tab 
                ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(161,250,255,0.2)]" 
                : "bg-surface-container-high/40 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest"
            )}
          >
            {tab}
          </button>
        ))}
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <section className="lg:col-span-12 space-y-4">
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="font-headline text-xl font-medium">{activeLibraryTab}</h3>
            {activeLibraryTab === 'Songs' && localSongs.length > 0 && (
              <button className="text-primary text-xs font-bold tracking-widest uppercase flex items-center gap-2 hover:opacity-80 transition-opacity">
                Shuffle All <Shuffle size={14} />
              </button>
            )}
          </div>
          
          {activeLibraryTab === 'Songs' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {localSongs.length > 0 ? (
                localSongs.map(song => (
                  <motion.div 
                    key={song.id} 
                    whileHover={{ scale: 1.02, backgroundColor: "rgba(161, 250, 255, 0.05)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => playSong(song)}
                    className={cn(
                      "group flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer border",
                      currentSong?.id === song.id ? "bg-primary/10 border-primary/20" : "bg-surface-container-high/20 border-transparent hover:border-primary/10"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative w-14 h-14 rounded-md overflow-hidden bg-surface-container-highest">
                        <img src={song.coverUrl} alt={song.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <div className={cn(
                          "absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity",
                          currentSong?.id === song.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                        )}>
                          {currentSong?.id === song.id && isPlaying ? (
                            <Pause fill="currentColor" className="text-primary" size={20} />
                          ) : (
                            <Play fill="currentColor" className="text-primary" size={20} />
                          )}
                        </div>
                      </div>
                      <div className="min-w-0">
                        <p className={cn("font-headline font-medium truncate", currentSong?.id === song.id ? "text-primary" : "text-on-surface")}>{song.title}</p>
                        <p className="text-xs text-on-surface-variant font-body truncate">{song.artist}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Heart size={18} className="text-on-surface-variant hover:text-tertiary transition-colors" />
                      <MoreVertical size={18} className="text-on-surface-variant" />
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center space-y-4 opacity-50">
                  <Library size={48} className="mx-auto" />
                  <p className="font-headline text-lg">Your local library is empty</p>
                  <p className="text-sm">Click "Add Local" to scan your system storage</p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-20 text-center opacity-30">
              <Activity size={48} className="mx-auto mb-4" />
              <p className="font-headline text-xl">Coming Soon</p>
              <p className="text-sm">We're building the ultimate {activeLibraryTab} management experience.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

const SettingsScreen = ({ onLogin }: { onLogin?: () => void }) => {
  const { userProfile, user } = useFirebase();
  
  return (
    <div className="max-w-2xl mx-auto space-y-12 pb-32">
      <section className="space-y-6">
        <div className="flex items-end justify-between">
          <h2 className="text-xl font-headline font-medium tracking-tight text-primary">Profile</h2>
          <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-label">Account</span>
        </div>
        <div className="bg-surface-container/40 backdrop-blur-xl rounded-xl p-6 border border-white/5 shadow-2xl flex items-center gap-6">
          <div className="w-20 h-20 rounded-full border-2 border-primary/20 bg-surface-container-highest flex items-center justify-center overflow-hidden">
            {userProfile?.photoURL ? (
              <img src={userProfile.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="text-primary/40"><Library size={40} /></div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-headline font-bold">{userProfile?.displayName || 'Guest Explorer'}</h3>
            <p className="text-on-surface-variant font-body">{userProfile?.email || 'Local mode active'}</p>
          </div>
          {user ? (
            <button 
              onClick={() => logout()}
              className="p-3 bg-error/10 text-error rounded-full hover:bg-error/20 transition-all"
            >
              <LogOut size={20} />
            </button>
          ) : (
            <button 
              onClick={onLogin}
              className="px-6 py-2 bg-primary text-on-primary rounded-full font-headline font-bold text-sm shadow-lg hover:scale-105 transition-transform"
            >
              Connect
            </button>
          )}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-end justify-between">
          <h2 className="text-xl font-headline font-medium tracking-tight text-primary">Theme</h2>
          <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-label">Visual Identity</span>
        </div>
        <div className="bg-surface-container/40 backdrop-blur-xl rounded-xl p-6 border border-white/5 shadow-2xl space-y-8">
          <div>
            <p className="text-sm text-on-surface-variant mb-4 font-label">Aura Neon Color</p>
            <div className="flex gap-4 items-center">
              <div className="group relative">
                <button className="w-12 h-12 rounded-full bg-primary shadow-[0_0_15px_rgba(161,255,255,0.4)] border-2 border-white ring-4 ring-primary/20"></button>
              </div>
              <button className="w-10 h-10 rounded-full bg-secondary hover:ring-4 ring-secondary/20 transition-all"></button>
              <button className="w-10 h-10 rounded-full bg-tertiary hover:ring-4 ring-tertiary/20 transition-all"></button>
              <button className="w-10 h-10 rounded-full bg-orange-400 hover:ring-4 ring-orange-400/20 transition-all"></button>
              <button className="w-10 h-10 rounded-full bg-emerald-400 hover:ring-4 ring-emerald-400/20 transition-all"></button>
            </div>
          </div>
          <div className="flex items-center justify-between py-2 border-t border-white/5">
            <div>
              <p className="text-on-surface font-medium">Dynamic Background</p>
              <p className="text-xs text-on-surface-variant">Animate aura based on track mood</p>
            </div>
            <div className="w-12 h-6 bg-primary rounded-full relative flex items-center px-1">
              <div className="w-4 h-4 bg-on-primary rounded-full absolute right-1 shadow-sm"></div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-end justify-between">
          <h2 className="text-xl font-headline font-medium tracking-tight text-secondary">Audio</h2>
          <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-label">The Sound Stage</span>
        </div>
        <div className="bg-surface-container/40 backdrop-blur-xl rounded-xl p-6 border border-white/5 shadow-2xl space-y-8">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <p className="text-sm text-on-surface-variant font-label">5-Band Equalizer</p>
              <span className="text-xs font-headline text-secondary px-2 py-0.5 rounded-full border border-secondary/30">VIBRANT PRESET</span>
            </div>
            <div className="flex justify-between items-end h-32 px-4">
              {[60, 230, 910, 3.6, 14].map((freq, i) => (
                <div key={freq} className="flex flex-col items-center gap-2 group h-full justify-end w-12">
                  <div className="w-1.5 h-full bg-surface-container-highest rounded-full relative overflow-hidden">
                    <div 
                      className="absolute bottom-0 w-full bg-gradient-to-t from-secondary to-secondary-container shadow-[0_0_10px_rgba(214,116,255,0.4)]"
                      style={{ height: `${[60, 45, 85, 70, 55][i]}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-label text-on-surface-variant group-hover:text-secondary transition-colors">{freq}{freq < 20 ? 'kHz' : 'Hz'}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between py-4 border-t border-white/5 group cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                <Mic2 size={20} />
              </div>
              <div>
                <p className="text-on-surface font-medium group-hover:text-secondary transition-colors">Advanced Audio Engine</p>
                <p className="text-xs text-on-surface-variant">Crossfade, Gapless, and Gain</p>
              </div>
            </div>
            <ChevronDown className="-rotate-90 text-on-surface-variant" size={20} />
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-end justify-between">
          <h2 className="text-xl font-headline font-medium tracking-tight text-tertiary">Storage</h2>
          <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-label">The Library</span>
        </div>
        <div className="bg-surface-container/40 backdrop-blur-xl rounded-xl overflow-hidden border border-white/5 shadow-2xl">
          <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <FolderOpen className="text-tertiary" size={20} />
                <p className="text-on-surface font-medium">Music Directories</p>
              </div>
              <button className="px-4 py-1.5 bg-tertiary/10 text-tertiary rounded-full text-xs font-bold font-label hover:bg-tertiary/20 transition-all">SCAN NOW</button>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-label text-on-surface-variant uppercase tracking-tighter">
                <span>Storage Used</span>
                <span>42.8 GB / 128 GB</span>
              </div>
              <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                <div className="w-1/3 h-full bg-tertiary"></div>
              </div>
            </div>
          </div>
          <div className="bg-surface-container-low px-6 py-4 flex items-center justify-between border-t border-white/5">
            <div className="flex items-center gap-4">
              <Trash2 className="text-on-surface-variant" size={20} />
              <p className="text-sm">Clear Artwork Cache</p>
            </div>
            <span className="text-xs text-on-surface-variant font-label">1.2 GB</span>
          </div>
        </div>
      </section>

      <div className="py-12 flex flex-col items-center opacity-20 select-none">
        <h1 className="text-4xl font-bold text-cyan-300 tracking-[0.2em] font-headline">AURA</h1>
        <p className="text-[10px] uppercase tracking-[0.5em] mt-2">Designed for the Ethereal</p>
      </div>
    </div>
  );
};

const NowPlayingOverlay = ({ onClose }: { onClose: () => void }) => {
  const { currentSong, isPlaying, togglePlay, progress, duration, nextSong, prevSong } = useMusicPlayer();

  if (!currentSong) return null;

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div 
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-[60] bg-surface flex flex-col"
    >
      <AuraCloud />
      <header className="fixed top-0 w-full z-50 bg-zinc-950/60 backdrop-blur-3xl flex justify-between items-center px-6 h-16 shadow-[0_4px_30px_rgba(0,245,255,0.1)]">
        <IconButton icon={ChevronDown} onClick={onClose} className="text-cyan-300" />
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-label">Now Playing</p>
          <h1 className="font-headline tracking-tight font-medium text-cyan-300 drop-shadow-[0_0_8px_rgba(161,250,255,0.8)]">Aura</h1>
        </div>
        <IconButton icon={MoreVertical} className="text-cyan-300" />
      </header>

      <main className="flex-1 flex flex-col justify-center items-center px-8 pt-16 pb-24 max-w-lg mx-auto w-full">
        <div className="relative w-full aspect-square mb-12 group">
          <div className="absolute -inset-4 bg-primary/5 rounded-[2rem] blur-2xl group-hover:bg-primary/10 transition-all duration-700" />
          <div className="relative w-full h-full rounded-xl overflow-hidden shadow-2xl transform rotate-1 group-hover:rotate-0 transition-transform duration-500">
            <img 
              src={currentSong.coverUrl} 
              alt={currentSong.title} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-secondary/20 rounded-full blur-xl animate-pulse" />
          <div className="absolute -left-6 top-1/2 w-16 h-16 bg-tertiary/10 rounded-full blur-lg" />
        </div>

        <div className="w-full mb-8 text-left self-start pl-2">
          <div className="flex justify-between items-end gap-4">
            <div className="flex-1">
              <h2 className="font-headline text-4xl md:text-5xl tracking-tighter text-on-surface leading-none mb-2">{currentSong.title}</h2>
              <p className="font-headline text-xl text-secondary opacity-90">{currentSong.artist}</p>
            </div>
            <button className="mb-2 text-tertiary drop-shadow-[0_0_10px_rgba(255,107,152,0.4)] hover:scale-110 transition-transform">
              <Heart fill="currentColor" size={32} />
            </button>
          </div>
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
            <Star size={12} className="text-primary" />
            <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
              {currentSong.isLocal ? 'LOCAL FILE' : 'STREAMING'} | {currentSong.format || 'MP3'}
            </span>
          </div>
        </div>

        <div className="w-full space-y-8">
          <div className="relative">
            <div className="w-full h-1.5 bg-surface-variant/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-primary-container relative transition-all"
                style={{ width: `${(progress / duration) * 100}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_15px_rgba(161,250,255,1)]" />
              </div>
            </div>
            <div className="flex justify-between mt-3">
              <span className="font-label text-[10px] text-zinc-500 tracking-tighter">{formatTime(progress)}</span>
              <span className="font-label text-[10px] text-zinc-500 tracking-tighter">{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between px-2">
            <button className="text-zinc-500 hover:text-primary transition-all"><Shuffle size={24} /></button>
            <div className="flex items-center gap-8">
              <button onClick={prevSong} className="text-on-surface hover:text-primary transition-all active:scale-90"><SkipBack fill="currentColor" size={36} /></button>
              <button 
                onClick={togglePlay}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-on-primary shadow-[0_0_30px_rgba(0,244,254,0.3)] hover:shadow-[0_0_45px_rgba(0,244,254,0.5)] active:scale-90 transition-all duration-300"
              >
                {isPlaying ? <Pause fill="currentColor" size={48} /> : <Play fill="currentColor" size={48} />}
              </button>
              <button onClick={nextSong} className="text-on-surface hover:text-primary transition-all active:scale-90"><SkipForward fill="currentColor" size={36} /></button>
            </div>
            <button className="text-primary drop-shadow-[0_0_8px_rgba(161,250,255,0.4)]"><Repeat size={24} /></button>
          </div>

          <div className="flex justify-around items-center pt-4">
            <div className="flex flex-col items-center gap-1 group cursor-pointer">
              <Smartphone size={20} className="text-zinc-500 group-hover:text-primary transition-colors" />
              <span className="font-label text-[8px] uppercase tracking-widest text-zinc-600 group-hover:text-primary">Studio A1</span>
            </div>
            <div className="flex flex-col items-center gap-1 group cursor-pointer">
              <Mic2 size={20} className="text-zinc-500 group-hover:text-secondary transition-colors" />
              <span className="font-label text-[8px] uppercase tracking-widest text-zinc-600 group-hover:text-secondary">Lyrics</span>
            </div>
            <div className="flex flex-col items-center gap-1 group cursor-pointer">
              <ListMusic size={20} className="text-zinc-500 group-hover:text-tertiary transition-colors" />
              <span className="font-label text-[8px] uppercase tracking-widest text-zinc-600 group-hover:text-tertiary">Queue</span>
            </div>
            <div className="flex flex-col items-center gap-1 group cursor-pointer">
              <Share2 size={20} className="text-zinc-500 group-hover:text-primary transition-colors" />
              <span className="font-label text-[8px] uppercase tracking-widest text-zinc-600 group-hover:text-primary">Share</span>
            </div>
          </div>
        </div>
      </main>
    </motion.div>
  );
};

// --- Main App ---

function AppContent() {
  const { user, loading, isAuthReady } = useFirebase();
  const { currentSong, isPlaying, togglePlay, progress, duration, nextSong, prevSong } = useMusicPlayer();
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'library' | 'playlists' | 'settings'>('home');
  const [isNowPlayingOpen, setIsNowPlayingOpen] = useState(false);
  const [userPlaylists, setUserPlaylists] = useState<Playlist[]>([]);
  const [guestMode, setGuestMode] = useState(false);

  useEffect(() => {
    if (user && isAuthReady) {
      const q = query(collection(db, 'playlists'), where('ownerId', '==', user.uid), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const playlists = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Playlist));
        setUserPlaylists(playlists);
      });
      return () => unsubscribe();
    }
  }, [user, isAuthReady]);

  if (loading) return <SplashScreen onComplete={() => {}} />;
  if (!user && !guestMode) return <LoginScreen onGuestLogin={() => setGuestMode(true)} />;

  return (
    <div className="min-h-screen flex flex-col">
      <AnimatePresence>
        {!isLoaded && <SplashScreen onComplete={() => setIsLoaded(true)} />}
      </AnimatePresence>

      <AuraCloud />

      <header className="bg-zinc-950/60 backdrop-blur-3xl fixed top-0 w-full z-50 shadow-[0_4px_30px_rgba(0,245,255,0.1)]">
        <div className="flex justify-between items-center px-6 h-16 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <IconButton icon={Menu} className="text-cyan-300" />
            <h1 className="text-2xl font-bold text-cyan-300 tracking-tighter font-headline">Aura</h1>
          </div>
          <div className="flex items-center gap-6">
            <IconButton icon={Search} className="text-cyan-300" />
            <div className="hidden md:flex gap-8 font-headline tracking-tight font-medium">
              <button 
                onClick={() => setActiveTab('home')}
                className={cn("transition-colors", activeTab === 'home' ? "text-cyan-300 drop-shadow-[0_0_8px_rgba(161,250,255,0.8)]" : "text-zinc-400 hover:text-cyan-200")}
              >
                Home
              </button>
              <button 
                onClick={() => setActiveTab('library')}
                className={cn("transition-colors", activeTab === 'library' ? "text-cyan-300 drop-shadow-[0_0_8px_rgba(161,250,255,0.8)]" : "text-zinc-400 hover:text-cyan-200")}
              >
                Library
              </button>
              <button 
                onClick={() => setActiveTab('playlists')}
                className={cn("transition-colors", activeTab === 'playlists' ? "text-cyan-300 drop-shadow-[0_0_8px_rgba(161,250,255,0.8)]" : "text-zinc-400 hover:text-cyan-200")}
              >
                Playlists
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-24 px-6 max-w-7xl mx-auto w-full flex-1">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div 
              key="home" 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <HomeScreen />
            </motion.div>
          )}
          {activeTab === 'library' && (
            <motion.div 
              key="library" 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <LibraryScreen />
            </motion.div>
          )}
          {activeTab === 'settings' && (
            <motion.div 
              key="settings" 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <SettingsScreen onLogin={() => setGuestMode(false)} />
            </motion.div>
          )}
          {activeTab === 'playlists' && (
            <motion.div 
              key="playlists" 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="space-y-10 pb-32">
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-4xl font-headline font-bold tracking-tight">Your Playlists</h2>
                    <p className="text-on-surface-variant font-body mt-2">Sonic atmospheres created by you</p>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-full font-headline font-bold shadow-lg"
                  >
                    <Plus size={20} /> New Playlist
                  </motion.button>
                </div>

                {userPlaylists.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {userPlaylists.map(playlist => (
                      <div key={playlist.id} className="group cursor-pointer">
                        <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 shadow-2xl transition-transform group-hover:scale-[1.02]">
                          <img src={playlist.coverUrl || 'https://picsum.photos/seed/playlist/400/400'} alt={playlist.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Play fill="currentColor" className="text-primary" size={48} />
                          </div>
                        </div>
                        <h3 className="font-headline font-bold text-lg group-hover:text-primary transition-colors">{playlist.title}</h3>
                        <p className="text-on-surface-variant text-sm font-body">{playlist.type}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[40vh] text-center space-y-4">
                    <ListMusic size={64} className="text-secondary opacity-50" />
                    <h2 className="text-2xl font-headline font-bold">No Playlists Yet</h2>
                    <p className="text-on-surface-variant max-w-md">Start creating your custom sonic atmospheres to see them here.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Mini Player */}
      <AnimatePresence>
        {currentSong && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            onClick={() => setIsNowPlayingOpen(true)}
            className="fixed bottom-24 left-6 right-6 h-16 glass-panel bg-surface-container/80 rounded-2xl flex items-center justify-between px-4 z-40 shadow-2xl border border-white/5 cursor-pointer hover:bg-surface-container/90 transition-all"
          >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-800">
              <img src={currentSong.coverUrl} alt="Mini Cover" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="overflow-hidden">
              <p className="font-headline text-sm font-medium leading-tight truncate w-32 md:w-auto">{currentSong.title}</p>
              <p className="font-body text-[10px] text-on-surface-variant uppercase tracking-widest">{currentSong.artist}</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-center w-48 mx-4">
              <div className="w-full h-1 bg-surface-variant/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary shadow-[0_0_10px_rgba(161,250,255,0.8)] transition-all" 
                  style={{ width: `${(progress / duration) * 100}%` }}
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <IconButton icon={SkipBack} onClick={(e) => { e.stopPropagation(); prevSong(); }} className="text-on-surface-variant" />
              <div 
                onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all"
              >
                {isPlaying ? <Pause fill="currentColor" size={20} /> : <Play fill="currentColor" size={20} />}
              </div>
              <IconButton icon={SkipForward} onClick={(e) => { e.stopPropagation(); nextSong(); }} className="text-on-surface-variant" />
            </div>
          </div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full rounded-t-[2rem] z-50 bg-zinc-900/70 backdrop-blur-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] h-20 px-8 pb-safe flex justify-around items-center">
        <button 
          onClick={() => setActiveTab('home')}
          className={cn("flex items-center justify-center p-3 transition-all active:scale-110", activeTab === 'home' ? "bg-primary/10 text-primary rounded-full shadow-[0_0_15px_rgba(161,250,255,0.3)]" : "text-zinc-500 hover:bg-zinc-800/50")}
        >
          <Home size={24} />
        </button>
        <button 
          onClick={() => setActiveTab('library')}
          className={cn("flex items-center justify-center p-3 transition-all active:scale-110", activeTab === 'library' ? "bg-primary/10 text-primary rounded-full shadow-[0_0_15px_rgba(161,250,255,0.3)]" : "text-zinc-500 hover:bg-zinc-800/50")}
        >
          <Library size={24} />
        </button>
        <button 
          onClick={() => setActiveTab('playlists')}
          className={cn("flex items-center justify-center p-3 transition-all active:scale-110", activeTab === 'playlists' ? "bg-primary/10 text-primary rounded-full shadow-[0_0_15px_rgba(161,250,255,0.3)]" : "text-zinc-500 hover:bg-zinc-800/50")}
        >
          <ListMusic size={24} />
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={cn("flex items-center justify-center p-3 transition-all active:scale-110", activeTab === 'settings' ? "bg-primary/10 text-primary rounded-full shadow-[0_0_15px_rgba(161,250,255,0.3)]" : "text-zinc-500 hover:bg-zinc-800/50")}
        >
          <SettingsIcon size={24} />
        </button>
      </nav>

      <AnimatePresence>
        {isNowPlayingOpen && <NowPlayingOverlay onClose={() => setIsNowPlayingOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <FirebaseProvider>
        <MusicPlayerProvider>
          <AppContent />
        </MusicPlayerProvider>
      </FirebaseProvider>
    </ErrorBoundary>
  );
}
