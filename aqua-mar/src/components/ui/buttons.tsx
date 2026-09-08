import type { ReactNode, ComponentProps } from "react";

const base =
  "inline-flex min-h-[52px] items-center justify-center gap-2.5 rounded-[18px] px-8 text-[15px] font-bold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50";

type AnchorProps = { children: ReactNode; className?: string } & ComponentProps<"a">;
type ButtonProps = { children: ReactNode; className?: string } & ComponentProps<"button">;

export function PrimaryButton({ children, className = "", ...props }: AnchorProps) {
  return (
    <a
      {...props}
      className={`${base} bg-primary text-white shadow-sm hover:scale-[1.02] hover:bg-primary-hover hover:shadow-md active:bg-primary-active ${className}`}
    >
      {children}
    </a>
  );
}

export function SecondaryButton({ children, className = "", ...props }: AnchorProps) {
  return (
    <a
      {...props}
      className={`${base} border-2 border-primary/25 bg-white text-primary hover:scale-[1.02] hover:border-primary hover:bg-celeste/40 ${className}`}
    >
      {children}
    </a>
  );
}

export function GhostButton({ children, className = "", ...props }: AnchorProps) {
  return (
    <a
      {...props}
      className={`${base} text-primary hover:bg-celeste/50 ${className}`}
    >
      {children}
    </a>
  );
}

export function SubmitButton({ children, className = "", ...props }: ButtonProps) {
  return (
    <button
      type="submit"
      {...props}
      className={`${base} w-full bg-primary text-white shadow-sm hover:scale-[1.01] hover:bg-primary-hover hover:shadow-md active:bg-primary-active ${className}`}
    >
      {children}
    </button>
  );
}
