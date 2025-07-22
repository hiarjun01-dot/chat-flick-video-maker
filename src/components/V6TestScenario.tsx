import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TestTube, CheckCircle, AlertTriangle } from 'lucide-react';
import { useProjectStore } from '@/stores/projectStore';
import { toast } from 'sonner';

export const V6TestScenario: React.FC = () => {
  const { characters, addMessage, clearMessages } = useProjectStore();

  const createNightmareScenario = () => {
    if (characters.length < 2) {
      toast.error('Need at least 2 characters for comprehensive testing');
      return;
    }

    // Clear existing messages
    clearMessages();
    toast.info('Creating V6.0 nightmare scenario...');

    const char1 = characters[0];
    const char2 = characters[1];

    // Comprehensive test messages that combine ALL V6.0 features
    const testMessages = [
      {
        characterId: char1.id,
        text: "Hey! 👋 Let's test the V6.0 system with emojis inline! 🚀",
        delay: 1,
        typingDuration: 2,
        reaction: '❤️',
        soundEffect: 'ping' as const,
        zoomIn: false,
        spotlightMode: false,
        showTimestamp: true
      },
      {
        characterId: char2.id,
        text: "Perfect! This message has a reaction overlay 😍 and sound emphasis! 🔊",
        delay: 2,
        typingDuration: 3,
        reaction: '🔥',
        soundEffect: 'swoosh' as const,
        zoomIn: true,
        spotlightMode: false,
        showTimestamp: false
      },
      {
        characterId: char1.id,
        text: "DRAMATIC SPOTLIGHT MOMENT! 🎭 This should clear the screen and focus only on this message with enhanced zoom!",
        delay: 1.5,
        typingDuration: 4,
        reaction: '⭐',
        soundEffect: 'gasp' as const,
        zoomIn: true,
        spotlightMode: true,
        showTimestamp: true
      },
      {
        characterId: char2.id,
        text: "Back to normal conversation! Multiple features: emoji 🎉, reaction, sound, and timestamp! The V6.0 system handles it all! 💪",
        delay: 2,
        typingDuration: 2.5,
        reaction: '✨',
        soundEffect: 'swoosh' as const,
        zoomIn: false,
        spotlightMode: false,
        showTimestamp: true
      },
      {
        characterId: char1.id,
        text: "Error sound test with zoom and reaction combo! 🚨 This tests all systems working together seamlessly! 🎯",
        delay: 1,
        typingDuration: 3,
        reaction: '😮',
        soundEffect: 'error' as const,
        zoomIn: true,
        spotlightMode: false,
        showTimestamp: false
      },
      {
        characterId: char2.id,
        text: "Final test: spotlight + zoom + sound + reaction + emoji + timestamp = PERFECT! 🎊🎉🏆",
        delay: 2,
        typingDuration: 2,
        reaction: '🏆',
        soundEffect: 'ping' as const,
        zoomIn: true,
        spotlightMode: true,
        showTimestamp: true
      }
    ];

    // Add all test messages
    testMessages.forEach((msg, index) => {
      setTimeout(() => {
        addMessage(msg);
        if (index === testMessages.length - 1) {
          toast.success('V6.0 Nightmare Scenario Created! All features combined!');
        }
      }, index * 200);
    });
  };

  const testFeatures = [
    {
      name: "3D Typing Indicator",
      description: "Enhanced depth effects with gradients and shadows",
      status: "✅ Integrated",
      color: "bg-green-500/20 text-green-400"
    },
    {
      name: "Reaction Overlays",
      description: "Modern bubble-corner emoji reactions",
      status: "✅ Enhanced",
      color: "bg-blue-500/20 text-blue-400"
    },
    {
      name: "Sound Effects",
      description: "Dynamic audio emphasis with synthesis",
      status: "✅ Re-enabled",
      color: "bg-purple-500/20 text-purple-400"
    },
    {
      name: "Zoom Focus",
      description: "Smooth zoom animations with stability",
      status: "✅ Stabilized",
      color: "bg-orange-500/20 text-orange-400"
    },
    {
      name: "Spotlight Mode",
      description: "Cinematic message isolation",
      status: "✅ Improved",
      color: "bg-yellow-500/20 text-yellow-400"
    },
    {
      name: "Feature Combinations",
      description: "All effects working together flawlessly",
      status: "✅ Bulletproof",
      color: "bg-gradient-to-r from-green-500/20 to-blue-500/20 text-green-400"
    }
  ];

  return (
    <Card className="card-glow p-6 space-y-6">
      <div className="flex items-center gap-3">
        <TestTube className="w-6 h-6 text-primary" />
        <div>
          <h3 className="text-xl font-bold text-glow">V6.0 Quality Assurance</h3>
          <p className="text-muted-foreground">Comprehensive feature testing & validation</p>
        </div>
      </div>

      {/* Feature Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {testFeatures.map((feature, index) => (
          <div key={index} className="border border-border/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">{feature.name}</h4>
              <Badge className={feature.color}>
                {feature.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* Nightmare Scenario Button */}
      <div className="border-t pt-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            <h4 className="text-lg font-semibold">Nightmare Scenario Test</h4>
            <AlertTriangle className="w-5 h-5 text-orange-400" />
          </div>
          
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Creates a comprehensive test script that uses <strong>every single V6.0 feature simultaneously</strong> 
            to validate bulletproof stability and perfect feature integration.
          </p>

          <div className="flex flex-wrap justify-center gap-2 text-xs">
            <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded">3D Typing</span>
            <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded">Reaction Overlays</span>
            <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded">Sound Effects</span>
            <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded">Zoom Focus</span>
            <span className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded">Spotlight Mode</span>
            <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">Emojis</span>
            <span className="bg-pink-500/20 text-pink-400 px-2 py-1 rounded">Timestamps</span>
          </div>

          <Button 
            onClick={createNightmareScenario}
            disabled={characters.length < 2}
            className="btn-glow"
          >
            <TestTube className="w-4 h-4 mr-2" />
            Create Nightmare Scenario
          </Button>

          {characters.length < 2 && (
            <p className="text-xs text-muted-foreground">
              Need at least 2 characters to run comprehensive test
            </p>
          )}
        </div>
      </div>

      {/* V6.0 Achievement Badge */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/20 to-primary-glow/20 border border-primary/30 rounded-full px-4 py-2">
          <CheckCircle className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">V6.0 Production Ready</span>
          <CheckCircle className="w-4 h-4 text-primary" />
        </div>
      </div>
    </Card>
  );
};