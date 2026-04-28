"use client";

import { useEffect, useRef } from "react";

/**
 * Returns a ref to attach to a sentinel element. When the sentinel scrolls
 * into view, `onIntersect` is called. Useful for "load more on scroll".
 */
export function useInfiniteScroll<T extends HTMLElement = HTMLDivElement>(
  onIntersect: () => void,
  enabled: boolean,
  rootMargin = "200px",
) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            onIntersect();
            break;
          }
        }
      },
      { rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [onIntersect, enabled, rootMargin]);

  return ref;
}
