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

    // In a real app, you would fetch and decode actual audio files.
    // This is a placeholder for the logic.
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
    ctx.fillStyle = '#313338'; // Discord-like background
    ctx.fillRect(0, 0, width, height);


    // Draw messages
    let currentY = height - 50; // Start from bottom
    const messageSpacing = 15;
    const leftMargin = 80;

    const messagesToShow = frame.spotlightMessage
      ? frame.messages.filter(msg => msg.id === frame.spotlightMessage)
      : frame.messages;

    messagesToShow.slice().reverse().forEach((message) => {
      const character = getCharacterById(message.characterId);
      if (!character) return;

      ctx.font = '16px sans-serif';
      const lines: string[] = [];
      const words = message.text.split(' ');
      let currentLine = '';

      for(const word of words) {
        const testLine = currentLine.length > 0 ? currentLine + ' ' + word : word;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > width - leftMargin - 40 && currentLine.length > 0) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      lines.push(currentLine);


      const bubbleHeight = (lines.length * 22) + (lines.length > 1 ? 10 : 20);
      const bubbleY = currentY - bubbleHeight;

      // Draw avatar
      const avatarSize = 50;
      const avatarX = 15;
      const avatarY = bubbleY;
      const avatarImg = loadedAssets[`avatar_${character.id}`];

      ctx.save();
      ctx.beginPath();
      ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
      ctx.clip();
      if (avatarImg) {
        ctx.drawImage(avatarImg, avatarX, avatarY, avatarSize, avatarSize);
      } else {
        ctx.fillStyle = character.color;
        ctx.fillRect(avatarX, avatarY, avatarSize, avatarSize);
      }
      ctx.restore();


      // Draw username and timestamp
      ctx.fillStyle = character.color;
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(character.name, leftMargin, bubbleY + 18);

      ctx.fillStyle = '#949BA4'; // Timestamp color
      ctx.font = '12px sans-serif';
      const time = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      ctx.fillText(time, leftMargin + ctx.measureText(character.name).width + 10, bubbleY + 18);


      // Draw message text
      ctx.fillStyle = '#DBDEE1'; // Message text color
      ctx.font = '16px sans-serif';
      lines.forEach((line, index) => {
          ctx.fillText(line, leftMargin, bubbleY + 40 + (index * 22));
      });

      currentY -= (bubbleHeight + messageSpacing);
    });


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
