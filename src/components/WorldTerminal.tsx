import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3, Bell, BookOpen, Backpack, Bot, ChevronRight, Compass, Fish,
  Flame, Map, MessageCircle, Moon, Settings, ShoppingBag,
  Sparkles, Target, Trophy, TrendingDown, TrendingUp, X, Zap
} from "lucide-react";
import { DealModal } from "./DealModal";
import { PositionCalculator } from "./PositionCalculator";
import { Sidebar, SidebarMenuButton, type SidebarKey } from "./Sidebar";
import { DailyQuote } from "./DailyQuote";
import { MapWidgets } from "./MapWidgets";

type Panel = "home" | "map" | "achievements" | "river" | "ai" | "journal" | "backpack" | "shop" | "analytics" | "profile" | "settings" | null;

const locations = [
  { id: 1, name: "Долина Рек", short: "Старт", value: "2 175 ₽", x: 16, y: 58, open: true, icon: "🌊" },
  { id: 2, name: "Лес Дисциплины", short: "5 сделок", value: "2 500 ₽", x: 33, y: 47, open: false, icon: "🌲" },
  { id: 3, name: "Река Терпения", short: "7 дней", value: "3 200 ₽", x: 51, y: 57, open: false, icon: "🏞️" },
  { id: 4, name: "Гора Риска", short: "10 прогнозов", value: "4 000 ₽", x: 68, y: 42, open: false, icon: "⛰️" },
  { id: 5, name: "Вершина Свободы", short: "Цель", value: "16 000 000 ₽", x: 84, y: 25, open: false, icon: "👑" },
];

const nav = [
  ["home", "Лагерь", Compass],
  ["map", "Путь", Map],
  ["river", "Река", TrendingUp],
  ["ai", "Лягушка ИИ", Bot],
  ["journal", "Дневник", BookOpen],
  ["backpack", "Рюкзак", Backpack],
  ["shop", "Лавка", ShoppingBag],
] as const;

const sidebarToPanel: Record<SidebarKey, Panel> = {
  home: "home",
  map: "map",
  achievements: "achievements",
  journal: "journal",
  ai: "ai",
  backpack: "backpack",
  shop: "shop",
};

