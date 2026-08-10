"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

function isModifiedClick(event: MouseEvent) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
}

function RouteProgressInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, setPending] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (isModifiedClick(event)) return;
      const target = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(target instanceof HTMLAnchorElement)) return;
      if (target.target && target.target !== "_self") return;

      const url = new URL(target.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      if (target.hasAttribute("download")) return;

      setPending(true);
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  useEffect(() => {
    if (!pending) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setPending(false), 150);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [pathname, searchParams, pending]);

  if (!pending) return null;

  return (
    <div className="fixed left-0 right-0 top-0 z-[100] h-1 overflow-hidden bg-primary/10" role="status" aria-label="?ang chuy?n trang">
      <div className="h-full w-1/2 animate-[route-progress_1.1s_ease-in-out_infinite] rounded-r-full bg-primary shadow-[0_0_16px_rgb(70_72_212/0.55)]" />
    </div>
  );
}

export function RouteProgress() {
  return (
    <Suspense fallback={null}>
      <RouteProgressInner />
    </Suspense>
  );
}
