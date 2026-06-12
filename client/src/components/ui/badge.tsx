import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 interactive-popup",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-md hover:shadow-lg glow-text",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground shadow-sm hover:shadow-md",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow-md hover:shadow-lg",
        success:
          "border-transparent bg-success text-success-foreground shadow-md hover:shadow-lg",
        warning:
          "border-transparent bg-warning text-warning-foreground shadow-md hover:shadow-lg",
        outline:
          "border-2 border-border text-foreground hover:border-primary hover:bg-primary/10 neon-border",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
