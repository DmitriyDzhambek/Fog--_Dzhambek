import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Bell, BookOpen, Home, Map, Package, ShoppingBag, Sparkles, Trophy, UserRound,
} from "lucide-react";
import { init, miniApp, viewport } from "@telegram-apps/sdk-react";
import { BottomNav } from "./components/BottomNav";
import { DealModal } from "./components/DealModal";
import { HomeScreen } from "./screens/HomeScreen";
import { MapScreen } from "./screens/MapScreen";
import { AchievementsScreen } from "./screens/AchievementsScreen";
import { JournalScreen } from "./screens/JournalScreen";
import { AssistantScreen } from "./screens/AssistantScreen";
import { BackpackScreen } from "./screens/BackpackScreen";
import { ShopScreen } from "./screens/ShopScreen";

const sidebar = [
  ["home", "Главная", Home],
  ["map", "Карта", Map],
  ["achievements", "Достижения", Trophy],
  ["journal", "Дневник", BookOpen],
  ["ai", "ИИ-помощник", Sparkles],
  ["backpack", "Рюкзак", Package],
  ["shop", "Магазин", ShoppingBag],
] as const;

function ScreenView({ activeNav, onNavigate }: { activeNav: string; onNavigate: (key: string) => void }) {
  switch (activeNav) {
    case "map": return <MapScreen onNavigate={onNavigate} />;
    case "achievements": return <AchievementsScreen />;
    case "journal": return <JournalScreen />;
    case "ai": return <AssistantScreen />;
    case "backpack": return <BackpackScreen onNavigate={onNavigate} />;
    case "shop": return <ShopScreen />;
    case "analytics": return <HomeScreen onNavigate={onNavigate} />;
    case "profile": return <HomeScreen onNavigate={onNavigate} />;
    case "home":
    default: return <HomeScreen onNavigate={onNavigate} />;
  }
}

export default function App() {
  const [activeNav, setActiveNav] = useState("home");
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);

  useEffect(() => {
    try {
      init();
      const vp = viewport as unknown as { mountSync?: () => void; expand?: () => void };
      miniApp.mountSync?.();
      vp.mountSync?.();
      vp.expand?.();
    } catch {
      // Browser development mode: Telegram APIs are unavailable.
    }
  }, []);

  const navigate = (key: string) => {
    if (key === "deal") {
      setIsDealModalOpen(true);
      return;
    }
    setActiveNav(key);
  };

  return (
    <main className="min-h-screen bg-[#02090f] text-white">
      <div className="relative min-h-screen overflow-x-hidden">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_65%_15%,rgba(67,239,179,.09),transparent_26%),linear-gradient(180deg,#06131a,#02090f)]" />

        <header className="relative z-20 flex items-center justify-between border-b border-white/5 bg-slate-950/50 px-4 py-3 backdrop-blur-xl md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-300/25 bg-emerald-300/10 text-xl shadow-[0_0_24px_rgba(67,239,179,.12)]">🐸</div>
            <div><h1 className="text-sm font-bold text-emerald-200 md:text-base">Как прекрасна жизнь</h1><p className="text-[10px] text-slate-400 md:text-xs">Инвестиции • Дисциплина • Свобода</p></div>
          </div>
          <div className="flex items-center gap-2"><button aria-label="Уведомления" className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-slate-300"><Bell size={17} /></button><button aria-label="Профиль" onClick={() => setActiveNav("profile")} className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-slate-300"><UserRound size={17} /></button></div>
        </header>

        <div className="relative mx-auto flex max-w-[1600px]">
          <aside className="hidden min-h-[calc(100vh-65px)] w-56 shrink-0 border-r border-white/5 bg-slate-950/25 p-4 md:block">
            <div className="mb-5 rounded-2xl border border-emerald-300/10 bg-emerald-300/5 p-4"><div className="text-xs text-slate-400">Твой путь</div><div className="mt-1 text-xl font-bold text-emerald-200">2175 ₽</div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[36%] rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(67,239,179,.7)]" /></div><div className="mt-2 text-[10px] text-slate-500">Лагерь новичка · 36%</div></div>
            <nav className="space-y-1">{sidebar.map(([key, label, Icon]) => <button key={key} onClick={() => setActiveNav(key)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-xs transition ${activeNav === key ? "bg-emerald-300/10 text-emerald-200" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}><Icon size={17} />{label}</button>)}</nav>
          </aside>

          <section className="relative min-h-[calc(100vh-65px)] flex-1 p-3 pb-24 md:p-6 md:pb-8">
            <motion.div key={activeNav} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="relative rounded-[28px] border border-emerald-300/10 bg-[#07151b]/80 p-4 shadow-2xl shadow-black/40 backdrop-blur-sm md:p-6">
              <ScreenView activeNav={activeNav} onNavigate={navigate} />
            </motion.div>
          </section>
        </div>

        <DealModal open={isDealModalOpen} onClose={() => setIsDealModalOpen(false)} />
        <BottomNav active={activeNav} onSelect={navigate} />
      </div>
    </main>
  );
}
