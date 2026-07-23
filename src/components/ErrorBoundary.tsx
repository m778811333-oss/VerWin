import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps { children: ReactNode; fallback: ReactNode; }
interface ErrorBoundaryState { failed: boolean; }

/** A guest is intentionally an isolated render subtree: a broken simulated app
 * must not take down the host shell or the other virtual desktops. */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): ErrorBoundaryState { return { failed: true }; }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Keep the production UI quiet while retaining a useful browser-console trail.
    console.error('[VerWin] guest render boundary', error, info.componentStack);
  }

  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}
