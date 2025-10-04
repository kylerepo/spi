import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 transition-all duration-200 relative overflow-hidden" +
  " before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/10 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-200",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-b from-primary to-primary/90 text-primary-foreground border border-primary-border shadow-lg hover:shadow-xl active:shadow-md hover:-translate-y-0.5 active:translate-y-0 transform",
        destructive:
          "bg-gradient-to-b from-destructive to-destructive/90 text-destructive-foreground border border-destructive-border shadow-lg hover:shadow-xl active:shadow-md hover:-translate-y-0.5 active:translate-y-0 transform",
        outline:
          "bg-gradient-to-b from-background to-card border-2 border-border/60 shadow-md hover:shadow-lg active:shadow-sm hover:-translate-y-0.5 active:translate-y-0 transform backdrop-blur-sm",
        secondary: "bg-gradient-to-b from-secondary to-secondary/90 text-secondary-foreground border border-secondary-border shadow-md hover:shadow-lg active:shadow-sm hover:-translate-y-0.5 active:translate-y-0 transform",
        ghost: "border border-transparent hover:bg-gradient-to-b hover:from-accent/50 hover:to-accent/30 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transform",
      },
      size: {
        default: "min-h-10 px-6 py-3",
        sm: "min-h-8 rounded-lg px-4 py-2 text-xs",
        lg: "min-h-12 rounded-xl px-10 py-4 text-base",
        icon: "h-10 w-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
