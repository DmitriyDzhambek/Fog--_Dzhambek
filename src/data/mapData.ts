export type MapLocation = {
  id: number;
  title: string;
  subtitle: string;
  emoji: string;
  targetRub: number;
  unlocked: boolean;
  wisdom: string;
};

export const MAP_LOCATIONS: MapLocation[] = [
  {
    id: 1,
    title: "Долина Рек",
    subtitle: "Старт",
    emoji: "🌊",
    targetRub: 2175,
    unlocked: true,
    wisdom: "Ква. Вода не спорит с берегами. Так и ты — будь гибким.",
  },
  {
    id: 2,
    title: "Лес Дисциплины",
    subtitle: "5 сделок",
    emoji: "🌲",
    targetRub: 2500,
    unlocked: false,
    wisdom: "Каждое утро — маленький шаг. За год — 365 шагов.",
  },
  {
    id: 3,
    title: "Река Терпения",
    subtitle: "7 дней",
    emoji: "🏞️",
    targetRub: 3200,
    unlocked: false,
    wisdom: "Ква. Не всякая волна требует ответа. Иногда лучший шаг — подождать.",
  },
  {
    id: 4,
    title: "Гора Риска",
    subtitle: "10 прогнозов",
    emoji: "⛰️",
    targetRub: 4000,
    unlocked: false,
    wisdom: "Риск — не враг. Он становится понятнее, когда ты знаешь цену своего шага.",
  },
  {
    id: 5,
    title: "Вершина Свободы",
    subtitle: "Цель 16М",
    emoji: "👑",
    targetRub: 16000000,
    unlocked: false,
    wisdom: "Ты здесь. Потому что шёл каждый день.",
  },
];
