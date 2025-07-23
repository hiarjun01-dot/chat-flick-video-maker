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
  typingDuration?: number; // duration to show typing indicator
  reaction?: string; // emoji reaction
  imageUrl?: string; // for image messages
  showTimestamp?: boolean; // whether to show timestamp
  // V3.1 Dynamic Effects
  soundEffect?: 'none' | 'ping' | 'swoosh' | 'error' | 'gasp'; // sound emphasis
  zoomIn?: boolean; // zoom-in focus effect
  spotlightMode?: boolean; // display alone mode
}

export interface ChatScript {
  messages: Message[];
}

export interface VideoSettings {
  theme: 'light' | 'dark';
  backgroundImage?: string;
  backgroundColor?: string; // custom background color
  musicTrack?: string;
  duration: number;
  messageSpeed: number; // typing speed in ms per character
  animationSpeed: 'slow' | 'normal' | 'fast';
  fontFamily: 'system' | 'handwriting' | 'typewriter' | 'modern';
  senderBubbleColor?: string;
  receiverBubbleColor?: string;
  chatBackgroundColor?: string;
  resolution: '720p' | '1080p';
  watermarkImage?: string;
  watermarkPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
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
