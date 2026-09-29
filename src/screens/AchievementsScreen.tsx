import { motion } from "framer-motion";
import { Award, Lock } from "lucide-react";
import { GlassPanel } from "../components/GlassPanel";

const achievements = [
  { emoji: "🐟", title: "Первая рыбка", description: "Сделан первый спокойный шаг.", earned: true, date: "24.09.2026" },
  { emoji: "🧘", title: "Хладнокровный", description: "Не поддался эмоциям в сложный момент.", earned: true, date: "25.09.2026" },
  { emoji: "📊", title: "Аналитик", description: "Провёл 10 наблюдений по сделкам.", earned: true, date: "26.09.2026" },
  { emoji: "🎯", title: "Снайпер", description: "Три точных выхода подряд.", earned: false },
  { emoji: "🔥", title: "Стрик 7 дней", description: "Заглядывал в Долину семь дней подряд.", earned: false },
  { emoji: "🏔️", title: "Вершина Свободы", description: "Достиг цели 6000 ₽.", earned: false },
];

export function AchievementsScreen() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-6xl space-y-5">
      <div><h2 className="flex items-center gap-2 text-2xl font-bold md:text-3xl"><Award className="text-emerald-300" size={25} /> Достижения</h2><p className="mt-1 text-sm text-slate-400">Маленькие отметки, которые показывают твой путь.</p></div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {achievements.map((item, index) => (
          <motion.div key={item.title} initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * .05 }}>
            <GlassPanel className={`h-full rounded-3xl p-5 ${item.earned ? "border-emerald-300/40 shadow-[0_0_24px_rgba(67,239,179,.10)]" : "opacity-65"}`}>
              <div className="flex items-start justify-between"><div className="text-4xl">{item.emoji}</div>{item.earned ? <span className="rounded-full bg-emerald-300/10 px-2.5 py-1 text-[9px] font-bold text-emerald-300">ПОЛУЧЕНО</span> : <span className="flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1 text-[9px] font-bold text-slate-500"><Lock size={10} /> НЕ ПОЛУЧЕНО</span>}</div>
              <h3 className="mt-4 font-bold">{item.title}</h3><p className="mt-1 text-xs leading-5 text-slate-500">{item.description}</p>
              {item.earned && <div className="mt-4 border-t border-emerald-300/10 pt-3 text-[10px] text-emerald-300">Получено {item.date}</div>}
            </GlassPanel>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
