"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { User } from "next-auth";
import LogoutButton from "./logout-button";

interface UserProfileProps {
  className?: string;
}

export default function UserProfile({ className }: UserProfileProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (!user) {
    return <LoginPrompt />;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">User Profile</CardTitle>
        <CardDescription>Manage your account and settings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          <UserAvatar user={user} />
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <LogoutButton showIcon />
        </div>
      </CardContent>
    </Card>
  );
}

function UserAvatar({ user }: { user: User }) {
  return (
    <Avatar>
      <div className="relative w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
        {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
      </div>
    </Avatar>
  );
}

function ProfileSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-40 mt-2" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LoginPrompt() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Not Signed In</CardTitle>
        <CardDescription>Sign in to access all features</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between">
          <Button asChild variant="outline">
            <a href="/auth/signup">Sign Up</a>
          </Button>
          <Button asChild>
            <a href="/auth/login">Log In</a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
