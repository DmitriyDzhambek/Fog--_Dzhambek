import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Sparkles, Zap } from "lucide-react";
import { GlassPanel } from "../components/GlassPanel";

const initialMessages = [
  { id: 1, from: "frog", text: "Ква! Я готова разобрать твоё наблюдение. Сначала посмотрим факты, затем — подтверждение MOEX." },
  { id: 2, from: "user", text: "Лягушка, на что обратить внимание в этой позиции?" },
  { id: 3, from: "frog", text: "На направление, цену входа и то, подтверждается ли сценарий вторым наблюдением. Я не буду придумывать то, чего нет на скриншоте." },
  { id: 4, from: "user", text: "Понял. Буду ждать подтверждение." },
];

export function AssistantScreen() {
  const [messages, setMessages] = useState(initialMessages);
  const [text, setText] = useState("");

  const send = () => {
    const value = text.trim();
    if (!value) return;
    setMessages((current) => [...current, { id: Date.now(), from: "user", text: value }, { id: Date.now() + 1, from: "frog", text: "Ква! Приняла. В реальном режиме я сверю факты со скриншота и отдельно покажу, что подтверждает рынок." }]);
    setText("");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto flex max-w-5xl flex-col gap-5">
      <div><h2 className="flex items-center gap-2 text-2xl font-bold md:text-3xl"><Sparkles className="text-emerald-300" size={25} /> ИИ-помощник</h2><p className="mt-1 text-sm text-slate-400">Спокойный диалог с Лягушкой — пока на мок-данных.</p></div>
      <GlassPanel className="rounded-3xl border-emerald-300/20 p-4"><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-300/10 text-2xl">✨</div><div><div className="font-bold">Светлячки ИИ: <span className="text-emerald-300">5 активных сигналов</span></div><div className="mt-1 text-[10px] text-slate-500">Сигналы показывают, где стоит обратить внимание на данные.</div></div><Zap className="ml-auto text-emerald-300" size={18} /></div></GlassPanel>
      <GlassPanel className="flex min-h-[520px] flex-col rounded-3xl p-4 md:p-5">
        <div className="flex-1 space-y-4 overflow-auto pr-1">
          {messages.map((message, index) => {
            const frog = message.from === "frog";
            return <motion.div key={message.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .03 }} className={`flex ${frog ? "justify-start" : "justify-end"}`}>
              <div className={`flex max-w-[88%] items-end gap-2 ${frog ? "" : "flex-row-reverse"}`}><div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${frog ? "bg-emerald-300/10" : "bg-white/5"}`}>{frog ? "🐸" : "👤"}</div><div className={`rounded-2xl px-4 py-3 text-sm leading-6 ${frog ? "rounded-bl-md border border-emerald-300/10 bg-emerald-300/[.06] text-slate-200" : "rounded-br-md bg-white/[.07] text-slate-300"}`}>{message.text}</div></div>
            </motion.div>;
          })}
        </div>
        <div className="mt-4 flex gap-2 rounded-2xl border border-white/10 bg-black/20 p-2"><input value={text} onChange={(event) => setText(event.target.value)} onKeyDown={(event) => event.key === "Enter" && send()} placeholder="Спроси Лягушку..." className="min-w-0 flex-1 bg-transparent px-3 text-sm text-white outline-none placeholder:text-slate-600" /><button onClick={send} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-300 text-slate-950"><Send size={17} /></button></div>
      </GlassPanel>
    </motion.div>
  );
}
