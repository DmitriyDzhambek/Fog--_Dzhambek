import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export function DailyQuote() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const hide = window.setTimeout(() => setVisible(false), 8000);
    const interval = window.setInterval(() => {
      setVisible(true);
      window.setTimeout(() => setVisible(false), 8000);
    }, 600000);
    return () => {
      window.clearTimeout(hide);
      window.clearInterval(interval);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          className="absolute right-3 top-[68px] z-[45] flex w-[min(290px,calc(100vw-24px))] gap-3 rounded-2xl border border-emerald-200/20 bg-slate-950/90 p-3 shadow-2xl backdrop-blur-xl md:right-5 md:top-[92px] md:w-[270px]"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          transition={{ duration: 0.35 }}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-300/10 text-2xl">👨‍💼</div>
          <div className="pr-4">
            <span className="block text-[7px] font-extrabold tracking-[.12em] text-amber-300">ЦИТАТА ДНЯ · БРАЙАН ТРЕЙСИ</span>
            <b className="mt-1 block text-[10px] leading-relaxed text-slate-100">«Главное — не скорость, а уверенность в каждом шаге».</b>
          </div>
          <button className="absolute right-1 top-0 border-0 bg-transparent text-base text-slate-500" onClick={() => setVisible(false)} aria-label="Закрыть">×</button>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}