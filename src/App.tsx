import { useEffect, useState } from "react";
import { init, miniApp, viewport } from "@telegram-apps/sdk-react";
import { WorldTerminal } from "./components/WorldTerminal";
import type { SidebarKey } from "./components/Sidebar";

const shellStyles = `
.world-header-left{display:flex;align-items:center;gap:8px}.world-location-title{position:absolute;left:50%;transform:translateX(-50%);text-align:center;pointer-events:none}.world-location-title span{display:block;color:#7c989f;font-size:7px;letter-spacing:.18em}.world-location-title b{display:block;margin-top:3px;color:#effff9;font-size:12px}.header-avatar{display:flex;width:42px;height:42px;align-items:center;justify-content:center;border:1px solid rgba(67,239,179,.4);border-radius:14px;background:rgba(10,67,55,.9);font-size:22px;cursor:pointer}.world-map-widgets{position:absolute;z-index:22;left:50%;bottom:162px;transform:translateX(-50%);width:min(610px,44vw)}.achievement-list{display:grid;gap:8px}.achievement-list>div{display:flex;justify-content:space-between;gap:10px;padding:13px;border:1px solid rgba(255,255,255,.07);border-radius:15px;background:rgba(255,255,255,.035);color:#cfe2df;font-size:10px}.achievement-list b{color:#43efb3}
@media(min-width:901px){.frog-world{padding-left:276px}.world-top{left:296px}.camp-hud{left:296px}.world-location-title{left:calc(50% + 138px)}.world-map-widgets{left:calc(50% + 138px)}}
@media(max-width:900px){.market-pill,.desktop-only{display:none}.world-location-title{display:none}.world-map-widgets{display:block;left:8px;right:8px;bottom:258px;width:auto;transform:none}.world-map-widgets>div{overflow-x:auto}.world-map-widgets .min-w-\\[270px\\]{min-width:270px!important}}
`;

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
    const onTouchStart = (event: TouchEvent) => { startX = event.touches[0]?.clientX ?? 0; };
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

  const handleNavigate = (_key: SidebarKey) => {};

  return (
    <>
      <style>{shellStyles}</style>
      <WorldTerminal isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} onSidebarNavigate={handleNavigate} />
    </>
  );
}
