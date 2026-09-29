import { useEffect, useState } from "react";
import { init, miniApp, viewport } from "@telegram-apps/sdk-react";
import { WorldTerminal } from "./components/WorldTerminal";
import type { SidebarKey } from "./components/Sidebar";

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    try {
      init();
      const vp = viewport as unknown as { mountSync?: () => void; expand?: () => void };
      miniApp.mountSync?.();
      vp.mountSync?.();
      vp.expand?.();
    } catch {
      // Browser preview: Telegram APIs are unavailable.
    }
  }, []);

  useEffect(() => {
    let startX = 0;
    const onTouchStart = (event: TouchEvent) => {
      startX = event.touches[0]?.clientX ?? 0;
    };
    const onTouchEnd = (event: TouchEvent) => {
      const endX = event.changedTouches[0]?.clientX ?? 0;
      if (startX < 28 && endX - startX > 70) setIsSidebarOpen(true);
    };
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  const handleNavigate = (key: SidebarKey) => {
    if (key === "home") return;
    // WorldTerminal maps the shared sidebar vocabulary to its panels.
  };

  return (
    <WorldTerminal
      isSidebarOpen={isSidebarOpen}
      setIsSidebarOpen={setIsSidebarOpen}
      onSidebarNavigate={handleNavigate}
    />
  );
}
