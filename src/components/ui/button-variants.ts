import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[#7c3aed] text-white hover:bg-[#6d28d9]",
        secondary: "bg-[#f4f1ff] text-[#4c1d95] hover:bg-[#ede9fe]",
        outline:
          "border border-[#d9d9d6] bg-white text-[#191919] hover:bg-[#f7f6f3]",
        ghost: "text-[#37352f] hover:bg-[#f7f6f3] hover:text-[#191919]",
        destructive: "bg-rose-600 text-white hover:bg-rose-700",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        icon: "h-10 w-10 px-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);
