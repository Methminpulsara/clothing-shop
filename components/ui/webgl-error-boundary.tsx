"use client";

import { Component, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type BoundaryProps = { children: ReactNode; fallback: ReactNode };

export class WebGLErrorBoundary extends Component<BoundaryProps, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.warn("WebGL component failed, showing fallback.", error);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/** Static monochrome stand-in used when WebGL is unavailable. */
export function WebGLFallback({
  className,
  message,
  children,
}: {
  className?: string;
  message?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "bg-[radial-gradient(120%_90%_at_30%_20%,#2a2a2d_0%,#121213_55%,#0b0b0c_100%)]",
        className,
      )}
      role={message ? "status" : undefined}
    >
      {message ? <p className="sr-only">{message}</p> : null}
      {children}
    </div>
  );
}
