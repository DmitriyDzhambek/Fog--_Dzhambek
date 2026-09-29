import { BarChart3, Home, Map, UserRound, Zap } from "lucide-react";
import { motion } from "framer-motion";

type Props = {
  active: string;
  onSelect: (key: string) => void;
};

const items = [
  { key: "home", label: "Главная", Icon: Home },
  { key: "map", label: "Карта", Icon: Map },
  { key: "deal", label: "Сделка", Icon: Zap },
  { key: "analytics", label: "Аналитика", Icon: BarChart3 },
  { key: "profile", label: "Профиль", Icon: UserRound },
];

export function BottomNav({ active, onSelect }: Props) {
  return (
    <nav className="fixed bottom-3 left-1/2 z-50 flex w-[calc(100%-24px)] max-w-2xl -translate-x-1/2 items-end gap-1 rounded-3xl border border-emerald-300/15 bg-slate-950/80 p-2 shadow-2xl shadow-black/50 backdrop-blur-2xl md:hidden">
      {items.map(({ key, label, Icon }) => {
        const deal = key === "deal";
        const selected = active === key;
        return (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className={`relative flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl py-2 text-[10px] transition ${
              selected ? "text-emerald-300" : "text-slate-400"
            } ${deal ? "-mt-7" : ""}`}
          >
            {deal ? (
              <motion.span
                whileTap={{ scale: .9 }}
                className="flex h-14 w-14 items-center justify-center rounded-full border border-emerald-200/60 bg-emerald-300 text-slate-950 shadow-[0_0_30px_rgba(67,239,179,.5)]"
              >
                <Icon size={24} strokeWidth={2.5} />
              </motion.span>
            ) : (
              <Icon size={18} />
            )}
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}