import { useEffect } from "react";
import { init, miniApp, viewport } from "@telegram-apps/sdk-react";
import { WorldTerminal } from "./components/WorldTerminal";

export default function App() {
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

  return <WorldTerminal />;
}
