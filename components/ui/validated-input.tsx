"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { AlertCircle, Check, X } from "lucide-react";
import React, { forwardRef, useRef, useState } from "react";

export type ValidationState = "idle" | "valid" | "invalid" | "warning";

export interface ValidatedInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
  validationState?: ValidationState;
  errorMessage?: string;
  warningMessage?: string;
  successMessage?: string;
  showValidationIcon?: boolean;
  leftIcon?: React.ReactNode;
}

export const ValidatedInput = forwardRef<HTMLInputElement, ValidatedInputProps>(
  (
    {
      className,
      validationState = "idle",
      errorMessage,
      warningMessage,
      successMessage,
      onClear,
      value,
      onChange,
      disabled,
      showValidationIcon = true,
      leftIcon,
      ...props
    },
    ref
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [inputValue, setInputValue] = useState(value || "");

    // Handle input change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
      onChange?.(e);
    };

    // Clear the input
    const clearInput = () => {
      setInputValue("");
      
      if (inputRef.current) {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          "value"
        )?.set;
        
        nativeInputValueSetter?.call(inputRef.current, "");
        
        const event = new Event("change", { bubbles: true });
        inputRef.current.dispatchEvent(event);
        inputRef.current.focus();
      }
      
      onClear?.();
    };

    // Get validation message
    const getValidationMessage = () => {
      switch (validationState) {
        case "invalid":
          return errorMessage;
        case "warning":
          return warningMessage;
        case "valid":
          return successMessage;
        default:
          return null;
      }
    };

    // Get validation icon
    const getValidationIcon = () => {
      if (!showValidationIcon) return null;
      
      switch (validationState) {
        case "valid":
          return <Check className="h-4 w-4 text-green-500" />;
        case "invalid":
          return <AlertCircle className="h-4 w-4 text-red-500" />;
        case "warning":
          return <AlertCircle className="h-4 w-4 text-yellow-500" />;
        default:
          return null;
      }
    };

    return (
      <div className="space-y-1.5 w-full">
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}
          
          <Input
            ref={(node) => {
              // Handle both refs
              if (typeof ref === "function") {
                ref(node);
              } else if (ref) {
                ref.current = node;
              }
              inputRef.current = node;
            }}
            value={inputValue}
            onChange={handleChange}
            className={cn(
              leftIcon && "pl-10",
              validationState === "invalid" && "border-red-500 focus-visible:ring-red-500",
              validationState === "warning" && "border-yellow-500 focus-visible:ring-yellow-500",
              validationState === "valid" && "border-green-500 focus-visible:ring-green-500",
              className
            )}
            disabled={disabled}
            {...props}
          />
          
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {getValidationIcon()}
            
            {inputValue && !disabled && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 w-6 rounded-full p-0"
                onClick={clearInput}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Clear</span>
              </Button>
            )}
          </div>
        </div>
        
        {getValidationMessage() && (
          <p
            className={cn(
              "text-xs",
              validationState === "invalid" && "text-red-500",
              validationState === "warning" && "text-yellow-500",
              validationState === "valid" && "text-green-500"
            )}
          >
            {getValidationMessage()}
          </p>
        )}
      </div>
    );
  }
)

ValidatedInput.displayName = "ValidatedInput";
