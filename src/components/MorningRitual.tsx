import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { GlassPanel } from "./GlassPanel";
import { SAVERS } from "../data/saversData";

function isMorning() {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 12;
}

export function MorningRitual() {
  const [morning, setMorning] = useState(isMorning);
  const [done, setDone] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => setMorning(isMorning()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const completed = done.length;
  const progress = useMemo(() => Math.round((completed / SAVERS.length) * 100), [completed]);

  useEffect(() => {
    if (completed === SAVERS.length && !finished) {
      setFinished(true);
    }
  }, [completed, finished]);

  if (!morning) return null;

  const toggle = (id: number) => {
    setDone((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
    setFinished(false);
  };

  return (
    <GlassPanel className="relative overflow-hidden rounded-3xl p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[.18em] text-emerald-300">
            Miracle_Dzhambek · SAVERS
          </div>
          <h2 className="mt-1 text-xl font-bold">🌅 Утренний ритуал Лягушки</h2>
          <p className="mt-1 text-xs text-slate-400">Утро — святое время. Не торгуем, а настраиваемся.</p>
        </div>
        <div className="rounded-2xl border border-emerald-300/15 bg-emerald-300/5 px-3 py-2 text-right">
          <div className="text-xs font-bold text-emerald-200">{completed}/6 пройдено</div>
          <div className="text-[10px] text-slate-500">маленький шаг сегодня</div>
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {SAVERS.map((item) => {
          const checked = done.includes(item.id);
          return (
            <motion.button
              key={item.id}
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={() => toggle(item.id)}
              className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition ${checked
                ? "border-emerald-300/35 bg-emerald-300/10"
                : "border-white/5 bg-white/[.035] hover:border-emerald-300/20"}`}
            >
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg ${checked ? "bg-emerald-300 text-slate-950" : "bg-white/5"}`}>
                {checked ? <Check size={17} /> : item.emoji}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 text-xs font-bold">
                  <span className="text-emerald-300">{item.letter}</span>{item.title}
                </span>
                <span className="mt-1 block truncate text-[10px] text-slate-500">{item.hint}</span>
              </span>
              <span className="text-[9px] font-bold text-amber-200">+{item.xp} XP</span>
            </motion.button>
          );
        })}
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-slate-500">Прогресс ритуала</span>
          <b className="text-emerald-300">+30 XP, +15₽ в фонд цели</b>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-emerald-300"
            animate={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-emerald-300/10 bg-slate-950/35 p-3">
        <div className="flex items-center gap-3">
          <motion.div
            className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-300/10 text-2xl"
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 2.4, repeat: Infinity }}
          >
            🐸
          </motion.div>
          <p className="text-xs leading-relaxed text-slate-300">
            «Ква! Маленькие шаги утром — большие результаты днём».
          </p>
        </div>
      </div>

      <AnimatePresence>
        {finished && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-slate-950/90 p-5 text-center backdrop-blur-sm"
          >
            <div>
              <div className="relative mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-300/15">
                <Sparkles className="text-emerald-300" size={30} />
                {Array.from({ length: 12 }).map((_, index) => (
                  <motion.i
                    key={index}
                    className="absolute h-1.5 w-1.5 rounded-full bg-amber-200"
                    initial={{ x: 0, y: 0, opacity: 1 }}
                    animate={{
                      x: Math.cos(index * Math.PI / 6) * 46,
                      y: Math.sin(index * Math.PI / 6) * 46,
                      opacity: 0,
                    }}
                    transition={{ duration: 0.9 }}
                  />
                ))}
              </div>
              <h3 className="text-lg font-bold">КВА! Утро началось правильно 🐸</h3>
              <p className="mt-1 text-xs text-slate-400">+30 XP и +15₽ в фонд большой цели. Никуда не спешим, босс.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassPanel>
  );
}
