"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

const subscribe = () => () => undefined;

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  if (!mounted) return <span className="size-10" aria-hidden="true" />;
  const dark = resolvedTheme === "dark";
  return (
    <button
      className="grid size-10 place-items-center rounded-xl text-muted outline-none hover:bg-surface-muted focus-visible:ring-2 focus-visible:ring-accent-strong"
      type="button"
      onClick={() => setTheme(dark ? "light" : "dark")}
      aria-label={`Use ${dark ? "light" : "dark"} theme`}
    >
      {dark ? (
        <Sun className="size-4" aria-hidden="true" />
      ) : (
        <Moon className="size-4" aria-hidden="true" />
      )}
    </button>
  );
}
