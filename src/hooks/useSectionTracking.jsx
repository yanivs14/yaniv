import { useEffect, useRef } from "react";
import { trackSectionViewed } from "@/lib/analytics";

/**
 * IntersectionObserver hook that fires `section_viewed` when a section
 * enters the viewport. Fires once per section per page load.
 *
 * Usage:
 *   const ref = useSectionTracking("hero");
 *   <section ref={ref}>...</section>
 */
export function useSectionTracking(sectionId, options = {}) {
  const ref = useRef(null);
  const fired = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !fired.current) {
        fired.current = true;
        const scrollDepth = Math.round(
          (window.scrollY / Math.max(document.body.scrollHeight - window.innerHeight, 1)) * 100
        );
        trackSectionViewed(sectionId, scrollDepth);
        observer.disconnect();
      }
    }, { threshold: options.threshold || 0.3 });

    observer.observe(el);
    return () => observer.disconnect();
  }, [sectionId]);

  return ref;
}