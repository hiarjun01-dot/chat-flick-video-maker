import React, { useState } from 'react';
import { Upload, Palette, Music, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useProjectStore } from '@/stores/projectStore';
import { musicTracks } from '@/data/musicTracks';
import { toast } from 'sonner';

export const VideoCustomizer: React.FC = () => {
  const { settings, updateSettings, markStepCompleted } = useProjectStore();
  const [backgroundPreview, setBackgroundPreview] = useState<string>('');

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setBackgroundPreview(result);
        updateSettings({ backgroundImage: result });
        toast.success('Background image uploaded');
        markStepCompleted('customize');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleThemeChange = (isDark: boolean) => {
    updateSettings({ theme: isDark ? 'dark' : 'light' });
    markStepCompleted('customize');
  };

  const handleMusicSelect = (trackId: string) => {
    updateSettings({ musicTrack: trackId });
    toast.success('Background music selected');
    markStepCompleted('customize');
  };

  const handleSpeedChange = (value: number[]) => {
    updateSettings({ messageSpeed: value[0] });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-glow">Customize Video</h2>
        <p className="text-muted-foreground mt-1">Personalize the look and feel of your video</p>
      </div>

      {/* Theme Selection */}
      <Card className="card-glow p-6">
        <div className="flex items-center gap-3 mb-4">
          <Palette className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Chat Theme</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="theme-toggle" className="text-base">Dark Theme</Label>
              <p className="text-sm text-muted-foreground">
                Switch between light and dark chat interface
              </p>
            </div>
            <Switch
              id="theme-toggle"
              checked={settings.theme === 'dark'}
              onCheckedChange={handleThemeChange}
            />
          </div>
          
          {/* Theme Preview */}
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg border-2 transition-all ${
              settings.theme === 'light' ? 'border-primary' : 'border-border'
            }`}>
              <div className="bg-white text-black p-3 rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium">Alex</span>
                </div>
                <div className="bg-blue-500 text-white p-2 rounded-lg rounded-br-sm text-sm max-w-40">
                  Hey there! How's it going?
                </div>
              </div>
              <p className="text-center text-sm mt-2 text-muted-foreground">Light</p>
            </div>
            
            <div className={`p-4 rounded-lg border-2 transition-all ${
              settings.theme === 'dark' ? 'border-primary' : 'border-border'
            }`}>
              <div className="bg-gray-900 text-white p-3 rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium">Alex</span>
                </div>
                <div className="bg-blue-600 text-white p-2 rounded-lg rounded-br-sm text-sm max-w-40">
                  Hey there! How's it going?
                </div>
              </div>
              <p className="text-center text-sm mt-2 text-muted-foreground">Dark</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Background Image */}
      <Card className="card-glow p-6">
        <div className="flex items-center gap-3 mb-4">
          <Upload className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Background Image</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="background-upload" className="text-base">Upload Background</Label>
            <p className="text-sm text-muted-foreground mb-3">
              Add a custom background image for your video (optional)
            </p>
            <input
              id="background-upload"
              type="file"
              accept="image/*"
              onChange={handleBackgroundUpload}
              className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
          </div>
          
          {(backgroundPreview || settings.backgroundImage) && (
            <div className="relative">
              <img
                src={backgroundPreview || settings.backgroundImage}
                alt="Background preview"
                className="w-full h-32 object-cover rounded-lg"
              />
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  setBackgroundPreview('');
                  updateSettings({ backgroundImage: undefined });
                  toast.success('Background removed');
                }}
                className="absolute top-2 right-2"
              >
                Remove
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Background Music */}
      <Card className="card-glow p-6">
        <div className="flex items-center gap-3 mb-4">
          <Music className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Background Music</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {musicTracks.map(track => (
            <div
              key={track.id}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:scale-105 ${
                settings.musicTrack === track.id ? 'border-primary bg-primary/10' : 'border-border'
              }`}
              onClick={() => handleMusicSelect(track.id)}
            >
              <img
                src={track.thumbnail}
                alt={track.name}
                className="w-full h-24 object-cover rounded-lg mb-3"
              />
              <h4 className="font-semibold text-sm">{track.name}</h4>
              <p className="text-xs text-muted-foreground">{track.description}</p>
              {settings.musicTrack === track.id && (
                <div className="mt-2 text-xs text-primary font-medium">✓ Selected</div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Animation Settings */}
      <Card className="card-glow p-6">
        <div className="flex items-center gap-3 mb-4">
          <Settings className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Animation Settings</h3>
        </div>
        
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-base">Typing Speed</Label>
              <span className="text-sm text-muted-foreground">
                {settings.messageSpeed}ms per character
              </span>
            </div>
            <Slider
              value={[settings.messageSpeed]}
              onValueChange={handleSpeedChange}
              max={200}
              min={10}
              step={10}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Fast</span>
              <span>Slow</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Summary */}
      <Card className="card-glow p-6 bg-primary/5">
        <h3 className="text-lg font-semibold mb-3">Video Settings Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Theme:</span>
            <span className="capitalize">{settings.theme}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Background:</span>
            <span>{settings.backgroundImage ? 'Custom image' : 'Default'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Music:</span>
            <span>
              {settings.musicTrack 
                ? musicTracks.find(t => t.id === settings.musicTrack)?.name || 'Selected'
                : 'None'
              }
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Typing Speed:</span>
            <span>{settings.messageSpeed}ms/char</span>
          </div>
        </div>
      </Card>
    </div>
  );
};