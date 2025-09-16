import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Switch } from './ui/switch';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Bell, Download, Trash2, User, Zap, Brain, Palette, Shield } from 'lucide-react';

interface SettingsProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export function Settings({ isDarkMode, onThemeToggle }: SettingsProps) {
  return (
    <div className="flex-1 p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold gradient-text">Settings</h1>
        <p className="text-xl text-muted-foreground">Customize your Tate Studies experience</p>
      </div>

      <div className="grid gap-6 max-w-4xl">
        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-[--neon-purple]" />
              Appearance
            </CardTitle>
            <CardDescription>Customize how Tate Studies looks and feels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Dark Mode</h4>
                <p className="text-sm text-muted-foreground">Toggle between light and dark themes</p>
              </div>
              <Switch checked={isDarkMode} onCheckedChange={onThemeToggle} />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Animations</h4>
                <p className="text-sm text-muted-foreground">Enable smooth transitions and effects</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Compact Mode</h4>
                <p className="text-sm text-muted-foreground">Reduce spacing for more content</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* AI Processing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-[--neon-blue]" />
              AI Processing
            </CardTitle>
            <CardDescription>Configure how AI processes your notes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Auto-generate Flashcards</h4>
                <p className="text-sm text-muted-foreground">Automatically create flashcards from summaries</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Smart Tags</h4>
                <p className="text-sm text-muted-foreground">AI-generated tags for better organization</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Advanced Summaries</h4>
                <p className="text-sm text-muted-foreground">Include connections and relationships</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-[--neon-green]" />
              Notifications
            </CardTitle>
            <CardDescription>Manage your notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Study Reminders</h4>
                <p className="text-sm text-muted-foreground">Daily reminders to review flashcards</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Processing Complete</h4>
                <p className="text-sm text-muted-foreground">When AI finishes processing your notes</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Streak Achievements</h4>
                <p className="text-sm text-muted-foreground">Celebrate your study milestones</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Account */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-[--neon-purple]" />
              Account
            </CardTitle>
            <CardDescription>Manage your account and data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Current Plan</h4>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-[--neon-blue]/30">Free Plan</Badge>
                  <span className="text-sm text-muted-foreground">50 uploads/month</span>
                </div>
              </div>
              <Button variant="outline" className="border-[--neon-blue]/30 hover:bg-[--neon-blue]/10">
                Upgrade
              </Button>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Storage Used</h4>
                <p className="text-sm text-muted-foreground">2.3 GB of 5 GB used</p>
              </div>
              <div className="text-sm text-muted-foreground">46%</div>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Export Data</h4>
                <p className="text-sm text-muted-foreground">Download all your notes and summaries</p>
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-[--neon-green]" />
              Privacy & Security
            </CardTitle>
            <CardDescription>Control your data and privacy settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Data Retention</h4>
                <p className="text-sm text-muted-foreground">Keep processed notes for offline access</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Analytics</h4>
                <p className="text-sm text-muted-foreground">Help improve Tate Studies with usage data</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-destructive">Delete Account</h4>
                <p className="text-sm text-muted-foreground">Permanently delete your account and data</p>
              </div>
              <Button variant="outline" size="sm" className="border-destructive/30 text-destructive hover:bg-destructive/10">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardHeader>
            <CardTitle>About Tate Studies</CardTitle>
            <CardDescription>Version 1.0.0</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Tate Studies is an AI-powered study companion that transforms your notes into knowledge. 
              Built with modern technology to help students learn more effectively.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Privacy Policy</Button>
              <Button variant="outline" size="sm">Terms of Service</Button>
              <Button variant="outline" size="sm">Contact Support</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}