export function WorldTerminal({
  isSidebarOpen,
  setIsSidebarOpen,
  onSidebarNavigate,
}: {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  onSidebarNavigate?: (key: SidebarKey) => void;
}) {
  const [panel, setPanel] = useState<Panel>("home");
  const [dealOpen, setDealOpen] = useState(false);
  const [fish, setFish] = useState(3);
  const [flies, setFlies] = useState(5);
  const [market, setMarket] = useState<"calm" | "active" | "storm">("calm");
  const [notice, setNotice] = useState("Лагерь просыпается. Река спокойная.");
  const [night, setNight] = useState(false);

  const marketText = market === "calm" ? "спокойное течение" : market === "active" ? "светлячки активны" : "волна усиливается";
  const frogLine = useMemo(() => {
    if (market === "storm") return "Ква. Сейчас не время спешить. Сначала наблюдение, потом решение.";
    if (market === "active") return "Светлячки заметили движение. Я покажу факты, а решение останется за тобой.";
    return night ? "Вечером особенно хорошо закрывать день выводами, а не новыми сделками. Ква." : "Я рядом. Сначала наблюдаем реку, потом делаем спокойный шаг.";
  }, [market, night]);

  const act = (message: string, next: Panel = panel) => {
    setNotice(message);
    setPanel(next);
  };

  const navigateSidebar = (key: SidebarKey) => {
    setPanel(sidebarToPanel[key]);
    onSidebarNavigate?.(key);
  };

  return (
    <main className={`frog-world ${night ? "is-night" : ""}`}>
      <div className="world-art" />
      <div className="world-vignette" />
      <div className="world-atmosphere" />
      <div className="world-fireflies">
        {Array.from({ length: 13 }).map((_, i) => <i key={i} style={{ left: `${10 + ((i * 17) % 82)}%`, top: `${16 + ((i * 23) % 64)}%`, animationDelay: `${i * .33}s` }} />)}
      </div>

      <Sidebar open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onNavigate={navigateSidebar} />

      <header className="world-top">
        <div className="world-header-left">
          <SidebarMenuButton onClick={() => setIsSidebarOpen(true)} />
          <button className="world-brand" onClick={() => setPanel("home")}>
            <span className="brand-frog">🐸</span>
            <span><b>Как прекрасна жизнь</b><small>Miracle_Dzhambek · с душой Лягушки</small></span>
          </button>
        </div>

        <div className="world-location-title">
          <span>ТЕКУЩАЯ ЛОКАЦИЯ</span>
          <b>🌊 Долина Рек</b>
        </div>

        <div className="world-top-actions">
          <div className="market-pill"><span className="live-dot" /> 📈 +1.24% · MOEX</div>
          <button className="icon-glass header-notification" onClick={() => act("🔔 Уведомления проверены.")}><Bell size={18}/><i /></button>
          <button className="icon-glass desktop-only" onClick={() => setNight(v => !v)} title="День / ночь">{night ? <Sparkles size={18}/> : <Moon size={18}/>}</button>
          <button className="icon-glass desktop-only" onClick={() => setPanel("settings")}><Settings size={18}/></button>
          <button className="header-avatar" onClick={() => setPanel("profile")} aria-label="Профиль">🐸</button>
        </div>
      </header>

      <section className="camp-hud glass">
        <div className="hud-title"><span>🏕️</span><div><b>Лагерь новичка</b><small>Старт твоего пути</small></div></div>
        <div className="hud-progress"><div style={{ width: "36%" }} /></div>
        <div className="hud-money"><b>2 175 ₽</b><span>/ 6 000 ₽</span></div>
        <button onClick={() => setPanel("map")}>Текущая локация <ChevronRight size={15}/></button>
      </section>

      <div className="world-path">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M16 58 C22 53 27 50 33 47 S44 48 51 57 S61 51 68 42 S77 31 84 25" className="path-muted"/>
          <path d="M16 58 C22 53 27 50 33 47" className="path-active"/>
        </svg>
        {locations.map((loc) => (
          <motion.button
            key={loc.id}
            className={`map-node ${loc.open ? "open" : "locked"}`}
            style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: .96 }}
            onClick={() => loc.open ? setPanel("map") : act(`🐸 Лес ещё закрыт. Сначала укрепим путь до ${loc.value}.`)}
          >
            <span className="node-orb">{loc.open ? loc.icon : "🔒"}</span>
            <span><b>{loc.id}. {loc.name}</b><small>{loc.short} · {loc.value}</small></span>
          </motion.button>
        ))}
      </div>

      <div className="world-map-widgets"><MapWidgets /></div>

      <motion.div className="frog-guide" animate={{ y: market === "active" ? -8 : 0 }}>
        <div className="frog-portrait">🐸<span className="frog-aura" /></div>
        <div className="frog-copy"><span>MIRACLE_DZHAMBEK · НАСТАВНИК</span><b>{frogLine}</b></div>
      </motion.div>

      <div className="river-card glass">
        <div className="river-card-head"><div><span className="eyebrow">🌊 Живая зона</span><h2>Долина Рек</h2></div><span className={`market-state ${market}`}>{market === "calm" ? "● спокойно" : market === "active" ? "● внимание" : "● шторм"}</span></div>
        <p>Река — это рынок. Мы не угадываем её течение, мы наблюдаем его.</p>
        <div className="river-stats">
          <button onClick={() => { setFlies(v => Math.min(12, v + 1)); setMarket("active"); act("✨ Светлячки нашли движение. Открываю наблюдение.", "river"); }}>
            <Sparkles size={17}/><span><b>{flies}</b><small>Светлячки ИИ</small></span>
          </button>
          <button onClick={() => setFish(v => Math.min(10, v + 1))}>
            <Fish size={17}/><span><b>{fish}/10</b><small>Рыбы наблюдения</small></span>
          </button>
          <button onClick={() => { setMarket("storm"); act("🐸 Ква. Волна усиливается — включаю режим осторожности."); }}>
            <TrendingDown size={17}/><span><b>MOEX</b><small>режим реки</small></span>
          </button>
        </div>
      </div>

      <DailyQuote />
      <div className="world-toast"><span>●</span>{notice}</div>

      <nav className="world-dock glass">
        {nav.map(([key, label, Icon]) => (
          <button key={key} className={panel === key ? "active" : ""} onClick={() => setPanel(key)}>
            <Icon size={18}/><span>{label}</span>
          </button>
        ))}
        <button className="trade-button" onClick={() => setDealOpen(true)}><Zap size={21}/><span>Сделка</span></button>
      </nav>

      <AnimatePresence>
        {panel && panel !== "home" && (
          <motion.div className="world-panel-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(e) => e.target === e.currentTarget && setPanel("home")}>
            <motion.aside className="world-panel" initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 40, opacity: 0 }}>
              <button className="panel-close" onClick={() => setPanel("home")}><X size={18}/></button>
              <PanelContent panel={panel} onAction={act} />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <DealModal open={dealOpen} onClose={() => setDealOpen(false)} />
    </main>
  );
}

