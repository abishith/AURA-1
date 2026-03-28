export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string | number;
  coverUrl: string;
  url?: string;
  format?: 'FLAC' | 'MP3';
  bitrate?: string;
  isLocal?: boolean;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  year: string;
  coverUrl: string;
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  type: 'Public Playlist' | 'Custom' | 'Pinned';
}
