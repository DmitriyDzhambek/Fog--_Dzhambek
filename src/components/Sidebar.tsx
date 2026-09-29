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

export function Sidebar({
  open,
  onClose,
  onNavigate,
}: {
  open: boolean;
  onClose: () => void;
  onNavigate: (key: SidebarKey) => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="sidebar-drawer"
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            onTouchStart={(e) => e.currentTarget.dataset.touchX = String(e.touches[0]?.clientX ?? 0)}
            onTouchEnd={(e) => {
              const start = Number(e.currentTarget.dataset.touchX ?? 0);
              if (e.changedTouches[0] && e.changedTouches[0].clientX - start < -70) onClose();
            }}
          >
            <div className="sidebar-head">
              <div className="sidebar-logo">🐸</div>
              <div><b>Как прекрасна жизнь</b><small>Miracle_Dzhambek</small></div>
              <button className="sidebar-close" onClick={onClose}><X size={18} /></button>
            </div>
            <nav className="sidebar-nav">
              {items.map(([key, label, Icon]) => (
                <button key={key} onClick={() => { onNavigate(key); onClose(); }}>
                  <Icon size={19} />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
            <div className="sidebar-tip">
              <span>☕</span>
              <div><b>Кофе капучино</b><small>Открой меню и выбери следующий шаг.</small></div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export function SidebarMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="cappuccino-button" onClick={onClick} aria-label="Открыть меню">
      <span>☕</span>
      <Menu size={17} />
    </button>
  );
}