function PanelContent({ panel, onAction }: { panel: Panel; onAction: (message: string, next?: Panel) => void }) {
  if (panel === "map") return <><PanelHead icon="🗺️" title="Карта пути" subtitle="От Долины Рек к Вершине Свободы."/><div className="journey-list">{locations.map((x) => <div className={`journey-row ${x.open ? "open" : ""}`} key={x.id}><span>{x.icon}</span><div><b>{x.name}</b><small>{x.short} · {x.value}</small></div><em>{x.open ? "Открыто" : "Закрыто"}</em></div>)}</div><div className="panel-tip">🐸 Следующая остановка — Лес Дисциплины. Путь открывается действиями, а не спешкой.</div></>;
  if (panel === "achievements") return <><PanelHead icon="🏆" title="Достижения" subtitle="Маленькие шаги складываются в большой путь."/><div className="achievement-list"><div>🌱 Первый шаг <b>+1 дисциплина</b></div><div>🎣 Наблюдатель <b>3 / 10 рыб</b></div><div>✨ Светлячок <b>5 сигналов</b></div></div></>;
  if (panel === "river") return <><PanelHead icon="🌊" title="Река · наблюдение" subtitle="Сравниваем факты, а не настроение рынка."/><div className="terminal-box"><span>MOEXCNY-12.26</span><b>3 681 ₽</b><small>Демо-поток · время последней проверки — сейчас</small></div><div className="signal-box"><Sparkles/><div><b>Светлячки ИИ</b><p>Сигнал не является приказом. Лягушка сначала отделяет изображение от подтверждённых рыночных данных.</p></div></div><button className="panel-primary" onClick={() => onAction("✨ Точка наблюдения сохранена.", "journal")}>Сохранить наблюдение</button></>;
  if (panel === "ai") return <><PanelHead icon="🐸" title="Miracle_Dzhambek · Лягушка ИИ" subtitle="Спокойный наставник над торговым терминалом."/><div className="ai-dialog"><MessageCircle size={18}/><div><b>Что я делаю</b><p>Читаю скриншот, выделяю видимые факты, отдельно проверяю доступные данные и показываю неопределённость.</p></div></div><div className="ai-rules"><b>Правила Лягушки</b><span>01 · Сначала факты</span><span>02 · Потом сценарии</span><span>03 · Риск до входа</span><span>04 · Решение остаётся за тобой</span></div></>;
  if (panel === "journal") return <><PanelHead icon="📖" title="Дневник" subtitle="Твоя память о рынке и собственных решениях."/><div className="journal-entry"><span>Сегодня · 23:06</span><b>Рынок наблюдаем, не догоняем.</b><p>Проверить позицию без спешки. Записать наблюдение. Вернуться к цели.</p></div><button className="panel-primary" onClick={() => onAction("🔥 Шаг записан. +1 к дисциплине.", "journal")}>Записать сегодняшний шаг</button></>;
  if (panel === "backpack") return <><PanelHead icon="🎒" title="Рюкзак" subtitle="То, что ты собрал по дороге."/><div className="inventory-grid"><div><Fish/><b>3 / 10</b><small>Рыбы</small></div><div><Sparkles/><b>5</b><small>Светлячки</small></div><div><Trophy/><b>1</b><small>Знак пути</small></div><div><Flame/><b>6 дней</b><small>Стрик</small></div></div></>;
  if (panel === "shop") return <><PanelHead icon="🏪" title="Магазин" subtitle="Улучшения, которые помогают наблюдать, а не торопиться."/><div className="shop-row"><span>🔭</span><div><b>Бинокль реки</b><small>Открывает расширенное наблюдение</small></div><strong>120 XP</strong></div><div className="shop-row"><span>🪵</span><div><b>Костёр дисциплины</b><small>Поддерживает вечерний ритуал</small></div><strong>250 XP</strong></div></>;
  if (panel === "analytics") return <><PanelHead icon="📊" title="Торговый терминал" subtitle="Цифры живут внутри Долины, а не вместо неё."/><PositionCalculator/><div className="terminal-mini"><TrendingUp/><div><b>Текущая идея</b><span>SHORT · MOEXCNY-12.26 · 3 681 ₽</span></div><em>наблюдение</em></div></>;
  if (panel === "profile") return <><PanelHead icon="👤" title="Профиль трейдера" subtitle="Твой путь измеряется дисциплиной, не количеством сделок."/><div className="profile-hero"><span>🐸</span><div><b>Путь Лягушки</b><small>Лагерь новичка · 36%</small></div></div><div className="profile-grid"><b>18<small>сделок</small></b><b>72%<small>успех</small></b><b>1 240<small>XP</small></b><b>6<small>дней стрика</small></b></div></>;
  if (panel === "settings") return <><PanelHead icon="⚙️" title="Настройки" subtitle="Настраиваем помощника под твой ритм."/><div className="settings-row"><span>🔔</span><div><b>Уведомления</b><small>Smart Exit и контрольные точки</small></div><input type="checkbox" defaultChecked /></div><div className="settings-row"><span>🔊</span><div><b>Голос Лягушки</b><small>Подсказки наставника</small></div><input type="checkbox" /></div></>;
  return null;
}

function PanelHead({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) {
  return <div className="panel-head"><div className="panel-icon">{icon}</div><div><h2>{title}</h2><p>{subtitle}</p></div></div>;
}