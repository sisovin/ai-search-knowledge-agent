import { AuthProvider } from "@/components/auth/auth-provider";
import { ModeToggle } from "@/components/mode-toggle";
import { ThemeProvider } from "@/components/theme-provider";
import { inter, jetbrainsMono } from "@/lib/google-fonts";
import Link from "next/link";
import "./globals.css";
import "./language-styles.css";
import "./theme-styles.css";

// Icons
import {
  Database,
  FileText,
  Home,
  Menu,
  Search,
  Settings,
  User,
  X,
} from "lucide-react";

// UI Components
import { Toaster } from "@/components/ui/toaster";

export const metadata = {
  title: "AI Search Knowledge Agent",
  description: "Next.js 15 AI search and knowledge management application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <div className="flex min-h-screen flex-col md:flex-row">
              {/* Mobile Navigation Toggle - Visible only on small screens */}
              <div className="md:hidden flex items-center justify-between p-4 border-b">
                <div className="font-bold text-lg">AI Knowledge Agent</div>
                <label htmlFor="sidebar-toggle" className="cursor-pointer">
                  <Menu className="h-6 w-6" />
                </label>
              </div>
              {/* Sidebar Navigation */}
              <input
                type="checkbox"
                id="sidebar-toggle"
                className="hidden peer"
                aria-label="Toggle sidebar navigation"
              />
              <aside className="fixed inset-y-0 left-0 transform -translate-x-full transition-transform duration-300 ease-in-out md:translate-x-0 z-20 md:relative w-64 bg-card border-r shadow-sm peer-checked:translate-x-0">
                <div className="sticky top-0 flex flex-col h-full p-4">
                  {/* Close button for mobile */}
                  <div className="md:hidden flex justify-end mb-4">
                    <label htmlFor="sidebar-toggle" className="cursor-pointer">
                      <X className="h-6 w-6" />
                    </label>
                  </div>

                  {/* Logo and title */}
                  <div className="flex items-center mb-8 pl-2">
                    <Database className="h-6 w-6 text-primary mr-2" />
                    <h1 className="font-bold text-xl">Knowledge Agent</h1>
                  </div>

                  {/* Navigation links */}
                  <nav className="space-y-2 flex-1">
                    <Link
                      href="/"
                      className="flex items-center px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground"
                    >
                      <Home className="h-5 w-5 mr-3" />
                      <span>Home</span>
                    </Link>
                    <Link
                      href="/search"
                      className="flex items-center px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground"
                    >
                      <Search className="h-5 w-5 mr-3" />
                      <span>Search</span>
                    </Link>
                    <Link
                      href="/documents"
                      className="flex items-center px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground"
                    >
                      <FileText className="h-5 w-5 mr-3" />
                      <span>Documents</span>
                    </Link>
                  </nav>

                  {/* Bottom section with settings, user and theme */}
                  <div className="border-t pt-4 space-y-2">
                    <Link
                      href="/settings"
                      className="flex items-center px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground"
                    >
                      <Settings className="h-5 w-5 mr-3" />
                      <span>Settings</span>
                    </Link>
                    <Link
                      href="/profile"
                      className="flex items-center px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground"
                    >
                      <User className="h-5 w-5 mr-3" />
                      <span>Profile</span>
                    </Link>
                    <div className="px-3 py-2 flex justify-between items-center">
                      <ModeToggle />
                    </div>
                  </div>
                </div>
              </aside>

              {/* Overlay for mobile when sidebar is open */}
              <label
                htmlFor="sidebar-toggle"
                className="peer-checked:block hidden fixed inset-0 bg-black/50 z-10 md:hidden"
              ></label>

              {/* Main content */}
              <main className="flex-1 overflow-auto">
                <div className="container mx-auto p-4 md:p-6">{children}</div>
              </main>
            </div>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
