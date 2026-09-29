import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, ChevronDown, ChevronUp, TrendingDown, TrendingUp } from "lucide-react";
import { GlassPanel } from "../components/GlassPanel";

type Filter = "all" | "profit" | "loss";

type Entry = { id: number; date: string; ticker: "SRU6" | "BRU6"; side: "LONG" | "SHORT"; advice: string; result: number; price: string; note: string };

const entries: Entry[] = [
  { id: 1, date: "28.09.2026 · 14:20", ticker: "SRU6", side: "LONG", advice: "Сначала дождись подтверждения движения.", result: 84, price: "72.41", note: "Движение подтвердилось, выход выполнен спокойно." },
  { id: 2, date: "27.09.2026 · 11:05", ticker: "BRU6", side: "SHORT", advice: "Риск выше обычного — уменьши спешку.", result: -42, price: "68.92", note: "Сигнал оказался слабее ожиданий, позиция закрыта по плану." },
  { id: 3, date: "26.09.2026 · 16:45", ticker: "SRU6", side: "SHORT", advice: "Наблюдение важнее количества сделок.", result: 126, price: "73.18", note: "Вторая точка наблюдения подтвердила сценарий." },
  { id: 4, date: "25.09.2026 · 13:12", ticker: "BRU6", side: "LONG", advice: "Не добавляй риск без нового факта.", result: 61, price: "69.44", note: "Выход выполнен после появления подтверждающего сигнала." },
  { id: 5, date: "24.09.2026 · 10:30", ticker: "SRU6", side: "LONG", advice: "Спокойный вход лучше импульсивного.", result: -35, price: "71.96", note: "Позиция закрыта с небольшим минусом, правило риска соблюдено." },
  { id: 6, date: "23.09.2026 · 15:10", ticker: "BRU6", side: "SHORT", advice: "Сначала факты со скриншота, потом вывод.", result: 93, price: "68.51", note: "Сделка совпала с наблюдаемым сценарием." },
];

export function JournalScreen() {
  const [filter, setFilter] = useState<Filter>("all");
  const [openId, setOpenId] = useState<number | null>(null);
  const filtered = useMemo(() => entries.filter((entry) => filter === "all" || (filter === "profit" ? entry.result > 0 : entry.result < 0)), [filter]);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-5xl space-y-5">
      <div><h2 className="flex items-center gap-2 text-2xl font-bold md:text-3xl"><BookOpen className="text-emerald-300" size={25} /> Дневник</h2><p className="mt-1 text-sm text-slate-400">История наблюдений и сделок — без лишнего шума.</p></div>
      <div className="flex flex-wrap gap-2"><span className="mr-1 self-center text-[10px] uppercase tracking-[.18em] text-slate-600">Фильтр</span>{([["all", "Все"], ["profit", "Прибыльные"], ["loss", "Убыточные"]] as const).map(([key, label]) => <button key={key} onClick={() => setFilter(key)} className={`rounded-xl px-3 py-2 text-xs font-bold ${filter === key ? "bg-emerald-300 text-slate-950" : "border border-white/10 bg-white/5 text-slate-400"}`}>{label}</button>)}</div>
      <div className="space-y-3">
        {filtered.map((entry, index) => {
          const positive = entry.result > 0;
          const open = openId === entry.id;
          return <motion.div key={entry.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .04 }}>
            <GlassPanel className="overflow-hidden rounded-3xl">
              <button onClick={() => setOpenId(open ? null : entry.id)} className="w-full p-4 text-left md:p-5">
                <div className="flex flex-wrap items-center gap-3"><div className="min-w-[65px] rounded-xl bg-white/5 px-2.5 py-2 text-center font-bold text-emerald-200">{entry.ticker}</div><span className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${entry.side === "LONG" ? "bg-emerald-300/10 text-emerald-300" : "bg-rose-300/10 text-rose-300"}`}>{entry.side}</span><span className="text-[10px] text-slate-600">{entry.date}</span><span className={`ml-auto flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${positive ? "bg-emerald-300/10 text-emerald-300" : "bg-rose-300/10 text-rose-300"}`}>{positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}{positive ? "+" : ""}{entry.result} ₽</span>{open ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}</div>
                <p className="mt-3 text-sm text-slate-300">🐸 {entry.advice}</p>
              </button>
              <AnimatePresence initial={false}>{open && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="border-t border-white/5 px-4 pb-5 pt-4 md:px-5"><div className="grid gap-2 sm:grid-cols-3"><div className="rounded-2xl bg-white/[.035] p-3"><div className="text-[9px] text-slate-600">Цена наблюдения</div><div className="mt-1 font-bold">{entry.price}</div></div><div className="rounded-2xl bg-white/[.035] p-3"><div className="text-[9px] text-slate-600">Направление</div><div className="mt-1 font-bold">{entry.side}</div></div><div className="rounded-2xl bg-white/[.035] p-3"><div className="text-[9px] text-slate-600">Результат</div><div className={`mt-1 font-bold ${positive ? "text-emerald-300" : "text-rose-300"}`}>{positive ? "+" : ""}{entry.result} ₽</div></div></div><p className="mt-3 text-xs leading-5 text-slate-400">{entry.note}</p></div></motion.div>}</AnimatePresence>
            </GlassPanel>
          </motion.div>;
        })}
      </div>
    </motion.div>
  );
}
