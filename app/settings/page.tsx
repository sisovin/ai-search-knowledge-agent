import { Metadata } from "next";
import SettingsForm from "@/components/settings/settings-form";
import { AuthGuard } from "@/components/auth/auth-provider";

export const metadata: Metadata = {
  title: "Settings | AI Search Knowledge Agent",
  description: "Manage your account settings and preferences",
};

export default function SettingsPage() {
  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground mb-8">
            Manage your account settings and preferences
          </p>
          
          <SettingsForm />
        </div>
      </div>
    </AuthGuard>
  );
}
