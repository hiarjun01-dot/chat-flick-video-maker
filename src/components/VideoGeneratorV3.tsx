import React, { useState, useRef, useEffect } from 'react';
import { Play, Download, Loader2, Video, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useProjectStore } from '@/stores/projectStore';
import { toast } from 'sonner';

interface AnimationFrame {
  messages: Array<{
    id: string;
    characterId: string;
    text: string;
    timestamp: number;
    reaction?: string;
    imageUrl?: string;
    showTimestamp?: boolean;
    soundEffect?: string;
    zoomIn?: boolean;
    spotlightMode?: boolean;
  }>;
  time: number;
  typingCharacterId?: string; // For typing indicator
  isTyping?: boolean;
  zoomTarget?: string; // Message ID to zoom on
  spotlightMessage?: string; // Message ID to spotlight
}

export const VideoGeneratorV3: React.FC = () => {
  const { characters, messages, settings } = useProjectStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationFrames, setAnimationFrames] = useState<AnimationFrame[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [loadedAssets, setLoadedAssets] = useState<{[key: string]: HTMLImageElement}>({});
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const animationRef = useRef<NodeJS.Timeout>();
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBuffersRef = useRef<{[key: string]: AudioBuffer}>({});

  const getCharacterById = (id: string) => {
    return characters.find(char => char.id === id);
  };

  // Enhanced color utility functions - inspired by Python pipeline
  const adjustColorBrightness = (color: string, amount: number): string => {
    // Convert hex to RGB if needed
    let r, g, b;
    if (color.startsWith('#')) {
      const hex = color.substring(1);
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    } else if (color.startsWith('rgb')) {
      const matches = color.match(/\d+/g);
      if (matches) {
        r = parseInt(matches[0]);
        g = parseInt(matches[1]);
        b = parseInt(matches[2]);
      } else {
        return color;
      }
    } else {
      return color;
    }
    
    // Adjust brightness
    r = Math.max(0, Math.min(255, r + amount));
    g = Math.max(0, Math.min(255, g + amount));
    b = Math.max(0, Math.min(255, b + amount));
    
    return `rgb(${r}, ${g}, ${b})`;
  };

  // Preload all assets
  const preloadAssets = async (): Promise<{[key: string]: HTMLImageElement}> => {
    const assets: {[key: string]: HTMLImageElement} = {};
    const loadPromises: Promise<void>[] = [];

    // Load character avatars
    characters.forEach(character => {
      if (character.avatar) {
        const promise = new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            assets[`avatar_${character.id}`] = img;
            resolve();
          };
          img.onerror = () => {
            console.warn(`Failed to load avatar for ${character.name}`);
            resolve(); // Continue even if avatar fails
          };
          img.src = character.avatar;
        });
        loadPromises.push(promise);
      }
    });

    // Load background image
    if (settings.backgroundImage) {
      const promise = new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          assets['background'] = img;
          resolve();
        };
        img.onerror = () => {
          console.warn('Failed to load background image');
          resolve();
        };
        img.src = settings.backgroundImage;
      });
      loadPromises.push(promise);
    }

    // Load message images
    messages.forEach(message => {
      if (message.imageUrl) {
        const promise = new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            assets[`message_${message.id}`] = img;
            resolve();
          };
          img.onerror = () => {
            console.warn(`Failed to load image for message ${message.id}`);
            resolve();
          };
          img.src = message.imageUrl;
        });
        loadPromises.push(promise);
      }
    });

    // Load watermark
    if (settings.watermarkImage) {
      const promise = new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          assets['watermark'] = img;
          resolve();
        };
        img.onerror = () => {
          console.warn('Failed to load watermark');
          resolve();
        };
        img.src = settings.watermarkImage;
      });
      loadPromises.push(promise);
    }

    await Promise.all(loadPromises);
    return assets;
  };

  // Load sound effects
  const loadSoundEffects = async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const soundUrls = {
      ping: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmseAk+P2fPTdygAIG/K8uKVPwcOUpjo8bFmHAU1lM3z1nkqAyu3/jbDgCGg',
      swoosh: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmseAk+P2fPTdygAIG/K8uKVPwcOUpjo8bFmHAU1lM3z1nkqAyu3/jbDgCGg',
      error: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmseAk+P2fPTdygAIG/K8uKVPwcOUpjo8bFmHAU1lM3z1nkqAyu3/jbDgCGg',
      gasp: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmseAk+P2fPTdygAIG/K8uKVPwcOUpjo8bFmHAU1lM3z1nkqAyu3/jbDgCGg'
    };

    // Note: In a real implementation, you'd load actual sound files
    // For demo purposes, we'll simulate sound loading
  };

  // Generate enhanced animation frames with V3.1 effects
  const generateFrames = (): AnimationFrame[] => {
    const frames: AnimationFrame[] = [];
    let currentTime = 0;
    let visibleMessages: any[] = [];

    // Add initial empty frame
    frames.push({ messages: [], time: 0 });

    messages.forEach((message, index) => {
      // Add typing indicator frame if specified
      if (message.typingDuration && message.typingDuration > 0) {
        frames.push({
          messages: [...visibleMessages],
          time: currentTime,
          typingCharacterId: message.characterId,
          isTyping: true
        });
        currentTime += message.typingDuration;
      }

      // Add message delay
      currentTime += message.delay || 1;

      // V6.0 Enhanced Spotlight mode with improved stability
      if (message.spotlightMode) {
        // Store previous messages but clear for spotlight effect
        visibleMessages = [];
      }

      // Add the message
      const messageData = {
        id: message.id,
        characterId: message.characterId,
        text: message.text,
        timestamp: currentTime,
        reaction: message.reaction,
        imageUrl: message.imageUrl,
        showTimestamp: message.showTimestamp,
        soundEffect: message.soundEffect,
        zoomIn: message.zoomIn,
        spotlightMode: message.spotlightMode
      };

      visibleMessages.push(messageData);

      // Create frame with normal view
      frames.push({
        messages: [...visibleMessages],
        time: currentTime,
        spotlightMessage: message.spotlightMode ? message.id : undefined
      });

      // V6.0 Enhanced Zoom-in effects with improved stability
      if (message.zoomIn) {
        // Zoom in frame
        frames.push({
          messages: [...visibleMessages],
          time: currentTime + 0.3,
          zoomTarget: message.id
        });

        // Hold zoom for emphasis (shorter duration for better stability)
        frames.push({
          messages: [...visibleMessages],
          time: currentTime + 1.0,
          zoomTarget: message.id
        });

        // Smooth zoom out
        frames.push({
          messages: [...visibleMessages],
          time: currentTime + 1.3
        });

        currentTime += 1.3;
      }
    });

    return frames;
  };

  // Enhanced draw function with V3.1 effects
  const drawFrame = (frame: AnimationFrame, scale: number = 1, offsetX: number = 0, offsetY: number = 0) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size based on resolution setting
    const width = settings.resolution === '1080p' ? 1080 : 1280;
    const height = settings.resolution === '1080p' ? 1920 : 720;
    
    canvas.width = width;
    canvas.height = height;

    // Apply zoom transform
    ctx.save();
    ctx.scale(scale, scale);
    ctx.translate(offsetX, offsetY);

    // Clear canvas with background
    if (settings.chatBackgroundColor) {
      ctx.fillStyle = settings.chatBackgroundColor;
    } else {
      ctx.fillStyle = settings.theme === 'dark' ? '#1a1a1a' : '#ffffff';
    }
    ctx.fillRect(0, 0, width, height);

    // Draw background image if available
    if (loadedAssets['background']) {
      ctx.globalAlpha = 0.3;
      ctx.drawImage(loadedAssets['background'], 0, 0, width, height);
      ctx.globalAlpha = 1.0;
    }

    // Draw chat header
    const headerHeight = 120;
    ctx.fillStyle = settings.theme === 'dark' ? '#2a2a2a' : '#f5f5f5';
    ctx.fillRect(0, 0, width, headerHeight);

    // Header text
    ctx.fillStyle = settings.theme === 'dark' ? '#ffffff' : '#000000';
    ctx.font = `bold 36px ${settings.fontFamily === 'handwriting' ? 'cursive' : settings.fontFamily === 'typewriter' ? 'monospace' : 'system-ui'}`;
    ctx.textAlign = 'center';
    ctx.fillText('Chat Story', width / 2, 70);

    // Draw messages
    const messageStartY = headerHeight + 40;
    let currentY = messageStartY;
    const messageSpacing = 100;
    const messageMaxWidth = width - 160;

    // V6.0 Enhanced Spotlight filtering with improved stability
    const messagesToShow = frame.spotlightMessage 
      ? frame.messages.filter(msg => msg.id === frame.spotlightMessage)
      : frame.messages;

    messagesToShow.forEach((message, index) => {
      const character = getCharacterById(message.characterId);
      if (!character) return;

      const isEven = index % 2 === 0;
      const messageX = isEven ? 80 : width - messageMaxWidth - 80;

      // Highlight if this is the zoom target
      const isZoomTarget = frame.zoomTarget === message.id;
      if (isZoomTarget) {
        ctx.shadowColor = '#007AFF';
        ctx.shadowBlur = 20;
      }

      // Draw avatar
      const avatarSize = 60;
      const avatarX = isEven ? messageX - 80 : messageX + messageMaxWidth + 20;
      
      // Enhanced circular avatar rendering - inspired by Python pipeline
      const avatarImg = loadedAssets[`avatar_${character.id}`];
      if (avatarImg) {
        ctx.save();
        // Create perfect circular clipping path
        ctx.beginPath();
        ctx.arc(avatarX + avatarSize/2, currentY + 30, avatarSize/2, 0, 2 * Math.PI);
        ctx.clip();
        
        // Draw avatar with proper scaling to maintain aspect ratio
        const aspectRatio = avatarImg.width / avatarImg.height;
        let drawWidth = avatarSize;
        let drawHeight = avatarSize;
        let drawX = avatarX;
        let drawY = currentY;
        
        if (aspectRatio > 1) {
          // Image is wider than tall
          drawHeight = avatarSize / aspectRatio;
          drawY = currentY + (avatarSize - drawHeight) / 2;
        } else if (aspectRatio < 1) {
          // Image is taller than wide
          drawWidth = avatarSize * aspectRatio;
          drawX = avatarX + (avatarSize - drawWidth) / 2;
        }
        
        ctx.drawImage(avatarImg, drawX, drawY, drawWidth, drawHeight);
        ctx.restore();
        
        // Add subtle border for better definition
        ctx.strokeStyle = settings.theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(avatarX + avatarSize/2, currentY + 30, avatarSize/2, 0, 2 * Math.PI);
        ctx.stroke();
      } else {
        // Enhanced fallback avatar with gradient
        const gradient = ctx.createRadialGradient(
          avatarX + avatarSize/2, currentY + 30, 0,
          avatarX + avatarSize/2, currentY + 30, avatarSize/2
        );
        gradient.addColorStop(0, character.color);
        gradient.addColorStop(1, adjustColorBrightness(character.color, -20));
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(avatarX + avatarSize/2, currentY + 30, avatarSize/2, 0, 2 * Math.PI);
        ctx.fill();
        
        // Character initial with better typography
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold 24px ${settings.fontFamily === 'handwriting' ? 'cursive' : settings.fontFamily === 'typewriter' ? 'monospace' : 'system-ui'}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          character.name.charAt(0).toUpperCase(),
          avatarX + avatarSize/2,
          currentY + 30
        );
      }

      // Character name
      ctx.shadowBlur = 0;
      ctx.fillStyle = settings.theme === 'dark' ? '#ffffff' : '#000000';
      ctx.font = `18px ${settings.fontFamily === 'handwriting' ? 'cursive' : settings.fontFamily === 'typewriter' ? 'monospace' : 'system-ui'}`;
      ctx.textAlign = isEven ? 'left' : 'right';
      ctx.fillText(
        character.name,
        isEven ? messageX : messageX + messageMaxWidth,
        currentY + 15
      );

      // Message bubble
      const bubbleHeight = message.imageUrl ? 200 : 80;
      const bubbleRadius = 20;
      
      // Use custom colors if set
      let bubbleColor;
      if (isEven) {
        bubbleColor = settings.senderBubbleColor || '#007AFF';
      } else {
        bubbleColor = settings.receiverBubbleColor || (settings.theme === 'dark' ? '#3a3a3a' : '#e5e5ea');
      }
      
      ctx.fillStyle = bubbleColor;
      
      // Draw rounded rectangle
      ctx.beginPath();
      ctx.roundRect(messageX, currentY + 25, messageMaxWidth, bubbleHeight, bubbleRadius);
      ctx.fill();

      // Message content
      if (message.imageUrl && loadedAssets[`message_${message.id}`]) {
        // Draw image message
        const img = loadedAssets[`message_${message.id}`];
        const imgWidth = messageMaxWidth - 20;
        const imgHeight = 160;
        ctx.drawImage(img, messageX + 10, currentY + 35, imgWidth, imgHeight);
        
        // Add text below image if any
        if (message.text) {
          ctx.fillStyle = isEven ? '#ffffff' : (settings.theme === 'dark' ? '#ffffff' : '#000000');
          ctx.font = `16px ${settings.fontFamily === 'handwriting' ? 'cursive' : settings.fontFamily === 'typewriter' ? 'monospace' : 'system-ui'}`;
          ctx.textAlign = 'left';
          ctx.fillText(message.text, messageX + 20, currentY + 215);
        }
      } else {
        // Draw text message
        ctx.fillStyle = isEven ? '#ffffff' : (settings.theme === 'dark' ? '#ffffff' : '#000000');
        ctx.font = `20px ${settings.fontFamily === 'handwriting' ? 'cursive' : settings.fontFamily === 'typewriter' ? 'monospace' : 'system-ui'}`;
        ctx.textAlign = 'left';
        
        // Enhanced text rendering with proper emoji integration - inspired by Python Pilmoji
        const renderText = (text: string, x: number, y: number, maxWidth: number) => {
          // Enhanced emoji detection covering all Unicode emoji ranges
          const emojiRegex = /([\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA70}-\u{1FAFF}]|[\u{1F004}]|[\u{1F0CF}]|[\u{1F18E}]|[\u{3030}]|[\u{2B50}]|[\u{2B55}]|[\u{2934}-\u{2935}]|[\u{2B05}-\u{2B07}]|[\u{2B1B}-\u{2B1C}]|[\u{3297}]|[\u{3299}]|[\u{303D}]|[\u{00A9}]|[\u{00AE}]|[\u{2122}]|[\u{23F3}]|[\u{24C2}]|[\u{23E9}-\u{23EF}]|[\u{25B6}]|[\u{23F8}-\u{23FA}])/gu;
          
          const lines: string[] = [];
          let currentLine = '';
          
          // Split text into words for better line wrapping
          const words = text.split(' ');
          
          words.forEach((word, wordIndex) => {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            const metrics = ctx.measureText(testLine);
            
            if (metrics.width > maxWidth && currentLine) {
              lines.push(currentLine);
              currentLine = word;
            } else {
              currentLine = testLine;
            }
          });
          
          if (currentLine) {
            lines.push(currentLine);
          }

          // Render each line with enhanced emoji handling
          lines.forEach((line, lineIndex) => {
            const lineY = y + (lineIndex * 28); // Increased line spacing for better readability
            
            // Split line into text and emoji segments
            const segments = line.split(emojiRegex);
            const matches = [...line.matchAll(emojiRegex)];
            
            let currentX = x;
            let segmentIndex = 0;
            let matchIndex = 0;
            
            segments.forEach((segment, i) => {
              if (segment) {
                // Regular text
                ctx.fillText(segment, currentX, lineY);
                currentX += ctx.measureText(segment).width;
              }
              
              // Add emoji if there's a match at this position
              if (matchIndex < matches.length) {
                const emoji = matches[matchIndex][0];
                // Enhanced emoji rendering with proper sizing and positioning
                const originalFont = ctx.font;
                ctx.font = `22px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", system-ui`;
                ctx.fillText(emoji, currentX, lineY);
                currentX += ctx.measureText(emoji).width;
                ctx.font = originalFont;
                matchIndex++;
              }
            });
          });
        };

        renderText(message.text, messageX + 20, currentY + 55, messageMaxWidth - 40);
      }

      // V6.0 Enhanced Reaction Overlay - draws on the message bubble corner
      if (message.reaction) {
        const reactionSize = 28;
        const reactionX = isEven ? messageX + messageMaxWidth - reactionSize - 5 : messageX + 5;
        const reactionY = currentY + bubbleHeight - reactionSize - 5;
        
        // Draw reaction background circle
        ctx.fillStyle = settings.theme === 'dark' ? 'rgba(42, 42, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)';
        ctx.beginPath();
        ctx.arc(reactionX + reactionSize/2, reactionY + reactionSize/2, reactionSize/2, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw border
        ctx.strokeStyle = settings.theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Draw reaction emoji
        ctx.font = '18px system-ui';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = settings.theme === 'dark' ? '#ffffff' : '#000000';
        ctx.fillText(message.reaction, reactionX + reactionSize/2, reactionY + reactionSize/2);
      }

      // Draw timestamp if enabled
      if (message.showTimestamp) {
        ctx.fillStyle = '#888888';
        ctx.font = '14px system-ui';
        ctx.textAlign = isEven ? 'left' : 'right';
        const time = new Date(message.timestamp * 1000).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        ctx.fillText(
          time,
          isEven ? messageX : messageX + messageMaxWidth,
          currentY + bubbleHeight + 45
        );
      }

      ctx.shadowBlur = 0;
      currentY += bubbleHeight + messageSpacing;
    });

    // V6.0 Enhanced 3D Typing Indicator
    if (frame.isTyping && frame.typingCharacterId) {
      const character = getCharacterById(frame.typingCharacterId);
      if (character) {
        const typingX = 80;
        const typingY = currentY;
        const bubbleWidth = 120;
        const bubbleHeight = 50;
        
        // Enhanced typing bubble with gradient
        const gradient = ctx.createLinearGradient(typingX, typingY, typingX, typingY + bubbleHeight);
        gradient.addColorStop(0, settings.theme === 'dark' ? 'rgba(60, 60, 60, 0.95)' : 'rgba(230, 230, 230, 0.95)');
        gradient.addColorStop(1, settings.theme === 'dark' ? 'rgba(40, 40, 40, 0.95)' : 'rgba(200, 200, 200, 0.95)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(typingX, typingY, bubbleWidth, bubbleHeight, 25);
        ctx.fill();
        
        // Enhanced border with glow
        ctx.strokeStyle = settings.theme === 'dark' ? 'rgba(100, 100, 100, 0.3)' : 'rgba(150, 150, 150, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // V6.0 3D Animated Dots with enhanced visual effects
        const dotSize = 6;
        const dotSpacing = 12;
        const dotsStartX = typingX + (bubbleWidth - (dotSpacing * 2)) / 2;
        const dotsY = typingY + bubbleHeight / 2;
        const time = Date.now() / 300; // Animation timing
        
        for (let i = 0; i < 3; i++) {
          const dotX = dotsStartX + (i * dotSpacing);
          const animationPhase = time + i * 0.5;
          const bounce = Math.abs(Math.sin(animationPhase)) * 4;
          const scale = 1 + Math.abs(Math.sin(animationPhase)) * 0.3;
          const glow = Math.abs(Math.sin(animationPhase)) * 0.5;
          
          // Create 3D effect with multiple layers
          const baseColor = settings.theme === 'dark' ? '#007AFF' : '#007AFF';
          const glowColor = settings.theme === 'dark' ? 'rgba(0, 122, 255, 0.6)' : 'rgba(0, 122, 255, 0.4)';
          
          // Glow layer
          ctx.fillStyle = glowColor;
          ctx.beginPath();
          ctx.arc(dotX, dotsY - bounce, (dotSize + 2) * scale, 0, 2 * Math.PI);
          ctx.fill();
          
          // Main dot with gradient for 3D effect
          const dotGradient = ctx.createRadialGradient(
            dotX - dotSize/3, dotsY - bounce - dotSize/3, 0,
            dotX, dotsY - bounce, dotSize * scale
          );
          dotGradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
          dotGradient.addColorStop(0.7, baseColor);
          dotGradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
          
          ctx.fillStyle = dotGradient;
          ctx.beginPath();
          ctx.arc(dotX, dotsY - bounce, dotSize * scale, 0, 2 * Math.PI);
          ctx.fill();
        }
        
        // Character name
        ctx.fillStyle = settings.theme === 'dark' ? '#ffffff' : '#000000';
        ctx.font = '12px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(`${character.name} is typing...`, typingX + bubbleWidth/2, typingY + bubbleHeight + 15);
      }
    }

    // Draw watermark if present
    if (loadedAssets['watermark']) {
      const watermarkSize = 80;
      let watermarkX, watermarkY;
      
      switch (settings.watermarkPosition) {
        case 'top-left':
          watermarkX = 20;
          watermarkY = 20;
          break;
        case 'top-right':
          watermarkX = width - watermarkSize - 20;
          watermarkY = 20;
          break;
        case 'bottom-left':
          watermarkX = 20;
          watermarkY = height - watermarkSize - 20;
          break;
        case 'bottom-right':
        default:
          watermarkX = width - watermarkSize - 20;
          watermarkY = height - watermarkSize - 20;
          break;
      }
      
      ctx.globalAlpha = 0.7;
      ctx.drawImage(loadedAssets['watermark'], watermarkX, watermarkY, watermarkSize, watermarkSize);
      ctx.globalAlpha = 1.0;
    }

    ctx.restore();
  };

  // V6.0 Enhanced Sound Effects with improved stability
  const playSoundEffect = (effect: string) => {
    if (!audioContextRef.current) return;
    
    try {
      // Create enhanced sound synthesis for different effects
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      // Configure different sound effects
      switch (effect) {
        case 'ping':
          oscillator.frequency.setValueAtTime(800, ctx.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
          gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
          break;
        case 'swoosh':
          oscillator.frequency.setValueAtTime(200, ctx.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.15);
          gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
          break;
        case 'error':
          oscillator.frequency.setValueAtTime(300, ctx.currentTime);
          oscillator.frequency.setValueAtTime(200, ctx.currentTime + 0.1);
          gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
          break;
        case 'gasp':
          oscillator.frequency.setValueAtTime(1000, ctx.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.05);
          oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.2);
          gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
          break;
        default:
          return;
      }
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    } catch (error) {
      console.warn('Sound effect failed:', error);
    }
  };

  const startAnimation = async () => {
    try {
      const assets = await preloadAssets();
      setLoadedAssets(assets);
      
      const frames = generateFrames();
      setAnimationFrames(frames);
      setCurrentFrame(0);
      setIsPlaying(true);

      let frameIndex = 0;
      const fps = 30;
      const frameDuration = 1000 / fps;

      const animate = () => {
        if (frameIndex < frames.length) {
          const frame = frames[frameIndex];
          
          // V6.0 Enhanced Zoom effects with improved stability
          let scale = 1;
          let offsetX = 0;
          let offsetY = 0;
          
          if (frame.zoomTarget) {
            scale = 1.4; // Slightly reduced for better stability
            offsetX = -150; // Adjusted for better framing
            offsetY = -200;
          }
          
          drawFrame(frame, scale, offsetX, offsetY);
          setCurrentFrame(frameIndex);
          
          // V6.0 Enhanced Sound effects with improved stability
          if (frameIndex > 0) {
            const prevFrame = frames[frameIndex - 1];
            const currentMessages = frame.messages;
            const prevMessages = prevFrame.messages;
            
            // Find new messages and play their sound effects
            currentMessages.forEach(msg => {
              if (!prevMessages.find(pm => pm.id === msg.id) && msg.soundEffect && msg.soundEffect !== 'none') {
                playSoundEffect(msg.soundEffect);
              }
            });
          }
          
          frameIndex++;
          animationRef.current = setTimeout(animate, frameDuration);
        } else {
          setIsPlaying(false);
        }
      };

      animate();
    } catch (error) {
      console.error('Animation failed:', error);
      toast.error('Failed to start animation');
      setIsPlaying(false);
    }
  };

  const generateVideo = async () => {
    if (characters.length === 0) {
      toast.error('Add characters first');
      return;
    }

    if (messages.length === 0) {
      toast.error('Add messages to your script');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // Preload all assets first
      toast.info('Loading assets...');
      const assets = await preloadAssets();
      setLoadedAssets(assets);
      
      const canvas = canvasRef.current;
      if (!canvas) throw new Error('Canvas not found');

      // Setup recording
      const stream = canvas.captureStream(30);
      const options = { 
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: settings.resolution === '1080p' ? 5000000 : 2500000
      };
      
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'video/webm';
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
        setIsGenerating(false);
        toast.success('Video generated successfully!');
      };

      // Start recording
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;

      // Generate frames and animate
      toast.info('Generating video frames...');
      const frames = generateFrames();
      
      const speedMultiplier = settings.animationSpeed === 'fast' ? 0.5 : 
                             settings.animationSpeed === 'slow' ? 2 : 1;
      
      for (let i = 0; i < frames.length; i++) {
        const frame = frames[i];
        
        // V6.0 Enhanced Zoom effects with improved stability
        let scale = 1;
        let offsetX = 0;
        let offsetY = 0;
        
        if (frame.zoomTarget) {
          scale = 1.4; // Consistent with preview
          offsetX = -150;
          offsetY = -200;
        }
        
        drawFrame(frame, scale, offsetX, offsetY);
        setGenerationProgress((i / frames.length) * 100);
        
        // Wait for frame duration based on animation speed
        const frameDelay = (frame.time - (frames[i-1]?.time || 0)) * 1000 * speedMultiplier;
        await new Promise(resolve => setTimeout(resolve, Math.max(100, frameDelay)));
      }

      // Stop recording
      mediaRecorder.stop();

    } catch (error) {
      console.error('Video generation failed:', error);
      toast.error('Failed to generate video. Please check your assets and try again.');
      setIsGenerating(false);
    }
  };

  const downloadVideo = () => {
    if (videoUrl) {
      const a = document.createElement('a');
      a.href = videoUrl;
      a.download = `chat-story-${settings.resolution}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success('Video download started');
    }
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, []);

  const totalMessages = messages.length;
  const totalDuration = messages.reduce((acc, msg) => acc + (msg.delay || 1), 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-glow">Generate Video - V6.0</h2>
        <p className="text-muted-foreground mt-1">Create your cinematic chat story video with bulletproof stability</p>
      </div>

      {/* Video Stats */}
      <Card className="card-glow p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary">{characters.length}</div>
            <div className="text-sm text-muted-foreground">Characters</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">{totalMessages}</div>
            <div className="text-sm text-muted-foreground">Messages</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">{totalDuration.toFixed(1)}s</div>
            <div className="text-sm text-muted-foreground">Duration</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">{settings.resolution}</div>
            <div className="text-sm text-muted-foreground">Quality</div>
          </div>
        </div>
      </Card>

      {/* Canvas Preview */}
      <Card className="card-glow p-6">
        <div className="flex items-center gap-3 mb-4">
          <Video className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Video Preview</h3>
          <Volume2 className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">V6.0 Professional Effects</span>
          <span className="text-xs bg-gradient-to-r from-green-500/20 to-blue-500/20 text-green-400 px-2 py-1 rounded">Stable</span>
        </div>
        
        <div className="flex flex-col items-center space-y-4">
          <canvas
            ref={canvasRef}
            className="border border-border rounded-lg max-w-full h-auto"
            style={{ maxHeight: '400px', aspectRatio: settings.resolution === '1080p' ? '9/16' : '16/9' }}
          />
          
          <div className="flex gap-2">
            <Button 
              onClick={startAnimation}
              disabled={isPlaying || totalMessages === 0}
              variant="outline"
            >
              <Play className="w-4 h-4 mr-2" />
              Preview Effects
            </Button>
            
            <Button
              onClick={generateVideo}
              disabled={isGenerating || totalMessages === 0}
              className="btn-glow"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Video className="w-4 h-4 mr-2" />
                  Generate V6.0 Video
                </>
              )}
            </Button>
          </div>

          {isGenerating && (
            <div className="w-full max-w-md">
              <Progress value={generationProgress} className="w-full" />
              <p className="text-center text-sm text-muted-foreground mt-2">
                {generationProgress.toFixed(0)}% complete - V6.0 cinematic rendering in progress
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Generated Video */}
      {videoUrl && (
        <Card className="card-glow p-6">
          <div className="flex items-center gap-3 mb-4">
            <Download className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Generated Video - V6.0</h3>
          </div>
          
          <div className="space-y-4">
            <video
              src={videoUrl}
              controls
              className="w-full max-w-sm mx-auto rounded-lg"
              style={{ aspectRatio: settings.resolution === '1080p' ? '9/16' : '16/9' }}
            >
              Your browser does not support the video tag.
            </video>
            
            <div className="text-center">
              <Button onClick={downloadVideo} className="btn-glow">
                <Download className="w-4 h-4 mr-2" />
                Download V6.0 Video
              </Button>
            </div>
          </div>
        </Card>
      )}

      {totalMessages === 0 && (
        <Card className="card-glow p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Video className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Ready for V6.0 Generation</h3>
          <p className="text-muted-foreground">
            Complete the previous steps to generate your bulletproof, cinematic chat story video
          </p>
        </Card>
      )}
    </div>
  );
};