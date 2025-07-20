import React, { useState } from 'react';
import { Upload, Palette, Music, Settings, Monitor, Crown, Download, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProjectStore } from '@/stores/projectStore';
import { musicTracks } from '@/data/musicTracks';
import { toast } from 'sonner';

export const VideoCustomizerV2: React.FC = () => {
  const { settings, updateSettings, markStepCompleted, saveProjectToFile, loadProjectFromFile } = useProjectStore();
  const [backgroundPreview, setBackgroundPreview] = useState<string>('');
  const [watermarkPreview, setWatermarkPreview] = useState<string>('');

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

  const handleWatermarkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setWatermarkPreview(result);
        updateSettings({ watermarkImage: result });
        toast.success('Watermark uploaded');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProjectFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await loadProjectFromFile(file);
        toast.success('Project loaded successfully!');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to load project');
      }
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

  const fonts = [
    { id: 'system', name: 'System Default', preview: 'The quick brown fox' },
    { id: 'handwriting', name: 'Handwriting', preview: 'The quick brown fox', style: 'font-serif italic' },
    { id: 'typewriter', name: 'Typewriter', preview: 'The quick brown fox', style: 'font-mono' },
    { id: 'modern', name: 'Modern Sans', preview: 'The quick brown fox', style: 'font-sans font-light' },
  ];

  const colorPresets = [
    { name: 'Classic Blue', sender: '#007AFF', receiver: '#E5E5EA' },
    { name: 'WhatsApp', sender: '#DCF8C6', receiver: '#FFFFFF' },
    { name: 'Discord', sender: '#5865F2', receiver: '#36393F' },
    { name: 'Telegram', sender: '#4FC3F7', receiver: '#FFFFFF' },
    { name: 'Signal', sender: '#2192F3', receiver: '#F5F5F5' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-glow">Customize Video V2.0</h2>
          <p className="text-muted-foreground mt-1">Advanced personalization and professional features</p>
        </div>
        
        {/* Project Actions */}
        <div className="flex gap-2">
          <Button 
            onClick={saveProjectToFile}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Project
          </Button>
          
          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={handleProjectFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <Button variant="outline" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Load Project
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="appearance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
          {/* Theme Selection */}
          <Card className="card-glow p-6">
            <div className="flex items-center gap-3 mb-4">
              <Palette className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Chat Theme & Font</h3>
            </div>
            
            <div className="space-y-6">
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

              {/* Font Selection */}
              <div className="space-y-3">
                <Label>Font Family</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {fonts.map(font => (
                    <div
                      key={font.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:scale-105 ${
                        settings.fontFamily === font.id ? 'border-primary bg-primary/10' : 'border-border'
                      }`}
                      onClick={() => updateSettings({ fontFamily: font.id as any })}
                    >
                      <div className="font-semibold text-sm mb-1">{font.name}</div>
                      <div className={`text-sm text-muted-foreground ${font.style || ''}`}>
                        {font.preview}
                      </div>
                      {settings.fontFamily === font.id && (
                        <div className="mt-2 text-xs text-primary font-medium">✓ Selected</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Animation Speed */}
              <div className="space-y-3">
                <Label>Animation Speed</Label>
                <div className="grid grid-cols-3 gap-3">
                  {(['slow', 'normal', 'fast'] as const).map(speed => (
                    <Button
                      key={speed}
                      variant={settings.animationSpeed === speed ? "default" : "outline"}
                      onClick={() => updateSettings({ animationSpeed: speed })}
                      className="capitalize"
                    >
                      {speed}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Colors Tab */}
        <TabsContent value="colors" className="space-y-6">
          <Card className="card-glow p-6">
            <div className="flex items-center gap-3 mb-4">
              <Palette className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Color Customization</h3>
            </div>

            <div className="space-y-6">
              {/* Color Presets */}
              <div className="space-y-3">
                <Label>Quick Presets</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {colorPresets.map(preset => (
                    <div
                      key={preset.name}
                      className="p-3 rounded-lg border cursor-pointer hover:border-primary transition-colors"
                      onClick={() => {
                        updateSettings({
                          senderBubbleColor: preset.sender,
                          receiverBubbleColor: preset.receiver,
                        });
                        toast.success(`Applied ${preset.name} colors`);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                          <div 
                            className="w-6 h-6 rounded-full border"
                            style={{ backgroundColor: preset.sender }}
                          />
                          <div 
                            className="w-6 h-6 rounded-full border"
                            style={{ backgroundColor: preset.receiver }}
                          />
                        </div>
                        <span className="text-sm font-medium">{preset.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Colors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label>Sender Bubble Color</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={settings.senderBubbleColor || '#007AFF'}
                      onChange={(e) => updateSettings({ senderBubbleColor: e.target.value })}
                      className="w-12 h-10 rounded border border-border cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.senderBubbleColor || '#007AFF'}
                      onChange={(e) => updateSettings({ senderBubbleColor: e.target.value })}
                      className="flex-1 px-3 py-2 rounded border border-border bg-background"
                      placeholder="#007AFF"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Receiver Bubble Color</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={settings.receiverBubbleColor || '#E5E5EA'}
                      onChange={(e) => updateSettings({ receiverBubbleColor: e.target.value })}
                      className="w-12 h-10 rounded border border-border cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.receiverBubbleColor || '#E5E5EA'}
                      onChange={(e) => updateSettings({ receiverBubbleColor: e.target.value })}
                      className="flex-1 px-3 py-2 rounded border border-border bg-background"
                      placeholder="#E5E5EA"
                    />
                  </div>
                </div>
              </div>

              {/* Background Color */}
              <div className="space-y-3">
                <Label>Chat Background Color (alternative to image)</Label>
                <div className="flex gap-2 max-w-md">
                  <input
                    type="color"
                    value={settings.chatBackgroundColor || '#FFFFFF'}
                    onChange={(e) => updateSettings({ chatBackgroundColor: e.target.value })}
                    className="w-12 h-10 rounded border border-border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.chatBackgroundColor || '#FFFFFF'}
                    onChange={(e) => updateSettings({ chatBackgroundColor: e.target.value })}
                    className="flex-1 px-3 py-2 rounded border border-border bg-background"
                    placeholder="#FFFFFF"
                  />
                  <Button
                    variant="outline"
                    onClick={() => updateSettings({ chatBackgroundColor: undefined })}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Media Tab */}
        <TabsContent value="media" className="space-y-6">
          {/* Background Image */}
          <Card className="card-glow p-6">
            <div className="flex items-center gap-3 mb-4">
              <Upload className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Background & Watermark</h3>
            </div>
            
            <div className="space-y-6">
              {/* Background */}
              <div className="space-y-3">
                <Label>Background Image</Label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBackgroundUpload}
                  className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
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

              {/* Watermark */}
              <div className="space-y-3">
                <Label>Watermark/Logo</Label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleWatermarkUpload}
                  className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
                
                {/* Watermark Position */}
                {(watermarkPreview || settings.watermarkImage) && (
                  <div className="space-y-3">
                    <Label>Watermark Position</Label>
                    <Select
                      value={settings.watermarkPosition}
                      onValueChange={(value) => updateSettings({ watermarkPosition: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="top-left">Top Left</SelectItem>
                        <SelectItem value="top-right">Top Right</SelectItem>
                        <SelectItem value="bottom-left">Bottom Left</SelectItem>
                        <SelectItem value="bottom-right">Bottom Right</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {(watermarkPreview || settings.watermarkImage) && (
                  <div className="relative inline-block">
                    <img
                      src={watermarkPreview || settings.watermarkImage}
                      alt="Watermark preview"
                      className="w-24 h-24 object-cover rounded-lg border bg-checkered"
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        setWatermarkPreview('');
                        updateSettings({ watermarkImage: undefined });
                        toast.success('Watermark removed');
                      }}
                      className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                    >
                      ×
                    </Button>
                  </div>
                )}
              </div>
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
        </TabsContent>

        {/* Export Tab */}
        <TabsContent value="export" className="space-y-6">
          <Card className="card-glow p-6">
            <div className="flex items-center gap-3 mb-4">
              <Monitor className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Export Settings</h3>
            </div>

            <div className="space-y-6">
              {/* Resolution */}
              <div className="space-y-3">
                <Label>Video Resolution</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={settings.resolution === '720p' ? "default" : "outline"}
                    onClick={() => updateSettings({ resolution: '720p' })}
                  >
                    720p (HD)
                  </Button>
                  <Button
                    variant={settings.resolution === '1080p' ? "default" : "outline"}
                    onClick={() => updateSettings({ resolution: '1080p' })}
                    className="flex items-center gap-2"
                  >
                    <Crown className="w-4 h-4" />
                    1080p (Full HD)
                  </Button>
                </div>
              </div>

              {/* Typing Speed */}
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
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Video Settings Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Theme:</span>
                  <span className="capitalize">{settings.theme}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Font:</span>
                  <span className="capitalize">{settings.fontFamily}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Animation:</span>
                  <span className="capitalize">{settings.animationSpeed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Resolution:</span>
                  <span>{settings.resolution}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Background:</span>
                  <span>{settings.backgroundImage ? 'Custom image' : settings.chatBackgroundColor ? 'Custom color' : 'Default'}</span>
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
                  <span className="text-muted-foreground">Watermark:</span>
                  <span>{settings.watermarkImage ? `Yes (${settings.watermarkPosition})` : 'None'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Typing Speed:</span>
                  <span>{settings.messageSpeed}ms/char</span>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};