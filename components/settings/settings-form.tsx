"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Save } from "lucide-react";

export default function SettingsForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    language: "en",
  });
  
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    security: true,
    marketing: false,
  });
  
  const [appearance, setAppearance] = useState({
    theme: "system",
    fontSize: "normal",
  });

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Here you would update the user profile via API
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error updating your profile.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSavePreferences = async () => {
    setIsLoading(true);
    
    try {
      // Here you would update user preferences via API
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: "Preferences updated",
        description: "Your preferences have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error updating your preferences.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid grid-cols-3 max-w-md mb-8">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>
        
        {/* Profile Settings */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>
                Manage your personal information and account settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name" lang="en">Full Name</Label>
                      <Input
                        id="name"
                        placeholder="Your name"
                        value={userData.name}
                        onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" lang="en">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={userData.email}
                        onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                        disabled
                      />
                      <p className="text-sm text-muted-foreground">
                        To change your email, please contact support.
                      </p>
                    </div>
                  </div>

                  <Separator className="my-6" />
                  
                  <div className="space-y-2">
                    <Label lang="en">Language</Label>
                    <div className="language-selector w-fit">
                      <button
                        type="button"
                        className={`language-selector-item ${userData.language === 'en' ? 'active' : ''}`}
                        onClick={() => setUserData({ ...userData, language: 'en' })}
                      >
                        English
                      </button>
                      <button
                        type="button"
                        className={`language-selector-item ${userData.language === 'kh' ? 'active' : ''}`}
                        onClick={() => setUserData({ ...userData, language: 'kh' })}
                      >
                        ភាសាខ្មែរ
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Manage how you receive notifications and updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email notifications for important updates
                    </p>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, email: checked })
                    }
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive push notifications in your browser
                    </p>
                  </div>
                  <Switch
                    checked={notifications.push}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, push: checked })
                    }
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Security Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about security-related events
                    </p>
                  </div>
                  <Switch
                    checked={notifications.security}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, security: checked })
                    }
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Marketing Emails</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive updates about new features and offers
                    </p>
                  </div>
                  <Switch
                    checked={notifications.marketing}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, marketing: checked })
                    }
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                onClick={handleSavePreferences}
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Save Preferences
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Appearance Settings */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>
                Customize how the application looks and feels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-base">Theme</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Choose your preferred color theme
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                    <div
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        appearance.theme === 'light' ? 'border-primary bg-accent' : ''
                      }`}
                      onClick={() => setAppearance({ ...appearance, theme: 'light' })}
                    >
                      <div className="h-20 mb-2 rounded bg-[#ffffff] border"></div>
                      <p className="text-sm font-medium">Light</p>
                    </div>
                    <div
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        appearance.theme === 'dark' ? 'border-primary bg-accent' : ''
                      }`}
                      onClick={() => setAppearance({ ...appearance, theme: 'dark' })}
                    >
                      <div className="h-20 mb-2 rounded bg-[#1a1a1a]"></div>
                      <p className="text-sm font-medium">Dark</p>
                    </div>
                    <div
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        appearance.theme === 'system' ? 'border-primary bg-accent' : ''
                      }`}
                      onClick={() => setAppearance({ ...appearance, theme: 'system' })}
                    >
                      <div className="h-20 mb-2 rounded bg-gradient-to-r from-[#ffffff] to-[#1a1a1a]"></div>
                      <p className="text-sm font-medium">System</p>
                    </div>
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                <div>
                  <Label className="text-base">Font Size</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Adjust the text size for better readability
                  </p>
                  <div className="grid grid-cols-3 gap-4">
                    <button
                      type="button"
                      className={`flex justify-center py-2 border rounded-md transition ${
                        appearance.fontSize === 'small' ? 'border-primary bg-accent' : ''
                      }`}
                      onClick={() => setAppearance({ ...appearance, fontSize: 'small' })}
                    >
                      <span className="text-sm">Small</span>
                    </button>
                    <button
                      type="button"
                      className={`flex justify-center py-2 border rounded-md transition ${
                        appearance.fontSize === 'normal' ? 'border-primary bg-accent' : ''
                      }`}
                      onClick={() => setAppearance({ ...appearance, fontSize: 'normal' })}
                    >
                      <span className="text-base">Normal</span>
                    </button>
                    <button
                      type="button"
                      className={`flex justify-center py-2 border rounded-md transition ${
                        appearance.fontSize === 'large' ? 'border-primary bg-accent' : ''
                      }`}
                      onClick={() => setAppearance({ ...appearance, fontSize: 'large' })}
                    >
                      <span className="text-lg">Large</span>
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                onClick={handleSavePreferences}
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Save Preferences
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
