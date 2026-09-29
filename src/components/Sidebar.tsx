import { AnimatePresence, motion } from "framer-motion";
import { Award, Backpack, BookOpen, Bot, Home, Map, Menu, ShoppingBag, X } from "lucide-react";

export type SidebarKey = "home" | "map" | "achievements" | "journal" | "ai" | "backpack" | "shop";

const items = [
  ["home", "Главная", Home],
  ["map", "Карта", Map],
  ["achievements", "Достижения", Award],
  ["journal", "Дневник", BookOpen],
  ["ai", "ИИ-помощник", Bot],
  ["backpack", "Рюкзак", Backpack],
  ["shop", "Магазин", ShoppingBag],
] as const;

function SidebarContent({ onClose, onNavigate }: { onClose: () => void; onNavigate: (key: SidebarKey) => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-white/10 px-2 pb-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/10 text-2xl">🐸</div>
        <div className="flex-1"><b className="block text-xs">Как прекрасна жизнь</b><small className="mt-1 block text-[8px] text-emerald-300">Miracle_Dzhambek</small></div>
        <button className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-slate-400 md:hidden" onClick={onClose}><X size={18} /></button>
      </div>
      <nav className="grid gap-1.5 pt-5">
        {items.map(([key, label, Icon]) => (
          <button className="flex items-center gap-3 rounded-2xl border border-transparent px-3 py-3 text-left text-slate-400 transition hover:border-emerald-300/10 hover:bg-emerald-300/10 hover:text-white" key={key} onClick={() => { onNavigate(key); onClose(); }}>
            <Icon size={19} className="text-emerald-300" /><span className="text-[11px] font-bold">{label}</span>
          </button>
        ))}
      </nav>
      <div className="mt-auto flex gap-2 rounded-2xl border border-amber-300/10 bg-amber-300/5 p-3">
        <span className="text-xl">☕</span><div><b className="block text-[9px] text-amber-200">Кофе капучино</b><small className="mt-1 block text-[7px] leading-relaxed text-slate-500">Открой меню и выбери следующий шаг.</small></div>
      </div>
    </div>
  );
}

export function Sidebar({ open, onClose, onNavigate }: { open: boolean; onClose: () => void; onNavigate: (key: SidebarKey) => void }) {
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-[110] hidden w-[276px] border-r border-emerald-200/10 bg-slate-950/95 p-4 shadow-2xl backdrop-blur-xl md:block">
        <SidebarContent onClose={onClose} onNavigate={onNavigate} />
      </aside>
      <AnimatePresence>
        {open && (
          <>
            <motion.div className="fixed inset-0 z-[120] bg-black/65 backdrop-blur-sm md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
            <motion.aside className="fixed inset-y-0 left-0 z-[121] w-[min(300px,88vw)] bg-slate-950 p-4 shadow-2xl backdrop-blur-xl md:hidden" initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} transition={{ type: "spring", stiffness: 320, damping: 30 }} onTouchStart={(e) => e.currentTarget.dataset.touchX = String(e.touches[0]?.clientX ?? 0)} onTouchEnd={(e) => { const start = Number(e.currentTarget.dataset.touchX ?? 0); if (e.changedTouches[0] && e.changedTouches[0].clientX - start < -70) onClose(); }}>
              <SidebarContent onClose={onClose} onNavigate={onNavigate} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export function SidebarMenuButton({ onClick }: { onClick: () => void }) {
  return <button className="flex h-[42px] w-[42px] items-center justify-center gap-0.5 rounded-2xl border border-emerald-200/20 bg-slate-950/85 text-white shadow-lg backdrop-blur-xl" onClick={onClick} aria-label="Открыть меню"><span className="text-lg">☕</span><Menu size={17} className="text-emerald-300" /></button>;
}