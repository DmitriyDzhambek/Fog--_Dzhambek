import { motion } from "framer-motion";
import { Backpack, ShoppingBag } from "lucide-react";
import { GlassPanel } from "../components/GlassPanel";

type Props = { onNavigate: (key: string) => void };

const items = [
  { emoji: "🎣", title: "Удочка", rarity: "Обычный", quantity: 1, tone: "slate" },
  { emoji: "🧭", title: "Компас", rarity: "Редкий", quantity: 1, tone: "emerald" },
  { emoji: "🔦", title: "Фонарь", rarity: "Обычный", quantity: 3, tone: "slate" },
  { emoji: "💎", title: "Кристалл", rarity: "Эпический", quantity: 1, tone: "violet" },
  { emoji: "✨", title: "Светлячок", rarity: "Редкий", quantity: 3, tone: "emerald" },
  { emoji: "📦", title: "Сундук", rarity: "Эпический", quantity: 1, tone: "violet" },
];

const rarityClass = { slate: "bg-white/5 text-slate-400", emerald: "bg-emerald-300/10 text-emerald-300", violet: "bg-violet-300/10 text-violet-300" } as const;

export function BackpackScreen({ onNavigate }: Props) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-5xl space-y-5">
      <div><h2 className="flex items-center gap-2 text-2xl font-bold md:text-3xl"><Backpack className="text-emerald-300" size={25} /> Рюкзак</h2><p className="mt-1 text-sm text-slate-400">Предметы путешествия, награды и инструменты Лягушки.</p></div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((item, index) => <motion.div key={item.title} initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * .05 }}><GlassPanel className="relative rounded-3xl p-5"><div className="absolute right-3 top-3 rounded-full bg-black/30 px-2 py-1 text-[9px] font-bold text-slate-400">x{item.quantity}</div><div className="text-4xl">{item.emoji}</div><h3 className="mt-4 font-bold">{item.title}</h3><span className={`mt-2 inline-flex rounded-full px-2 py-1 text-[9px] font-bold ${rarityClass[item.tone as keyof typeof rarityClass]}`}>{item.rarity}</span></GlassPanel></motion.div>)}
      </div>
      <button onClick={() => onNavigate("shop")} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-300/25 bg-emerald-300/10 px-5 py-3 text-sm font-bold text-emerald-200 transition hover:bg-emerald-300/15"><ShoppingBag size={17} /> Открыть магазин</button>
    </motion.div>
  );
}
