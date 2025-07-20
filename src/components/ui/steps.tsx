import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface Step {
  id: string;
  title: string;
  description?: string;
}

interface StepsProps {
  steps: Step[];
  currentStep: string;
  completedSteps: string[];
  className?: string;
}

export const Steps: React.FC<StepsProps> = ({
  steps,
  currentStep,
  completedSteps,
  className
}) => {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = currentStep === step.id;
          const isLast = index === steps.length - 1;

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                    {
                      "bg-primary text-primary-foreground border-primary": isCompleted,
                      "bg-primary/20 text-primary border-primary animate-pulse": isCurrent,
                      "bg-muted text-muted-foreground border-border": !isCompleted && !isCurrent,
                    }
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p className={cn(
                    "text-sm font-medium",
                    {
                      "text-primary": isCompleted || isCurrent,
                      "text-muted-foreground": !isCompleted && !isCurrent,
                    }
                  )}>
                    {step.title}
                  </p>
                  {step.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
              {!isLast && (
                <div className={cn(
                  "flex-1 h-0.5 mx-4 transition-colors duration-300",
                  {
                    "bg-primary": isCompleted,
                    "bg-muted": !isCompleted,
                  }
                )} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};