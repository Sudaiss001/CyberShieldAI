"use client";

import { useEffect, useState, useCallback, useRef } from "react";

/**
 * Hash-based router for the CyberShield AI SPA.
 *
 * The sandbox only exposes the `/` Next.js route, so we use hash routing
 * to navigate between "pages" (e.g. `#/dashboard`, `#/login`).
 * This keeps all UI contained in a single Next.js route while preserving
 * deep-linkable URLs and natural browser back/forward navigation.
 *
 * Browser back/forward works natively because every `navigate()` updates
 * `window.location.hash`, which pushes an entry onto the browser history
 * stack. The `hashchange` listener picks up both forward and backward
 * navigation, so the UI always reflects the current URL.
 */

export function getHashPath(): string {
  if (typeof window === "undefined") return "/";
  const hash = window.location.hash.replace(/^#/, "");
  return hash || "/";
}

export function navigate(path: string) {
  if (typeof window === "undefined") return;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (getHashPath() === normalized) return;
  // Setting location.hash pushes a new history entry → browser back works.
  window.location.hash = normalized;
  // Scroll to top on forward navigation
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/**
 * Go back in browser history. Falls back to a sensible parent route
 * if there's no history to go back to (e.g. user landed on a page directly).
 */
export function goBack(fallback?: string) {
  if (typeof window === "undefined") return;
  // If we have real history to go back to, use it
  if (window.history.length > 1) {
    window.history.back();
    return;
  }
  // Otherwise navigate to the fallback (or home)
  if (fallback) {
    navigate(fallback);
  } else {
    navigate("/");
  }
}

/**
 * Go forward in browser history.
 */
export function goForward() {
  if (typeof window === "undefined") return;
  window.history.forward();
}

export function useHashRoute(): [string, (path: string) => void] {
  const [path, setPath] = useState<string>(getHashPath());

  useEffect(() => {
    const handler = () => setPath(getHashPath());
    window.addEventListener("hashchange", handler);
    // Set initial hash if empty
    if (!window.location.hash) {
      window.location.hash = "/";
    }
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  const go = useCallback((p: string) => navigate(p), []);
  return [path, go];
}

/**
 * Tracks whether the browser has back/forward history available.
 * Useful for conditionally rendering Back buttons or disabling them
 * when there's nowhere to go back to.
 */
export function useNavigationHistory() {
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const mounted = useRef(false);

  useEffect(() => {
    const update = () => {
      // history.length includes the current entry, so > 1 means there's
      // at least one entry behind us. This is an approximation — the
      // browser doesn't expose the cursor position, but it's good enough
      // for UX hints.
      setCanGoBack(window.history.length > 1);
      // We can't reliably detect forward history, so we leave it as a
      // best-guess: assume false unless the user has just navigated back.
      setCanGoForward(false);
    };
    update();
    mounted.current = true;
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);

  return { canGoBack, canGoForward };
}

/**
 * Link component helper — render an anchor that uses hash navigation.
 * Use as `<a href={hrefFor('/dashboard')} data-cyber-link>...</a>` or
 * with the <Link> component in components/shared.
 */
export function hrefFor(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `#${normalized}`;
}
