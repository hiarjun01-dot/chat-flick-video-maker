import React, { useState } from 'react';
import { Plus, Trash2, GripVertical, Send, Image, Clock, Smile, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useProjectStore } from '@/stores/projectStore';
import { Message } from '@/types';
import { toast } from 'sonner';
import { V6TestScenario } from './V6TestScenario';

export const ScriptEditor: React.FC = () => {
  const {
    characters,
    messages,
    addMessage,
    updateMessage,
    deleteMessage,
    markStepCompleted
  } = useProjectStore();

  const [selectedCharacterId, setSelectedCharacterId] = useState<string>('');
  const [messageText, setMessageText] = useState('');
  const [messageDelay, setMessageDelay] = useState('1');
  const [typingDuration, setTypingDuration] = useState('2');
  const [messageType, setMessageType] = useState<'text' | 'image'>('text');
  const [selectedReaction, setSelectedReaction] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [showTimestamp, setShowTimestamp] = useState(false);
  // V3.1 Dynamic Effects
  const [soundEffect, setSoundEffect] = useState<'none' | 'ping' | 'swoosh' | 'error' | 'gasp'>('none');
  const [zoomIn, setZoomIn] = useState(false);
  const [spotlightMode, setSpotlightMode] = useState(false);

  const handleAddMessage = () => {
    if (!selectedCharacterId) {
      toast.error('Please select a character');
      return;
    }

    if (messageType === 'text' && !messageText.trim()) {
      toast.error('Message cannot be empty');
      return;
    }

    if (messageType === 'image' && !imageFile) {
      toast.error('Please select an image');
      return;
    }

    addMessage({
      characterId: selectedCharacterId,
      text: messageType === 'text' ? messageText.trim() : '📷 Image',
      delay: parseFloat(messageDelay) || 1,
      typingDuration: parseFloat(typingDuration) || 2,
      reaction: selectedReaction || undefined,
      imageUrl: imagePreview || undefined,
      showTimestamp,
      // V3.1 Dynamic Effects
      soundEffect: soundEffect !== 'none' ? soundEffect : undefined,
      zoomIn,
      spotlightMode,
    });

    // Reset form
    setMessageText('');
    setSelectedReaction('');
    setImageFile(null);
    setImagePreview('');
    setShowTimestamp(false);
    setMessageType('text');
    // Reset V3.1 effects
    setSoundEffect('none');
    setZoomIn(false);
    setSpotlightMode(false);
    toast.success('Message added to script');

    // Mark step as completed if we have messages
    if (messages.length >= 0) {
      markStepCompleted('script');
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    deleteMessage(messageId);
    toast.success('Message removed from script');
  };

  const getCharacterById = (id: string) => {
    return characters.find(char => char.id === id);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddMessage();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const reactions = ['❤️', '👍', '😂', '😮', '😢', '😡', '🔥', '✨'];

  const generateTimestamp = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (characters.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-glow">Script Editor</h2>
          <p className="text-muted-foreground mt-1">Create your chat conversation</p>
        </div>

        <Card className="card-glow p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Send className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Add Characters First</h3>
          <p className="text-muted-foreground">
            You need to create characters before you can write your script
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-glow">Script Editor</h2>
        <p className="text-muted-foreground mt-1">Create your chat conversation</p>
      </div>

      {/* Enhanced Message Input */}
      <Card className="card-glow p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <Send className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Add New Message</h3>
          </div>

          {/* Character and Basic Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Character</Label>
              <Select value={selectedCharacterId} onValueChange={setSelectedCharacterId}>
                <SelectTrigger className="bg-input">
                  <SelectValue placeholder="Select character..." />
                </SelectTrigger>
                <SelectContent>
                  {characters.map(character => (
                    <SelectItem key={character.id} value={character.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={character.avatar} />
                          <AvatarFallback style={{ backgroundColor: character.color }}>
                            {character.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {character.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Delay (seconds)</Label>
              <Input
                type="number"
                min="0"
                step="0.5"
                value={messageDelay}
                onChange={(e) => setMessageDelay(e.target.value)}
                className="bg-input"
                placeholder="1.0"
              />
            </div>

            <div className="space-y-2">
              <Label>Typing Duration (seconds)</Label>
              <Input
                type="number"
                min="0"
                step="0.5"
                value={typingDuration}
                onChange={(e) => setTypingDuration(e.target.value)}
                className="bg-input"
                placeholder="2.0"
              />
            </div>
          </div>

          {/* Message Type Tabs */}
          <Tabs value={messageType} onValueChange={(value) => setMessageType(value as 'text' | 'image')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="text" className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                Text Message
              </TabsTrigger>
              <TabsTrigger value="image" className="flex items-center gap-2">
                <Image className="w-4 h-4" />
                Image Message
              </TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="space-y-4">
              <div className="space-y-2">
                <Label>Message Text</Label>
                <div className="relative">
                  <Input
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message here..."
                    className="bg-input pr-10"
                    maxLength={500}
                  />
                  <Button
                    size="sm"
                    onClick={handleAddMessage}
                    disabled={!selectedCharacterId || !messageText.trim()}
                    className="absolute right-1 top-1 h-8 w-8 p-0"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Press Enter to add message</span>
                  <span>{messageText.length}/500</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="image" className="space-y-4">
              <div className="space-y-2">
                <Label>Upload Image</Label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
                {imagePreview && (
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview('');
                      }}
                      className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                    >
                      ×
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Advanced Options */}
          <div className="border-t pt-4">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="basic">
                <AccordionTrigger>
                  <h4 className="font-medium flex items-center gap-2">
                    <Smile className="w-4 h-4" />
                    Basic Options
                  </h4>
                </AccordionTrigger>
                <AccordionContent className="space-y-4">
                  {/* Reactions */}
                  <div className="space-y-2">
                    <Label>Add Reaction (optional)</Label>
                    <div className="flex flex-wrap gap-2">
                      {reactions.map(reaction => (
                        <Button
                          key={reaction}
                          size="sm"
                          variant={selectedReaction === reaction ? "default" : "outline"}
                          onClick={() => setSelectedReaction(selectedReaction === reaction ? '' : reaction)}
                          className="text-lg p-2 h-10 w-10"
                        >
                          {reaction}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Timestamp Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Show Timestamp
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Display message time ({generateTimestamp()})
                      </p>
                    </div>
                    <Switch
                      checked={showTimestamp}
                      onCheckedChange={setShowTimestamp}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* V3.1 Dynamic Effects */}
              <AccordionItem value="effects">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <span className="text-sm bg-gradient-primary text-primary-foreground px-2 py-1 rounded-md font-medium">
                      V3.1
                    </span>
                    Dynamic Effects
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Sound Effect */}
                  <div className="space-y-2">
                    <Label htmlFor="soundEffect">Sound Emphasis</Label>
                    <Select value={soundEffect} onValueChange={(value: any) => setSoundEffect(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sound effect..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Sound</SelectItem>
                        <SelectItem value="ping">Ping (Notification)</SelectItem>
                        <SelectItem value="swoosh">Swoosh (Sent Message)</SelectItem>
                        <SelectItem value="error">Alert Sound</SelectItem>
                        <SelectItem value="gasp">Gasp (Dramatic)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">✨ V6.0 - Enhanced audio emphasis</p>
                  </div>

                    {/* Zoom In Effect */}
                    <div className="space-y-2">
                      <Label>Visual Effects</Label>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="zoomIn"
                          checked={zoomIn}
                          onCheckedChange={(checked) => setZoomIn(checked === true)}
                        />
                        <Label htmlFor="zoomIn" className="text-sm">
                          Zoom-In Focus Effect
                        </Label>
                      </div>
                      <p className="text-xs text-muted-foreground">🎯 V6.0 - Enhanced zoom animation</p>
                    </div>

                    {/* Spotlight Mode */}
                    <div className="space-y-2">
                      <Label>Display Mode</Label>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="spotlightMode"
                          checked={spotlightMode}
                          onCheckedChange={(checked) => setSpotlightMode(checked === true)}
                        />
                        <Label htmlFor="spotlightMode" className="text-sm">
                          Display Alone (Spotlight)
                        </Label>
                      </div>
                      <p className="text-xs text-muted-foreground">✨ V6.0 - Enhanced spotlight mode</p>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground bg-gradient-to-r from-primary/10 to-primary-glow/10 p-3 rounded-md border border-primary/20">
                    <strong>V6.0 Dynamic Effects:</strong> Professional emphasis system with enhanced stability. Combine sound effects, zoom animations, and spotlight moments for cinematic storytelling. All features now work perfectly together!
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Add Message Button */}
          <Button
            onClick={handleAddMessage}
            disabled={!selectedCharacterId || (messageType === 'text' && !messageText.trim()) || (messageType === 'image' && !imageFile)}
            className="w-full btn-glow"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add {messageType === 'text' ? 'Text' : 'Image'} Message
          </Button>
        </div>
      </Card>

      {/* Messages List */}
      <div className="space-y-4">
        {messages.length === 0 ? (
          <Card className="card-glow p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Send className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Messages Yet</h3>
            <p className="text-muted-foreground">
              Start building your conversation by adding messages above
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <GripVertical className="w-5 h-5" />
              Chat Preview ({messages.length} messages)
            </h3>

            {messages.map((message, index) => {
              const character = getCharacterById(message.characterId);
              if (!character) return null;

              return (
                <Card key={message.id} className="card-glow p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={character.avatar} />
                      <AvatarFallback style={{ backgroundColor: character.color }}>
                        {character.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{character.name}</span>
                        {message.showTimestamp && (
                          <span className="text-xs text-muted-foreground">
                            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          Delay: +{message.delay}s
                        </span>
                        {message.typingDuration && (
                          <span className="text-xs text-muted-foreground">
                            Typing: {message.typingDuration}s
                          </span>
                        )}
                      </div>

                      {/* V6.0 Enhanced 3D Typing Indicator Preview */}
                      {message.typingDuration && message.typingDuration > 0 && (
                        <div className="message-received p-3 max-w-sm bg-muted/50 border-dashed border">
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <div className="typing-indicator-3d">
                              <div className="typing-dot-3d"></div>
                              <div className="typing-dot-3d"></div>
                              <div className="typing-dot-3d"></div>
                            </div>
                            <span className="font-medium">{character.name} is typing...</span>
                            <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">V6.0 3D</span>
                          </div>
                        </div>
                      )}

                      {/* V6.0 Enhanced Message Content with Reaction Overlay */}
                      <div className="relative">
                        <div className="message-received p-3 max-w-sm">
                          {message.imageUrl ? (
                            <div className="space-y-2">
                              <img
                                src={message.imageUrl}
                                alt="Message image"
                                className="w-full rounded-lg max-w-48"
                              />
                              <div className="text-sm">{message.text}</div>
                            </div>
                          ) : (
                            message.text
                          )}
                        </div>

                        {/* V6.0 Enhanced Reaction Overlay */}
                        {message.reaction && (
                          <div className="reaction-overlay bg-background/90 rounded-full p-1.5 border border-border shadow-lg">
                            {message.reaction}
                          </div>
                        )}
                      </div>

                      {/* V6.0 Enhanced Effect Indicators */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {message.soundEffect && message.soundEffect !== 'none' && (
                          <span className="bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-400 px-2 py-1 rounded text-xs font-medium">
                            🔊 {message.soundEffect}
                          </span>
                        )}
                        {message.zoomIn && (
                          <span className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-400 px-2 py-1 rounded text-xs font-medium">
                            🎯 Zoom Focus
                          </span>
                        )}
                        {message.spotlightMode && (
                          <span className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 text-purple-400 px-2 py-1 rounded text-xs font-medium">
                            ✨ Spotlight
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteMessage(message.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {messages.length > 0 && (
          <div className="text-center text-sm text-muted-foreground">
            Total conversation length: {messages.reduce((acc, msg) => acc + (msg.delay || 1), 0).toFixed(1)} seconds
          </div>
        )}
      </div>

      <V6TestScenario />
    </div>
  );
};
