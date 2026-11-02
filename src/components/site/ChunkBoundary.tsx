"use client";

import { Component, type ReactNode } from "react";

// A lazily loaded feature (the Ask panel, the game) can fail to load: a flaky connection, or a tab
// left open across a redeploy that removed the old chunk files. Without a boundary the error reaches
// the root layout and Next replaces the whole page with an error screen (fe-reviewer, V7). With it,
// only that feature is replaced by a short, polite message; the page keeps working.
export class ChunkBoundary extends Component<{ children: ReactNode; message: string; className?: string }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <p role="alert" className={this.props.className}>
        {this.props.message}
      </p>
    );
  }
}
