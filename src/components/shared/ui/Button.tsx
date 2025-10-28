"use client";

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

/**
 * Button variant styles using class-variance-authority
 */
const buttonVariants = cva(
  // Base styles - consistent animation and transition for all buttons
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/50 disabled:pointer-events-none disabled:opacity-50 transform hover:scale-[1.02] active:scale-[0.98]",
  {
    variants: {
      variant: {
        // Primary button - main action buttons
        primary: "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl hover:shadow-red-500/25",
        
        // Secondary button - secondary actions
        secondary: "bg-zinc-700 hover:bg-zinc-600 text-zinc-300 border border-zinc-600 hover:border-zinc-500",
        
        // Outline button - alternative actions
        outline: "border border-red-500 text-red-500 hover:bg-red-500 hover:text-white",
        
        // Ghost button - subtle actions
        ghost: "text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800/50",
        
        // Danger button - destructive actions
        danger: "bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl hover:shadow-red-500/25",
        
        // Success button - positive actions
        success: "bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl hover:shadow-green-500/25",
        
        // Link button - navigation actions
        link: "text-red-500 hover:text-red-400 underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 py-2",
        lg: "h-12 px-6 py-3 text-base",
        xl: "h-14 px-8 py-4 text-lg",
        icon: "h-10 w-10",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * Loading state - shows spinner and disables button
   */
  loading?: boolean;
  /**
   * Loading text to display when loading
   */
  loadingText?: string;
  /**
   * Icon to display before text
   */
  leftIcon?: React.ReactNode;
  /**
   * Icon to display after text
   */
  rightIcon?: React.ReactNode;
  /**
   * Render as child component (e.g., Link)
   */
  asChild?: boolean;
}

/**
 * Standardized Button Component
 * 
 * Features:
 * - Consistent animations across all buttons
 * - Multiple variants and sizes
 * - Loading states with spinner
 * - Icon support
 * - Full accessibility support
 * - TypeScript support
 * 
 * Animation Details:
 * - Hover: scale(1.02) - subtle scale up
 * - Active: scale(0.98) - subtle scale down
 * - Transition: 200ms duration for smooth animations
 * - Focus: ring with red color for accessibility
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      loading = false,
      loadingText,
      leftIcon,
      rightIcon,
      children,
      disabled,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;
    const Comp = asChild ? React.Fragment : "button";

    const buttonContent = (
      <>
        {loading ? (
          <>
            <div className="border-2 border-current border-t-transparent rounded-full w-4 h-4 animate-spin" />
            {loadingText || "กำลังโหลด..."}
          </>
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </>
    );

    if (asChild) {
      return (
        <div
          className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        >
          {buttonContent}
        </div>
      );
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {buttonContent}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
