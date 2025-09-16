import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Upload, FileText, Image, Brain, Zap, TrendingUp, Calendar, Clock } from 'lucide-react';

interface DashboardProps {
  onPageChange: (page: string) => void;
}

export function Dashboard({ onPageChange }: DashboardProps) {
  const [studyStreak] = useState(7);
  const [totalNotes] = useState(23);
  const [xpPoints] = useState(1240);

  const recentUploads = [
    {
      id: 1,
      title: "Strategic Management Framework",
      type: "PDF",
      date: "2 hours ago",
      tags: ["Management", "Strategy", "Planning"],
      processed: true
    },
    {
      id: 2,
      title: "Leadership Styles & Theory",
      type: "Image",
      date: "1 day ago",
      tags: ["Leadership", "Management", "Theory"],
      processed: true
    },
    {
      id: 3,
      title: "E-commerce Business Models",
      type: "Text",
      date: "2 days ago",
      tags: ["E-commerce", "Business", "Digital"],
      processed: true
    }
  ];

  const stats = [
    { label: "Study Streak", value: studyStreak, unit: "days", icon: TrendingUp, color: "text-[--neon-green]" },
    { label: "Total Notes", value: totalNotes, unit: "files", icon: FileText, color: "text-[--neon-blue]" },
    { label: "XP Points", value: xpPoints, unit: "pts", icon: Zap, color: "text-[--neon-purple]" }
  ];

  return (
    <div className="flex-1 p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold gradient-text">Welcome back to Tate Studies</h1>
        <p className="text-xl text-muted-foreground">Turn notes into knowledge.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="border-border/50 bg-gradient-to-br from-card to-accent/20 hover:scale-105 transition-transform duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stat.value}
                <span className="text-sm font-normal text-muted-foreground ml-1">{stat.unit}</span>
              </div>
              {stat.label === "Study Streak" && (
                <Progress value={(studyStreak / 10) * 100} className="mt-2" />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Action */}
      <Card className="border-2 border-dashed border-[--neon-blue]/30 bg-gradient-to-br from-[--neon-blue]/5 to-[--neon-purple]/5 hover:border-[--neon-blue]/50 transition-all duration-300">
        <CardContent className="p-8 text-center">
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[--neon-blue] to-[--neon-purple] rounded-full flex items-center justify-center animate-pulse-gentle">
              <Upload className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Ready to learn something new?</h3>
              <p className="text-muted-foreground">Upload your notes and let AI do the heavy lifting</p>
            </div>
            <Button
              size="lg"
              onClick={() => onPageChange('upload')}
              className="bg-gradient-to-r from-[--neon-blue] to-[--neon-purple] hover:from-[--neon-blue]/80 hover:to-[--neon-purple]/80 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Upload className="h-5 w-5 mr-2" />
              Upload Notes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Uploads */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Recent Uploads</h2>
          <Button variant="ghost" onClick={() => onPageChange('summaries')}>
            View All
          </Button>
        </div>
        
        <div className="grid gap-4">
          {recentUploads.map((upload) => (
            <Card 
              key={upload.id} 
              className="border-border/50 hover:shadow-lg transition-all duration-200 cursor-pointer group"
              onClick={() => onPageChange('summaries')}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[--neon-blue]/20 to-[--neon-purple]/20 rounded-lg flex items-center justify-center">
                      {upload.type === 'PDF' && <FileText className="h-6 w-6 text-[--neon-blue]" />}
                      {upload.type === 'Image' && <Image className="h-6 w-6 text-[--neon-purple]" />}
                      {upload.type === 'Text' && <FileText className="h-6 w-6 text-[--neon-green]" />}
                    </div>
                    <div>
                      <h3 className="font-semibold group-hover:text-[--neon-blue] transition-colors">
                        {upload.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {upload.date}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex flex-wrap gap-1">
                      {upload.tags.slice(0, 2).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {upload.tags.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{upload.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                    {upload.processed && (
                      <div className="flex items-center gap-1 text-[--neon-green]">
                        <Brain className="h-4 w-4" />
                        <span className="text-xs">Processed</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}