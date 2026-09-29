import { motion } from "framer-motion";
import { CheckCircle2, Compass, Lock, Map as MapIcon } from "lucide-react";
import { GlassPanel } from "../components/GlassPanel";

type Props = { onNavigate?: (key: string) => void };

const locations = [
  { id: 1, title: "Долина Рек", target: 2175, progress: 100, unlocked: true, text: "Наблюдение и первый спокойный шаг." },
  { id: 2, title: "Лес Дисциплины", target: 2500, progress: 40, unlocked: true, text: "Учимся повторять полезные действия." },
  { id: 3, title: "Река Терпения", target: 3200, progress: 0, unlocked: false, text: "Следующая глава откроется позже." },
  { id: 4, title: "Гора Риска", target: 4000, progress: 0, unlocked: false, text: "Зона, где особенно важны правила." },
  { id: 5, title: "Вершина Свободы", target: 6000, progress: 0, unlocked: false, text: "Финальная точка маршрута." },
];

export function MapScreen({ onNavigate }: Props) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-6xl space-y-5">
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-bold md:text-3xl"><MapIcon className="text-emerald-300" size={25} /> Карта</h2>
        <p className="mt-1 text-sm text-slate-400">Пять точек пути от лагеря новичка до Вершины Свободы.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
        <GlassPanel className="relative min-h-[440px] overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-[url('/valley-bg.jpg')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/15 via-slate-950/30 to-slate-950/90" />
          <div className="relative z-10 flex h-full min-h-[440px] flex-col justify-between p-5 md:p-6">
            <div className="flex items-center justify-between">
              <div className="rounded-2xl border border-emerald-300/20 bg-slate-950/65 px-4 py-3 backdrop-blur-xl">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-emerald-300"><Compass size={14} /> Лагерь новичка</div>
                <div className="mt-1 text-lg font-bold">2175 ₽ <span className="text-slate-500">/ 6000 ₽</span></div>
              </div>
              <div className="hidden rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-2 text-right text-[10px] text-slate-300 backdrop-blur-xl sm:block">Река спокойна<br /><span className="text-emerald-300">5 Светлячков</span></div>
            </div>
            <div className="flex items-end justify-between gap-4">
              <div className="max-w-sm rounded-2xl border border-white/10 bg-slate-950/65 p-4 backdrop-blur-xl">
                <div className="text-[10px] uppercase tracking-[.18em] text-emerald-300">Текущая локация</div>
                <div className="mt-1 text-xl font-bold">Долина Рек</div>
                <p className="mt-2 text-xs leading-5 text-slate-400">Река — метафора рынка. Сначала наблюдаем, затем действуем.</p>
              </div>
              <div className="text-5xl drop-shadow-[0_0_24px_rgba(67,239,179,.35)]">🐸</div>
            </div>
          </div>
        </GlassPanel>

        <div className="space-y-3">
          {locations.map((location, index) => (
            <motion.div key={location.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * .06 }} className={`rounded-3xl border p-4 ${location.unlocked ? "border-emerald-300/15 bg-slate-950/55" : "border-white/5 bg-white/[.025]"}`}>
              <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${location.unlocked ? "bg-emerald-300/10 text-emerald-300" : "bg-white/5 text-slate-600"}`}>
                  {location.unlocked ? <CheckCircle2 size={19} /> : <Lock size={17} />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-bold">{location.id}. {location.title}</h3><span className="text-xs font-bold text-amber-200">{location.target.toLocaleString("ru-RU")} ₽</span></div>
                  <p className="mt-1 text-[11px] text-slate-500">{location.text}</p>
                  <div className="mt-3 flex items-center gap-3"><div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10"><motion.div initial={{ width: 0 }} animate={{ width: `${location.progress}%` }} className="h-full rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(67,239,179,.65)]" /></div><span className="w-10 text-right text-[10px] font-bold text-slate-400">{location.progress}%</span></div>
                  {location.unlocked ? <button onClick={() => onNavigate?.(location.id === 1 ? "home" : "journal")} className="mt-3 rounded-xl border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-xs font-bold text-emerald-200">Начать</button> : <div className="mt-3 inline-flex items-center gap-1 text-[10px] text-slate-600"><Lock size={11} /> Заблокировано</div>}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
