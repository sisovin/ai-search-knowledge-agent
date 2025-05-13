import UserProfile from "@/components/auth/user-profile";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile | AI Search Knowledge Agent",
  description: "Manage your profile and account settings",
};

export default function ProfilePage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <UserProfile />
    </div>
  );
}
