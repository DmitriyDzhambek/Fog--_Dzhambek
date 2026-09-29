import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Coins, Crown, ShoppingBag, Sparkles, Zap } from "lucide-react";
import { GlassPanel } from "../components/GlassPanel";

type Product = { id: number; title: string; description: string; price: number; emoji: string; icon: typeof Sparkles };

const sections: { title: string; icon: typeof Sparkles; products: Product[] }[] = [
  { title: "Скины для Лягушки", icon: Sparkles, products: [
    { id: 1, title: "Неоновая Лягушка", description: "Светится в ночной Долине.", price: 250, emoji: "🐸", icon: Sparkles },
    { id: 2, title: "Исследователь", description: "Новый стиль путешественника.", price: 450, emoji: "🧢", icon: Sparkles },
  ] },
  { title: "Бусты", icon: Zap, products: [
    { id: 3, title: "Ускорение XP", description: "+25% XP на один день.", price: 180, emoji: "⚡", icon: Zap },
    { id: 4, title: "Светлячки ×5", description: "Добавляет пять мок-сигналов.", price: 320, emoji: "✨", icon: Zap },
  ] },
  { title: "Премиум", icon: Crown, products: [
    { id: 5, title: "Лагерь Премиум", description: "Особая рамка и статус лагеря.", price: 900, emoji: "🏕️", icon: Crown },
    { id: 6, title: "Золотой Компас", description: "Редкий предмет коллекции.", price: 1200, emoji: "🧭", icon: Crown },
  ] },
];

export function ShopScreen() {
  const [balance, setBalance] = useState(2175);
  const [bought, setBought] = useState<number[]>([]);

  const buy = (product: Product) => {
    if (bought.includes(product.id) || balance < product.price) return;
    setBalance((value) => value - product.price);
    setBought((value) => [...value, product.id]);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-6xl space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="flex items-center gap-2 text-2xl font-bold md:text-3xl"><ShoppingBag className="text-emerald-300" size={25} /> Магазин</h2><p className="mt-1 text-sm text-slate-400">Предметы и улучшения для твоего лагеря.</p></div><div className="flex items-center gap-2 rounded-2xl border border-amber-200/15 bg-amber-200/5 px-4 py-3"><Coins size={17} className="text-amber-200" /><span className="text-xs text-slate-500">Баланс</span><b className="text-amber-200">{balance.toLocaleString("ru-RU")} ₽</b></div></div>
      {sections.map((section) => { const Icon = section.icon; return <section key={section.title}><div className="mb-3 flex items-center gap-2 text-sm font-bold"><Icon size={17} className="text-emerald-300" /> {section.title}</div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{section.products.map((product, index) => { const purchased = bought.includes(product.id); const canBuy = balance >= product.price; return <motion.div key={product.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .04 }}><GlassPanel className="h-full rounded-3xl p-5"><div className="flex items-start justify-between"><div className="text-4xl">{product.emoji}</div>{purchased && <span className="rounded-full bg-emerald-300/10 p-2 text-emerald-300"><Check size={13} /></span>}</div><h3 className="mt-4 font-bold">{product.title}</h3><p className="mt-1 min-h-10 text-xs leading-5 text-slate-500">{product.description}</p><div className="mt-4 flex items-center justify-between gap-3"><span className="text-sm font-bold text-amber-200">{product.price.toLocaleString("ru-RU")} ₽</span><button disabled={purchased || !canBuy} onClick={() => buy(product)} className={`rounded-xl px-3 py-2 text-xs font-bold ${purchased ? "bg-emerald-300/10 text-emerald-300" : canBuy ? "bg-emerald-300 text-slate-950" : "bg-white/5 text-slate-600"}`}>{purchased ? "Куплено" : canBuy ? "Купить" : "Не хватает"}</button></div></GlassPanel></motion.div>; })}</div></section>; })}
    </motion.div>
  );
}
