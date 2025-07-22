import React from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Steps } from '@/components/ui/steps';
import { CharacterManager } from '@/components/CharacterManager';
import { ScriptEditor } from '@/components/ScriptEditor';
import { VideoCustomizerV2 } from '@/components/VideoCustomizerV2';
import { VideoGeneratorV3 } from '@/components/VideoGeneratorV3';
import { useProjectStore } from '@/stores/projectStore';
import heroImage from '@/assets/hero-chat.jpg';

const STEPS = [
  {
    id: 'characters',
    title: 'Characters',
    description: 'Add people to your story'
  },
  {
    id: 'script',
    title: 'Script',
    description: 'Write the conversation'
  },
  {
    id: 'customize',
    title: 'Customize',
    description: 'Style your video'
  },
  {
    id: 'generate',
    title: 'Generate',
    description: 'Create & download'
  }
];

export const ChatStoryApp: React.FC = () => {
  const { currentStep, setCurrentStep, completedSteps, characters, messages } = useProjectStore();

  const currentStepIndex = STEPS.findIndex(step => step.id === currentStep);
  const canGoNext = currentStepIndex < STEPS.length - 1;
  const canGoPrev = currentStepIndex > 0;

  const handleNext = () => {
    if (canGoNext) {
      const nextStep = STEPS[currentStepIndex + 1];
      setCurrentStep(nextStep.id);
    }
  };

  const handlePrev = () => {
    if (canGoPrev) {
      const prevStep = STEPS[currentStepIndex - 1];
      setCurrentStep(prevStep.id);
    }
  };

  const isStepAccessible = (stepId: string) => {
    const stepIndex = STEPS.findIndex(step => step.id === stepId);
    
    // First step is always accessible
    if (stepIndex === 0) return true;
    
    // For other steps, check if we have the minimum requirements
    switch (stepId) {
      case 'script':
        return characters.length > 0;
      case 'customize':
        return characters.length > 0 && messages.length > 0;
      case 'generate':
        return characters.length > 0 && messages.length > 0;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'characters':
        return <CharacterManager />;
      case 'script':
        return <ScriptEditor />;
      case 'customize':
        return <VideoCustomizerV2 />;
      case 'generate':
        return <VideoGeneratorV3 />;
      default:
        return <CharacterManager />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
        <div className="absolute inset-0 bg-[var(--gradient-glow)] opacity-20"></div>
        <div className="relative container mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                ✨ Chat Story Creator
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold text-glow leading-tight">
                Create Epic
                <br />
                <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                  Chat Stories
                </span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Build engaging video stories that look like screen recordings of chat conversations. 
                Perfect for YouTube, TikTok, and social media content.
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Multiple Characters
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Custom Themes
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Background Music
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Export to Video
                </div>
              </div>
            </div>
            
            <div className="relative">
              <img 
                src={heroImage} 
                alt="Chat Story Preview" 
                className="rounded-2xl shadow-[var(--shadow-chat)] w-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main App */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Progress Steps */}
          <Card className="card-glow p-6">
            <Steps 
              steps={STEPS}
              currentStep={currentStep}
              completedSteps={completedSteps}
            />
          </Card>

          {/* Step Content */}
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-3">
              <Card className="card-glow p-4 sticky top-6">
                <h3 className="font-semibold mb-4">Quick Navigation</h3>
                <div className="space-y-2">
                  {STEPS.map((step, index) => {
                    const isAccessible = isStepAccessible(step.id);
                    const isCurrent = currentStep === step.id;
                    const isCompleted = completedSteps.includes(step.id);
                    
                    return (
                      <button
                        key={step.id}
                        onClick={() => isAccessible && setCurrentStep(step.id)}
                        disabled={!isAccessible}
                        className={`w-full text-left p-3 rounded-lg transition-all ${
                          isCurrent 
                            ? 'bg-primary text-primary-foreground' 
                            : isAccessible
                              ? 'hover:bg-muted text-foreground'
                              : 'text-muted-foreground cursor-not-allowed opacity-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                            isCompleted ? 'bg-green-500 text-white' :
                            isCurrent ? 'bg-primary-foreground text-primary' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {isCompleted ? '✓' : index + 1}
                          </div>
                          <div>
                            <div className="font-medium text-sm">{step.title}</div>
                            <div className="text-xs opacity-75">{step.description}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                
                {/* Progress Summary */}
                <div className="mt-6 pt-4 border-t border-border">
                  <div className="text-sm text-muted-foreground">
                    Progress: {completedSteps.length}/{STEPS.length} steps
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 mt-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(completedSteps.length / STEPS.length) * 100}%` }}
                    />
                  </div>
                </div>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-9">
              <div className="min-h-[600px]">
                {renderStepContent()}
              </div>
              
              {/* Navigation Buttons */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-border">
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  disabled={!canGoPrev}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </Button>
                
                <div className="text-sm text-muted-foreground">
                  Step {currentStepIndex + 1} of {STEPS.length}
                </div>
                
                <Button
                  onClick={handleNext}
                  disabled={!canGoNext}
                  className="flex items-center gap-2 btn-glow"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};