import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export function GlassPanel({ children, className = "" }: Props) {
  return (
    <div className={`border border-emerald-300/15 bg-slate-950/65 backdrop-blur-xl shadow-2xl shadow-black/30 ${className}`}>
      {children}
    </div>
  );
}