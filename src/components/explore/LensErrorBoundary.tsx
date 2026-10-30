"use client";

import { Component, type ReactNode } from "react";

// Catches a lens that throws while rendering (a stale or partial graph.json),
// so the error stays inside the lens panel and Highlights keeps working.
type Props = { fallback: () => ReactNode; children: ReactNode };
type State = { message: string | null };

export class LensErrorBoundary extends Component<Props, State> {
  state: State = { message: null };

  static getDerivedStateFromError(error: unknown): State {
    return { message: error instanceof Error ? error.message : "Unknown error" };
  }

  render() {
    return this.state.message !== null ? this.props.fallback() : this.props.children;
  }
}
