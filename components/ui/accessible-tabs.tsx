"use client";

import { cn } from "@/lib/utils";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import React, { createContext, useContext, useEffect, useState } from "react";

// Create context for keyboard navigation
type AccessibleTabsContextType = {
  activeTabIndex: number;
  setActiveTabIndex: (index: number) => void;
  tabsCount: number;
  setTabsCount: (count: number) => void;
};

const AccessibleTabsContext = createContext<AccessibleTabsContextType | undefined>(
  undefined
);

// Root component wrapper
interface AccessibleTabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  orientation?: "horizontal" | "vertical";
  dir?: "ltr" | "rtl";
  activationMode?: "automatic" | "manual";
  children: React.ReactNode;
  className?: string;
}

export function AccessibleTabs({
  defaultValue,
  value,
  onValueChange,
  orientation = "horizontal",
  dir = "ltr",
  activationMode = "automatic",
  children,
  className,
}: AccessibleTabsProps) {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [tabsCount, setTabsCount] = useState(0);
  const [tabValues, setTabValues] = useState<string[]>([]);

  // Handle controlled value changes
  useEffect(() => {
    if (value && tabValues.includes(value)) {
      setActiveTabIndex(tabValues.indexOf(value));
    }
  }, [value, tabValues]);

  // Handle value change when active tab index changes
  useEffect(() => {
    if (onValueChange && tabValues[activeTabIndex]) {
      onValueChange(tabValues[activeTabIndex]);
    }
  }, [activeTabIndex, onValueChange, tabValues]);

  return (
    <AccessibleTabsContext.Provider
      value={{
        activeTabIndex,
        setActiveTabIndex,
        tabsCount,
        setTabsCount,
      }}
    >
      <TabsPrimitive.Root
        defaultValue={defaultValue}
        value={value}
        onValueChange={onValueChange}
        orientation={orientation}
        dir={dir}
        activationMode={activationMode}
        className={className}
      >
        {children}
      </TabsPrimitive.Root>
    </AccessibleTabsContext.Provider>
  );
}

// Tab list component
interface AccessibleTabsListProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> {
  children: React.ReactNode;
}

export function AccessibleTabsList({
  className,
  children,
  ...props
}: AccessibleTabsListProps) {
  const { activeTabIndex, setActiveTabIndex, setTabsCount } = useContext(
    AccessibleTabsContext
  ) || { activeTabIndex: 0, setActiveTabIndex: () => {}, setTabsCount: () => {} };

  const childrenArray = React.Children.toArray(children).filter(
    (child) => React.isValidElement(child)
  );

  // Update tab count whenever children change
  useEffect(() => {
    setTabsCount(childrenArray.length);
  }, [childrenArray.length, setTabsCount]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const isHorizontal = props["aria-orientation"] !== "vertical";
    const maxIndex = childrenArray.length - 1;

    switch (e.key) {
      case "ArrowRight":
        if (isHorizontal) {
          e.preventDefault();
          setActiveTabIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
        }
        break;
      case "ArrowLeft":
        if (isHorizontal) {
          e.preventDefault();
          setActiveTabIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
        }
        break;
      case "ArrowDown":
        if (!isHorizontal) {
          e.preventDefault();
          setActiveTabIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
        }
        break;
      case "ArrowUp":
        if (!isHorizontal) {
          e.preventDefault();
          setActiveTabIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
        }
        break;
      case "Home":
        e.preventDefault();
        setActiveTabIndex(0);
        break;
      case "End":
        e.preventDefault();
        setActiveTabIndex(maxIndex);
        break;
      default:
        break;
    }
  };

  return (
    <TabsPrimitive.List
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
        className
      )}
      onKeyDown={handleKeyDown}
      role="tablist"
      aria-orientation={props["aria-orientation"] || "horizontal"}
      {...props}
    >
      {children}
    </TabsPrimitive.List>
  );
}

// Tab trigger component
interface AccessibleTabsTriggerProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {
  index?: number;
}

export function AccessibleTabsTrigger({
  className,
  index,
  value,
  children,
  ...props
}: AccessibleTabsTriggerProps) {
  const { activeTabIndex } = useContext(AccessibleTabsContext) || {
    activeTabIndex: 0,
  };

  const isActive = index !== undefined ? index === activeTabIndex : false;

  return (
    <TabsPrimitive.Trigger
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
        className
      )}
      value={value}
      data-state={isActive ? "active" : "inactive"}
      {...props}
    >
      {children}
    </TabsPrimitive.Trigger>
  );
}

// Tab content component
interface AccessibleTabsContentProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content> {}

export function AccessibleTabsContent({
  className,
  ...props
}: AccessibleTabsContentProps) {
  return (
    <TabsPrimitive.Content
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props}
    />
  );
}

// Export original tabs components as well
export { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

