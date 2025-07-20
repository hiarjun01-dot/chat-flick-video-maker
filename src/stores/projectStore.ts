import { create } from 'zustand';
import { Character, Message, VideoSettings, Project } from '@/types';

interface ProjectState {
  currentProject: Project | null;
  characters: Character[];
  messages: Message[];
  settings: VideoSettings;
  currentStep: string;
  completedSteps: string[];

  // Actions
  setCurrentStep: (step: string) => void;
  markStepCompleted: (step: string) => void;
  addCharacter: (character: Omit<Character, 'id'>) => void;
  updateCharacter: (id: string, updates: Partial<Character>) => void;
  deleteCharacter: (id: string) => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  deleteMessage: (id: string) => void;
  reorderMessages: (messages: Message[]) => void;
  updateSettings: (settings: Partial<VideoSettings>) => void;
  createNewProject: (name: string) => void;
  loadProject: (project: Project) => void;
  resetProject: () => void;
  saveProjectToFile: () => void;
  loadProjectFromFile: (file: File) => Promise<void>;
}

const defaultSettings: VideoSettings = {
  theme: 'dark',
  duration: 30,
  messageSpeed: 50,
  animationSpeed: 'normal',
  fontFamily: 'system',
  resolution: '1080p',
  watermarkPosition: 'bottom-right',
};

export const useProjectStore = create<ProjectState>((set, get) => ({
  currentProject: null,
  characters: [],
  messages: [],
  settings: defaultSettings,
  currentStep: 'characters',
  completedSteps: [],

  setCurrentStep: (step) => set({ currentStep: step }),

  markStepCompleted: (step) => set((state) => ({
    completedSteps: state.completedSteps.includes(step) 
      ? state.completedSteps 
      : [...state.completedSteps, step]
  })),

  addCharacter: (characterData) => {
    const character: Character = {
      ...characterData,
      id: crypto.randomUUID(),
    };
    set((state) => ({
      characters: [...state.characters, character]
    }));
  },

  updateCharacter: (id, updates) => set((state) => ({
    characters: state.characters.map(char =>
      char.id === id ? { ...char, ...updates } : char
    )
  })),

  deleteCharacter: (id) => set((state) => ({
    characters: state.characters.filter(char => char.id !== id),
    messages: state.messages.filter(msg => msg.characterId !== id)
  })),

  addMessage: (messageData) => {
    const message: Message = {
      ...messageData,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    set((state) => ({
      messages: [...state.messages, message]
    }));
  },

  updateMessage: (id, updates) => set((state) => ({
    messages: state.messages.map(msg =>
      msg.id === id ? { ...msg, ...updates } : msg
    )
  })),

  deleteMessage: (id) => set((state) => ({
    messages: state.messages.filter(msg => msg.id !== id)
  })),

  reorderMessages: (messages) => set({ messages }),

  updateSettings: (settingsUpdate) => set((state) => ({
    settings: { ...state.settings, ...settingsUpdate }
  })),

  createNewProject: (name) => {
    const project: Project = {
      id: crypto.randomUUID(),
      name,
      characters: [],
      script: { messages: [] },
      settings: defaultSettings,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    set({
      currentProject: project,
      characters: [],
      messages: [],
      settings: defaultSettings,
      currentStep: 'characters',
      completedSteps: [],
    });
  },

  loadProject: (project) => set({
    currentProject: project,
    characters: project.characters,
    messages: project.script.messages,
    settings: project.settings,
    currentStep: 'characters',
    completedSteps: [],
  }),

  resetProject: () => set({
    currentProject: null,
    characters: [],
    messages: [],
    settings: defaultSettings,
    currentStep: 'characters',
    completedSteps: [],
  }),

  saveProjectToFile: () => {
    const state = get();
    const projectData: Project = {
      id: state.currentProject?.id || crypto.randomUUID(),
      name: state.currentProject?.name || 'Untitled Project',
      characters: state.characters,
      script: { messages: state.messages },
      settings: state.settings,
      createdAt: state.currentProject?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    const dataStr = JSON.stringify(projectData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `${projectData.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  loadProjectFromFile: async (file: File) => {
    try {
      const text = await file.text();
      const project: Project = JSON.parse(text);
      
      // Validate project structure
      if (!project.id || !project.name || !project.characters || !project.script) {
        throw new Error('Invalid project file format');
      }

      get().loadProject(project);
    } catch (error) {
      console.error('Failed to load project:', error);
      throw new Error('Failed to load project file. Please check the file format.');
    }
  },
}));