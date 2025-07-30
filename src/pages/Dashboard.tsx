import React from 'react';
import { Plus, Folder, Star, Clock, Video, Users, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Sidebar,
  SidebarProvider,
  SidebarTrigger,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import Header from '@/Header';

const Dashboard: React.FC = () => {
  // Mock data for projects - this can be replaced with dynamic data from a store
  const projects = [
    {
      id: 'proj-1',
      name: 'My First Chat Story',
      category: 'YouTube Content',
      lastUpdated: '2 hours ago',
      isStarred: true,
      characters: 4,
      messages: 52,
      videos: 2,
    },
    {
      id: 'proj-2',
      name: 'TikTok Viral Idea',
      category: 'Social Media',
      lastUpdated: '1 day ago',
      isStarred: false,
      characters: 2,
      messages: 25,
      videos: 5,
    },
    {
      id: 'proj-3',
      name: 'Client Project - Ad Campaign',
      category: 'Client Work',
      lastUpdated: '3 days ago',
      isStarred: true,
      characters: 5,
      messages: 120,
      videos: 1,
    },
    {
        id: 'proj-4',
        name: 'Internal Training Video',
        category: 'Corporate',
        lastUpdated: '1 week ago',
        isStarred: false,
        characters: 3,
        messages: 80,
        videos: 1,
      },
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background text-foreground">
        <Sidebar>
          <SidebarContent>
            <SidebarHeader>
              <h2 className="text-xl font-semibold text-glow">ChatFlick</h2>
            </SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton href="/dashboard" isActive>
                  <Folder />
                  Projects
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href="#">
                  <Star />
                  Starred
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href="#">
                  <Clock />
                  Recent
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <Button className="w-full">
              <Plus className="mr-2 h-4 w-4" /> New Project
            </Button>
          </SidebarFooter>
        </Sidebar>
        <div className="flex-1">
          <Header />
          <main className="p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-glow">Project Dashboard</h1>
              <p className="text-muted-foreground">Welcome back! Here's an overview of your projects.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <Card className="card-glow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                  <Folder className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{projects.length}</div>
                </CardContent>
              </Card>
              <Card className="card-glow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
                  <Video className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{projects.reduce((acc, p) => acc + p.videos, 0)}</div>
                </CardContent>
              </Card>
              <Card className="card-glow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Characters</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{projects.reduce((acc, p) => acc + p.characters, 0)}</div>
                </CardContent>
              </Card>
              <Card className="card-glow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{projects.reduce((acc, p) => acc + p.messages, 0)}</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card key={project.id} className="card-glow flex flex-col">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{project.category}</p>
                      </div>
                      {project.isStarred && <Star className="h-5 w-5 text-yellow-400" />}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="flex items-center text-sm text-muted-foreground mb-4">
                      <Clock className="h-4 w-4 mr-2" />
                      Last updated {project.lastUpdated}
                    </div>
                    <div className="flex justify-around text-center">
                      <div>
                        <p className="text-xl font-bold">{project.characters}</p>
                        <p className="text-xs text-muted-foreground">Characters</p>
                      </div>
                      <div>
                        <p className="text-xl font-bold">{project.messages}</p>
                        <p className="text-xs text-muted-foreground">Messages</p>
                      </div>
                      <div>
                        <p className="text-xl font-bold">{project.videos}</p>
                        <p className="text-xs text-muted-foreground">Videos</p>
                      </div>
                    </div>
                  </CardContent>
                  <div className="p-6 pt-0">
                    <Button
                      className="w-full"
                      onClick={() => (window.location.href = '/')}
                    >
                      Open Project
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
