import { useState } from 'react';
import { Home, Upload, Sparkles, Gamepad2, Settings, Sun, Moon, BookOpen, Lightbulb } from 'lucide-react';
import { Button } from './ui/button';
import { Switch } from './ui/switch';

interface SidebarNavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export function SidebarNavigation({ currentPage, onPageChange, isDarkMode, onThemeToggle }: SidebarNavigationProps) {
  const navigationItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'upload', icon: Upload, label: 'Upload' },
    { id: 'summaries', icon: Sparkles, label: 'Summaries' },
    { id: 'flashcards', icon: Gamepad2, label: 'Flashcards' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="w-64 bg-card border-r border-border h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="relative">
            <BookOpen className="h-8 w-8 text-[--neon-blue]" />
            <Lightbulb className="h-4 w-4 text-[--neon-green] absolute -top-1 -right-1" />
          </div>
          <div>
            <h1 className="text-xl font-bold gradient-text">Tate Studies</h1>
            <p className="text-xs text-muted-foreground">Bullshitting Through School</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => (
          <Button
            key={item.id}
            variant={currentPage === item.id ? "default" : "ghost"}
            className={`w-full justify-start gap-3 rounded-xl transition-all duration-200 ${
              currentPage === item.id 
                ? 'bg-gradient-to-r from-[--neon-blue]/20 to-[--neon-purple]/20 border border-[--neon-blue]/30 neon-glow' 
                : 'hover:bg-accent/50'
            }`}
            onClick={() => onPageChange(item.id)}
          >
            <item.icon className={`h-5 w-5 ${currentPage === item.id ? 'text-[--neon-blue]' : ''}`} />
            {item.label}
          </Button>
        ))}
      </nav>

      {/* Theme Toggle */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4" />
            <span className="text-sm">Theme</span>
            <Moon className="h-4 w-4" />
          </div>
          <Switch checked={isDarkMode} onCheckedChange={onThemeToggle} />
        </div>
      </div>
    </div>
  );
}