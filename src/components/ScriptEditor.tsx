import React, { useState } from 'react';
import { Plus, Trash2, GripVertical, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useProjectStore } from '@/stores/projectStore';
import { Message } from '@/types';
import { toast } from 'sonner';

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

  const handleAddMessage = () => {
    if (!selectedCharacterId) {
      toast.error('Please select a character');
      return;
    }
    
    if (!messageText.trim()) {
      toast.error('Message cannot be empty');
      return;
    }

    addMessage({
      characterId: selectedCharacterId,
      text: messageText.trim(),
      delay: parseFloat(messageDelay) || 1,
    });

    setMessageText('');
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

      {/* Message Input */}
      <Card className="card-glow p-4">
        <div className="space-y-4">
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
            
            <div className="md:flex md:items-end">
              <Button 
                onClick={handleAddMessage}
                disabled={!selectedCharacterId || !messageText.trim()}
                className="w-full btn-glow"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Message
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Message</Label>
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
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">{character.name}</span>
                        <span className="text-xs text-muted-foreground">
                          +{message.delay}s
                        </span>
                      </div>
                      <div className="message-received p-3 max-w-sm">
                        {message.text}
                      </div>
                    </div>
                    
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteMessage(message.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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
    </div>
  );
};