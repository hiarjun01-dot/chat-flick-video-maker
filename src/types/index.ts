export interface Character {
  id: string;
  name: string;
  avatar: string;
  color: string;
}

export interface Message {
  id: string;
  characterId: string;
  text: string;
  timestamp: number;
  delay?: number; // seconds to wait before showing this message
}

export interface ChatScript {
  messages: Message[];
}

export interface VideoSettings {
  theme: 'light' | 'dark';
  backgroundImage?: string;
  musicTrack?: string;
  duration: number;
  messageSpeed: number; // typing speed in ms per character
}

export interface Project {
  id: string;
  name: string;
  characters: Character[];
  script: ChatScript;
  settings: VideoSettings;
  createdAt: number;
  updatedAt: number;
}

export interface MusicTrack {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  url?: string; // For actual audio file
}