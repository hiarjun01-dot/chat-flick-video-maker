import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useProjectStore } from '@/stores/projectStore';
import { Character } from '@/types';
import { toast } from 'sonner';

const CHARACTER_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
];

interface CharacterFormData {
  name: string;
  avatar: string;
  color: string;
}

export const CharacterManager: React.FC = () => {
  const { characters, addCharacter, updateCharacter, deleteCharacter, markStepCompleted } = useProjectStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [formData, setFormData] = useState<CharacterFormData>({
    name: '',
    avatar: '',
    color: CHARACTER_COLORS[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Character name is required');
      return;
    }

    if (editingCharacter) {
      updateCharacter(editingCharacter.id, formData);
      toast.success('Character updated successfully');
    } else {
      addCharacter(formData);
      toast.success('Character added successfully');
    }

    resetForm();
    setIsDialogOpen(false);
    
    // Mark step as completed if we have characters
    if (characters.length >= 0) {
      markStepCompleted('characters');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      avatar: '',
      color: CHARACTER_COLORS[0],
    });
    setEditingCharacter(null);
  };

  const handleEdit = (character: Character) => {
    setEditingCharacter(character);
    setFormData({
      name: character.name,
      avatar: character.avatar,
      color: character.color,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteCharacter(id);
    toast.success('Character deleted');
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, avatar: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-glow">Characters</h2>
          <p className="text-muted-foreground mt-1">Add and manage characters for your chat story</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="btn-glow">
              <Plus className="w-4 h-4 mr-2" />
              Add Character
            </Button>
          </DialogTrigger>
          
          <DialogContent className="card-glow">
            <DialogHeader>
              <DialogTitle>
                {editingCharacter ? 'Edit Character' : 'Add New Character'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Character Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter character name..."
                  className="bg-input"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="avatar">Profile Picture</Label>
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={formData.avatar} />
                    <AvatarFallback style={{ backgroundColor: formData.color }}>
                      {formData.name.charAt(0).toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <Input
                      id="avatar"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="bg-input"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Upload an image or leave empty for auto-generated avatar
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Character Color</Label>
                <div className="flex gap-2">
                  {CHARACTER_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                        formData.color === color ? 'border-white scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingCharacter ? 'Update Character' : 'Add Character'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {characters.length === 0 ? (
        <Card className="card-glow p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Plus className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Characters Yet</h3>
          <p className="text-muted-foreground mb-4">
            Add your first character to start creating your chat story
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {characters.map(character => (
            <Card key={character.id} className="card-glow p-4">
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={character.avatar} />
                  <AvatarFallback style={{ backgroundColor: character.color }}>
                    {character.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{character.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: character.color }}
                    />
                    <span className="text-xs text-muted-foreground">
                      Theme Color
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(character)}
                  className="flex-1"
                >
                  <Edit2 className="w-3 h-3 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(character.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
      
      {characters.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          {characters.length} character{characters.length !== 1 ? 's' : ''} added
        </div>
      )}
    </div>
  );
};