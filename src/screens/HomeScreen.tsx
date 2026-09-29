import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Check, Flame, Sparkles, Target, Trophy, Zap } from "lucide-react";
import { GlassPanel } from "../components/GlassPanel";

type Props = { onNavigate: (key: string) => void };

type Task = { id: number; title: string; reward: number; done: boolean };

const initialTasks: Task[] = [
  { id: 1, title: "Проверить позицию без спешки", reward: 50, done: true },
  { id: 2, title: "Записать наблюдение в Дневник", reward: 75, done: false },
  { id: 3, title: "Посмотреть сигнал Светлячков", reward: 100, done: false },
  { id: 4, title: "Сделать один спокойный шаг", reward: 125, done: false },
];

const stats = [
  { label: "Сделок всего", value: "18", icon: Target },
  { label: "% успеха", value: "72%", icon: Trophy },
  { label: "Стрик", value: "6 дней", icon: Flame },
  { label: "XP", value: "1 240", icon: Zap },
];

export function HomeScreen({ onNavigate }: Props) {
  const [tasks, setTasks] = useState(initialTasks);

  const toggleTask = (id: number) => {
    setTasks((current) => current.map((task) => task.id === id ? { ...task, done: !task.done } : task));
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-6xl space-y-5">
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-bold md:text-3xl"><Sparkles className="text-emerald-300" size={25} /> Главная</h2>
        <p className="mt-1 text-sm text-slate-400">Твоя ежедневная точка спокойствия, дисциплины и маленьких побед.</p>
      </div>

      <GlassPanel className="overflow-hidden rounded-3xl p-5 md:p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="max-w-3xl">
            <div className="text-[10px] font-bold uppercase tracking-[.2em] text-emerald-300">Совет дня от Лягушки</div>
            <blockquote className="mt-3 text-xl font-semibold leading-8 text-white md:text-2xl">«Сначала наблюдай реку. Хорошая сделка начинается не с кнопки, а с понимания того, что ты видишь.»</blockquote>
            <p className="mt-3 text-xs text-slate-400">🐸 Сегодня Лягушка напоминает: отделяй факты от предположений.</p>
          </div>
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl border border-emerald-300/20 bg-emerald-300/10 text-5xl shadow-[0_0_35px_rgba(67,239,179,.12)]">🐸</div>
        </div>
      </GlassPanel>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
        <GlassPanel className="rounded-3xl p-5">
          <div className="flex items-center justify-between gap-3">
            <div><h3 className="text-lg font-bold">Ежедневные задания</h3><p className="mt-1 text-xs text-slate-500">Небольшие действия дают большой стрик.</p></div>
            <div className="rounded-xl bg-emerald-300/10 px-3 py-2 text-xs font-bold text-emerald-300">+350 ₽</div>
          </div>
          <div className="mt-4 space-y-2">
            {tasks.map((task) => (
              <button key={task.id} onClick={() => toggleTask(task.id)} className="flex w-full items-center gap-3 rounded-2xl border border-white/5 bg-white/[.035] p-3 text-left transition hover:border-emerald-300/20 hover:bg-white/[.055]">
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${task.done ? "border-emerald-300 bg-emerald-300 text-slate-950" : "border-slate-600 bg-slate-900/70 text-transparent"}`}><Check size={15} /></span>
                <span className={`flex-1 text-sm ${task.done ? "text-slate-500 line-through" : "text-slate-200"}`}>{task.title}</span>
                <span className="text-xs font-bold text-amber-200">+{task.reward} ₽</span>
              </button>
            ))}
          </div>
        </GlassPanel>

        <GlassPanel className="rounded-3xl p-5">
          <div><h3 className="text-lg font-bold">Моя статистика</h3><p className="mt-1 text-xs text-slate-500">Твой прогресс за всё время.</p></div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {stats.map(({ label, value, icon: Icon }, index) => (
              <motion.div key={label} initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * .06 }} className="rounded-2xl border border-white/5 bg-white/[.035] p-4">
                <Icon size={17} className="text-emerald-300" />
                <div className="mt-3 text-xl font-bold">{value}</div>
                <div className="mt-1 text-[10px] text-slate-500">{label}</div>
              </motion.div>
            ))}
          </div>
        </GlassPanel>
      </div>

      <button onClick={() => onNavigate("journal")} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-300/25 bg-emerald-300/10 px-5 py-3 text-sm font-bold text-emerald-200 transition hover:bg-emerald-300/15">
        <BookOpen size={17} /> Открыть Дневник
      </button>
    </motion.div>
  );
}
