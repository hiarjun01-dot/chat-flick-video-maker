import React from 'react';
import { ChatStoryApp } from '@/components/ChatStoryApp';
import { ToastProvider } from '@/components/ui/toast-provider';

const Index = () => {
  return (
    <ToastProvider>
      <ChatStoryApp />
    </ToastProvider>
  );
};

export default Index;
