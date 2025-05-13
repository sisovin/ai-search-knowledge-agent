"use client";

import {
    AccessibleTabs,
    AccessibleTabsContent,
    AccessibleTabsList,
    AccessibleTabsTrigger,
} from "@/components/ui/accessible-tabs";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { ValidatedInput } from "@/components/ui/validated-input";
import { Check, Globe, Lock, Mail } from "lucide-react";
import { useState } from "react";

export default function UIComponentsDemo() {
  // Button demo state
  const [isLoading, setIsLoading] = useState(false);
  const [buttonClicked, setButtonClicked] = useState("");

  // Input demo state
  const [email, setEmail] = useState("");
  const [emailValidation, setEmailValidation] = useState<"idle" | "valid" | "invalid" | "warning">("idle");
  const [password, setPassword] = useState("");
  const [url, setUrl] = useState("");
  const [urlValidation, setUrlValidation] = useState<"idle" | "valid" | "invalid" | "warning">("idle");

  // Tabs demo state
  const [activeTab, setActiveTab] = useState("buttons");

  // Button click handler
  const handleButtonClick = (type: string) => {
    setButtonClicked(type);
    if (type === "loading") {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    }
  };

  // Email validation
  const validateEmail = (value: string) => {
    if (!value) {
      setEmailValidation("idle");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(value)) {
      setEmailValidation("valid");
    } else {
      setEmailValidation("invalid");
    }
  };

  // URL validation
  const validateUrl = (value: string) => {
    if (!value) {
      setUrlValidation("idle");
      return;
    }

    try {
      const url = new URL(value);
      if (url.protocol === "http:" || url.protocol === "https:") {
        setUrlValidation("valid");
      } else {
        setUrlValidation("warning");
      }
    } catch {
      setUrlValidation("invalid");
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">UI Components Demo</h1>

      <AccessibleTabs value={activeTab} onValueChange={setActiveTab}>
        <AccessibleTabsList className="w-full grid grid-cols-3 mb-8">
          <AccessibleTabsTrigger value="buttons" index={0}>
            Buttons
          </AccessibleTabsTrigger>
          <AccessibleTabsTrigger value="inputs" index={1}>
            Inputs
          </AccessibleTabsTrigger>
          <AccessibleTabsTrigger value="tabs" index={2}>
            Tabs
          </AccessibleTabsTrigger>
        </AccessibleTabsList>

        <AccessibleTabsContent value="buttons" className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Enhanced Button Components</h2>
            <p className="text-muted-foreground">
              These buttons support loading states, disabled states, and various styles.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="space-y-4 border rounded-md p-4">
                <h3 className="text-lg font-medium">Regular Buttons</h3>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => handleButtonClick("primary")}>Primary</Button>
                  <Button variant="secondary" onClick={() => handleButtonClick("secondary")}>Secondary</Button>
                  <Button variant="outline" onClick={() => handleButtonClick("outline")}>Outline</Button>
                  <Button variant="ghost" onClick={() => handleButtonClick("ghost")}>Ghost</Button>
                  <Button variant="link" onClick={() => handleButtonClick("link")}>Link</Button>
                  <Button variant="destructive" onClick={() => handleButtonClick("destructive")}>Destructive</Button>
                </div>
                {buttonClicked && !isLoading && (
                  <p className="text-sm">You clicked: {buttonClicked}</p>
                )}
              </div>

              <div className="space-y-4 border rounded-md p-4">
                <h3 className="text-lg font-medium">Loading Buttons</h3>
                <div className="flex flex-wrap gap-3">
                  <LoadingButton 
                    isLoading={isLoading} 
                    onClick={() => handleButtonClick("loading")}
                  >
                    Click to Load
                  </LoadingButton>
                  <LoadingButton
                    variant="secondary"
                    isLoading={isLoading}
                    loadingText="Processing..."
                    onClick={() => handleButtonClick("loading")}
                  >
                    With Text
                  </LoadingButton>
                  <LoadingButton
                    variant="outline"
                    disabled
                  >
                    Disabled
                  </LoadingButton>
                </div>
                {isLoading && (
                  <p className="text-sm">Loading will complete in 2 seconds...</p>
                )}
              </div>
            </div>
          </div>
        </AccessibleTabsContent>

        <AccessibleTabsContent value="inputs" className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Enhanced Input Components</h2>
            <p className="text-muted-foreground">
              These inputs support validation states, clear buttons, and can display icons.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="space-y-4 border rounded-md p-4">
                <h3 className="text-lg font-medium">Email Input</h3>
                <ValidatedInput
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    validateEmail(e.target.value);
                  }}
                  validationState={emailValidation}
                  errorMessage="Please enter a valid email address"
                  successMessage="Email is valid"
                  leftIcon={<Mail className="h-4 w-4" />}
                />
                <div className="text-sm text-muted-foreground">
                  Try entering an invalid email to see validation
                </div>
              </div>

              <div className="space-y-4 border rounded-md p-4">
                <h3 className="text-lg font-medium">Password Input</h3>
                <ValidatedInput
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock className="h-4 w-4" />}
                  showValidationIcon={false}
                />
              </div>

              <div className="space-y-4 border rounded-md p-4 md:col-span-2">
                <h3 className="text-lg font-medium">URL Input with Validation</h3>
                <ValidatedInput
                  type="url"
                  placeholder="Enter a website URL (e.g., https://example.com)"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    validateUrl(e.target.value);
                  }}
                  validationState={urlValidation}
                  errorMessage="Please enter a valid URL"
                  warningMessage="URL should start with https://"
                  successMessage="URL is valid"
                  leftIcon={<Globe className="h-4 w-4" />}
                />
                {urlValidation === "valid" && (
                  <div className="flex items-center text-sm text-green-500">
                    <Check className="h-4 w-4 mr-1" /> Valid URL format
                  </div>
                )}
              </div>
            </div>
          </div>
        </AccessibleTabsContent>

        <AccessibleTabsContent value="tabs" className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Accessible Tabs Components</h2>
            <p className="text-muted-foreground">
              These tabs support keyboard navigation: use arrow keys to move between tabs, Home/End to go to the
              first/last tab.
            </p>

            <div className="mt-6 border rounded-md p-6">
              <h3 className="text-lg font-medium mb-4">Tab Navigation Demo</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Use keyboard navigation (←, →, Home, End) to move between tabs. This component has built-in
                accessibility features.
              </p>

              <div className="bg-muted/30 p-4 rounded-md">
                <p className="text-sm">Current selected tab: <strong>{activeTab}</strong></p>
                <p className="text-sm mt-1">
                  Use arrow keys to navigate between tabs. Tab content changes automatically.
                </p>
              </div>

              <div className="mt-8">
                <p className="text-sm">
                  This entire demo uses the accessible tabs component. Try using the keyboard
                  to navigate between the "Buttons", "Inputs", and "Tabs" sections at the top.
                </p>
              </div>
            </div>
          </div>
        </AccessibleTabsContent>
      </AccessibleTabs>
    </div>
  );
}
