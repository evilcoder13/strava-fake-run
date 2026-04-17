"use client";

import { useEffect, useRef } from "react";
import { useRouteStore } from "@/store/useRouteStore";
import { encodeState, decodeState } from "@/lib/url-state";

export default function UrlSync() {
  const loadFromState = useRouteStore((state) => state.loadFromState);
  const isInitialLoad = useRef(true);

  // 1. Initial Load from URL
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const data = params.get("s");

    if (data) {
      const decoded = decodeState(data);
      if (decoded) {
        console.log("Loading state from URL...");
        loadFromState(decoded);
      }
    }
    isInitialLoad.current = false;
  }, [loadFromState]);

  // 2. Sync State to URL
  useEffect(() => {
    // We subscribe to structural changes in the store
    const unsub = useRouteStore.subscribe((state) => {
      if (isInitialLoad.current) return;

      const encoded = encodeState(state);
      const url = new URL(window.location.href);
      const currentS = url.searchParams.get("s");

      if (encoded && encoded !== currentS) {
        url.searchParams.set("s", encoded);
        window.history.replaceState({}, "", url.toString());
      }
    });

    return () => unsub();
  }, []);

  return null;
}
