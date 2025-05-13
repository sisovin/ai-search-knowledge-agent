"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import LogoutButton from "@/components/auth/logout-button";
import { 
  Database, 
  Menu, 
  Search, 
  User, 
  LogOut,
  ChevronDown
} from "lucide-react";

export default function Header() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Handle scroll effect for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={`sticky top-0 z-40 w-full transition-all duration-200 ${
        isScrolled ? "bg-background/80 backdrop-blur-sm shadow-sm" : "bg-background"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Database className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg hidden sm:inline-block">
                AI Knowledge Agent
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              href="/" 
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Home
            </Link>
            <Link 
              href="/search" 
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Search
            </Link>
            <Link 
              href="/documents" 
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Documents
            </Link>
            
            {/* More dropdown for smaller screens */}
            <div className="relative group">
              <button className="flex items-center text-sm font-medium transition-colors hover:text-primary">
                More
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              <div className="absolute right-0 top-full w-48 py-2 bg-card rounded-md shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                <Link 
                  href="/settings" 
                  className="block px-4 py-2 text-sm hover:bg-accent"
                >
                  Settings
                </Link>
                <Link 
                  href="/profile" 
                  className="block px-4 py-2 text-sm hover:bg-accent"
                >
                  Profile
                </Link>
              </div>
            </div>
          </nav>
          
          {/* Auth and theme buttons */}
          <div className="flex items-center space-x-2">
            {/* Search button (visible on smaller screens) */}
            <Link 
              href="/search" 
              className="md:hidden p-2 rounded-full hover:bg-accent"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </Link>
            
            {/* Theme toggle */}
            <ModeToggle />
            
            {/* Authentication buttons */}
            {isLoading ? (
              <div className="h-9 w-9 rounded-full bg-muted animate-pulse"></div>
            ) : isAuthenticated ? (
              <div className="flex items-center space-x-1">
                <div className="relative group">
                  <button className="flex items-center space-x-1 rounded-full hover:bg-accent p-1">
                    <div className="relative w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
                      {user?.name ? user.name[0].toUpperCase() : user?.email?.[0].toUpperCase()}
                    </div>
                    <ChevronDown className="h-4 w-4 hidden sm:block" />
                  </button>
                  <div className="absolute right-0 top-full w-48 py-2 bg-card rounded-md shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                    <div className="px-4 py-2 border-b">
                      <p className="font-medium text-sm truncate">{user?.name || "User"}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                    <Link 
                      href="/profile" 
                      className="flex items-center px-4 py-2 text-sm hover:bg-accent"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                    <Link 
                      href="/settings" 
                      className="flex items-center px-4 py-2 text-sm hover:bg-accent"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                    <div className="border-t mt-1 pt-1">
                      <LogoutButton 
                        className="flex w-full items-center px-4 py-2 text-sm hover:bg-accent justify-start font-normal" 
                        showIcon={true}
                        variant="ghost"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/auth/login">Login</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/auth/signup">Sign up</Link>
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(true)}
              className="inline-flex md:hidden items-center justify-center p-2 rounded-md hover:bg-accent"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile navigation overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-background md:hidden">
          <div className="fixed inset-y-0 right-0 max-w-full flex flex-col w-full bg-background shadow-xl">
            <div className="flex items-center justify-between px-4 h-16 border-b">
              <div className="flex items-center">
                <Database className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg ml-2">
                  AI Knowledge Agent
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-md p-2 hover:bg-accent"
                aria-label="Close menu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <nav className="px-4 py-6 space-y-4">
                <Link
                  href="/"
                  className="block py-3 px-4 text-base font-medium rounded-md hover:bg-accent"
                  onClick={() => setIsOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/search"
                  className="block py-3 px-4 text-base font-medium rounded-md hover:bg-accent"
                  onClick={() => setIsOpen(false)}
                >
                  Search
                </Link>
                <Link
                  href="/documents"
                  className="block py-3 px-4 text-base font-medium rounded-md hover:bg-accent"
                  onClick={() => setIsOpen(false)}
                >
                  Documents
                </Link>
                <Link
                  href="/settings"
                  className="block py-3 px-4 text-base font-medium rounded-md hover:bg-accent"
                  onClick={() => setIsOpen(false)}
                >
                  Settings
                </Link>
                <Link
                  href="/profile"
                  className="block py-3 px-4 text-base font-medium rounded-md hover:bg-accent"
                  onClick={() => setIsOpen(false)}
                >
                  Profile
                </Link>
              </nav>
              
              <div className="border-t px-4 py-6">
                {!isAuthenticated ? (
                  <div className="flex flex-col space-y-4">
                    <Button asChild variant="outline" onClick={() => setIsOpen(false)}>
                      <Link href="/auth/login">Login</Link>
                    </Button>
                    <Button asChild onClick={() => setIsOpen(false)}>
                      <Link href="/auth/signup">Sign up</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 px-4 py-3 rounded-md bg-accent/50">
                      <div className="relative w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                        {user?.name ? user.name[0].toUpperCase() : user?.email?.[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{user?.name || "User"}</p>
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                      </div>
                    </div>
                    <LogoutButton 
                      className="w-full justify-center" 
                      showIcon={true}
                      variant="outline"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
