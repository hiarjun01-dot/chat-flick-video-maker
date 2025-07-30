import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard"; // Import the new Dashboard component
import NotFound from "./pages/NotFound";
import { Toaster } from "./components/ui/sonner"; // Using sonner for toasts

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* The main chat story creator page */}
        <Route path="/" element={<Index />} />
        {/* The new project dashboard hub */}
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Catch-all route for 404 Not Found pages */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
};

export default App;
 
