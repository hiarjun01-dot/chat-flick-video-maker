import React, { useState, useRef, useEffect } from 'react';
import { Play, Download, Loader2, Video } from 'lucide-react';
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
  }>;
  time: number;
}

export const VideoGenerator: React.FC = () => {
  const { characters, messages, settings } = useProjectStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationFrames, setAnimationFrames] = useState<AnimationFrame[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const animationRef = useRef<NodeJS.Timeout>();

  const getCharacterById = (id: string) => {
    return characters.find(char => char.id === id);
  };

  // Generate animation frames
  const generateFrames = (): AnimationFrame[] => {
    const frames: AnimationFrame[] = [];
    let currentTime = 0;
    let visibleMessages: any[] = [];

    // Add initial empty frame
    frames.push({ messages: [], time: 0 });

    messages.forEach((message, index) => {
      currentTime += message.delay || 1;
      visibleMessages.push({
        id: message.id,
        characterId: message.characterId,
        text: message.text,
        timestamp: currentTime,
      });

      frames.push({
        messages: [...visibleMessages],
        time: currentTime,
      });
    });

    return frames;
  };

  // Draw chat interface on canvas
  const drawFrame = (frame: AnimationFrame) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 1080;
    canvas.height = 1920;

    // Clear canvas
    ctx.fillStyle = settings.theme === 'dark' ? '#1a1a1a' : '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw background image if set
    if (settings.backgroundImage) {
      const img = new Image();
      img.onload = () => {
        ctx.globalAlpha = 0.3;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1.0;
      };
      img.src = settings.backgroundImage;
    }

    // Draw chat header
    const headerHeight = 120;
    ctx.fillStyle = settings.theme === 'dark' ? '#2a2a2a' : '#f5f5f5';
    ctx.fillRect(0, 0, canvas.width, headerHeight);

    // Header text
    ctx.fillStyle = settings.theme === 'dark' ? '#ffffff' : '#000000';
    ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Chat Story', canvas.width / 2, 70);

    // Draw messages
    const messageStartY = headerHeight + 40;
    let currentY = messageStartY;
    const messageSpacing = 80;
    const messageMaxWidth = canvas.width - 160;

    frame.messages.forEach((message, index) => {
      const character = getCharacterById(message.characterId);
      if (!character) return;

      const isEven = index % 2 === 0;
      const messageX = isEven ? 80 : canvas.width - messageMaxWidth - 80;

      // Draw avatar
      const avatarSize = 50;
      const avatarX = isEven ? messageX - 70 : messageX + messageMaxWidth + 20;
      
      ctx.fillStyle = character.color;
      ctx.beginPath();
      ctx.arc(avatarX + avatarSize/2, currentY + 30, avatarSize/2, 0, 2 * Math.PI);
      ctx.fill();

      // Character initial
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        character.name.charAt(0).toUpperCase(),
        avatarX + avatarSize/2,
        currentY + 40
      );

      // Character name
      ctx.fillStyle = settings.theme === 'dark' ? '#ffffff' : '#000000';
      ctx.font = '18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = isEven ? 'left' : 'right';
      ctx.fillText(
        character.name,
        isEven ? messageX : messageX + messageMaxWidth,
        currentY + 15
      );

      // Message bubble
      const bubbleHeight = 60;
      const bubbleRadius = 20;
      
      ctx.fillStyle = isEven ? '#007AFF' : (settings.theme === 'dark' ? '#3a3a3a' : '#e5e5ea');
      
      // Draw rounded rectangle
      ctx.beginPath();
      ctx.roundRect(messageX, currentY + 25, messageMaxWidth, bubbleHeight, bubbleRadius);
      ctx.fill();

      // Message text
      ctx.fillStyle = isEven ? '#ffffff' : (settings.theme === 'dark' ? '#ffffff' : '#000000');
      ctx.font = '20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'left';
      
      // Word wrap
      const words = message.text.split(' ');
      const lines: string[] = [];
      let currentLine = '';
      
      words.forEach(word => {
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > messageMaxWidth - 40) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      });
      if (currentLine) lines.push(currentLine);

      lines.forEach((line, lineIndex) => {
        ctx.fillText(line, messageX + 20, currentY + 50 + (lineIndex * 25));
      });

      currentY += bubbleHeight + messageSpacing;
    });
  };

  const startAnimation = async () => {
    const frames = generateFrames();
    setAnimationFrames(frames);
    setCurrentFrame(0);
    setIsPlaying(true);

    let frameIndex = 0;
    const fps = 30;
    const frameDuration = 1000 / fps;

    const animate = () => {
      if (frameIndex < frames.length) {
        drawFrame(frames[frameIndex]);
        setCurrentFrame(frameIndex);
        frameIndex++;
        animationRef.current = setTimeout(animate, frameDuration);
      } else {
        setIsPlaying(false);
      }
    };

    animate();
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
      const canvas = canvasRef.current;
      if (!canvas) throw new Error('Canvas not found');

      // Setup recording
      const stream = canvas.captureStream(30);
      const options = { mimeType: 'video/webm;codecs=vp9' };
      
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
      const frames = generateFrames();
      const totalDuration = frames[frames.length - 1]?.time || 10;
      
      for (let i = 0; i < frames.length; i++) {
        drawFrame(frames[i]);
        setGenerationProgress((i / frames.length) * 100);
        
        // Wait for frame duration
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Stop recording
      mediaRecorder.stop();

    } catch (error) {
      console.error('Video generation failed:', error);
      toast.error('Failed to generate video');
      setIsGenerating(false);
    }
  };

  const downloadVideo = () => {
    if (videoUrl) {
      const a = document.createElement('a');
      a.href = videoUrl;
      a.download = 'chat-story.webm';
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
        <h2 className="text-2xl font-bold text-glow">Generate Video</h2>
        <p className="text-muted-foreground mt-1">Create your chat story video</p>
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
            <div className="text-2xl font-bold text-primary">{settings.theme}</div>
            <div className="text-sm text-muted-foreground">Theme</div>
          </div>
        </div>
      </Card>

      {/* Canvas Preview */}
      <Card className="card-glow p-6">
        <div className="flex items-center gap-3 mb-4">
          <Video className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Video Preview</h3>
        </div>
        
        <div className="flex flex-col items-center space-y-4">
          <canvas
            ref={canvasRef}
            className="border border-border rounded-lg max-w-full h-auto"
            style={{ maxHeight: '400px', aspectRatio: '9/16' }}
          />
          
          <div className="flex gap-2">
            <Button 
              onClick={startAnimation}
              disabled={isPlaying || totalMessages === 0}
              variant="outline"
            >
              <Play className="w-4 h-4 mr-2" />
              Preview Animation
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
                  Generate Video
                </>
              )}
            </Button>
          </div>

          {isGenerating && (
            <div className="w-full max-w-md">
              <Progress value={generationProgress} className="w-full" />
              <p className="text-center text-sm text-muted-foreground mt-2">
                {generationProgress.toFixed(0)}% complete
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
            <h3 className="text-lg font-semibold">Generated Video</h3>
          </div>
          
          <div className="space-y-4">
            <video
              src={videoUrl}
              controls
              className="w-full max-w-sm mx-auto rounded-lg"
              style={{ aspectRatio: '9/16' }}
            >
              Your browser does not support the video tag.
            </video>
            
            <div className="text-center">
              <Button onClick={downloadVideo} className="btn-glow">
                <Download className="w-4 h-4 mr-2" />
                Download Video
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
          <h3 className="text-lg font-semibold mb-2">Ready to Generate</h3>
          <p className="text-muted-foreground">
            Complete the previous steps to generate your chat story video
          </p>
        </Card>
      )}
    </div>
  );
};