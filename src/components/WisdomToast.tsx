import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Lightbulb } from "lucide-react";
import { GlassPanel } from "./GlassPanel";

const WISDOMS = [
  { author: "Трейси · принцип", text: "Большая цель становится ближе, когда сегодня сделан один понятный шаг." },
  { author: "Элрод · Магия утра", text: "Утро задаёт направление дню. Сначала настрой себя, потом открывай рынок." },
  { author: "Трейдер · правило пути", text: "Дисциплина важнее попытки угадать каждое движение рынка." },
  { author: "Miracle_Dzhambek", text: "🐸 Ква. В мире всё возможно. Главное — начать с малого." },
];

export function WisdomToast() {
  const [visible, setVisible] = useState(true);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const hide = window.setTimeout(() => setVisible(false), 5_000);
    const hourly = window.setInterval(() => {
      setIndex((current) => (current + 1) % WISDOMS.length);
      setVisible(true);
      window.setTimeout(() => setVisible(false), 5_000);
    }, 3_600_000);

    return () => {
      window.clearTimeout(hide);
      window.clearInterval(hourly);
    };
  }, []);

  const wisdom = WISDOMS[index];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed bottom-24 left-1/2 z-[80] w-[min(92vw,520px)] -translate-x-1/2"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 18 }}
        >
          <GlassPanel className="rounded-2xl p-3 shadow-2xl shadow-black/40">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-300/10">
                <Lightbulb size={18} className="text-amber-200" />
              </div>
              <div className="min-w-0">
                <div className="text-[9px] font-bold uppercase tracking-[.16em] text-emerald-300">
                  🐸 Мудрость пути
                </div>
                <p className="mt-1 text-xs leading-relaxed text-slate-200">{wisdom.text}</p>
                <span className="mt-1 block text-[9px] text-slate-500">{wisdom.author}</span>
              </div>
            </div>
          </GlassPanel>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
