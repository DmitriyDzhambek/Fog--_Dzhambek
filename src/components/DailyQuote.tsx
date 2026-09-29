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
          className="daily-quote"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          transition={{ duration: 0.35 }}
        >
          <div className="daily-quote-avatar">👨‍💼</div>
          <div>
            <span>ЦИТАТА ДНЯ · БРАЙАН ТРЕЙСИ</span>
            <b>«Главное — не скорость, а уверенность в каждом шаге».</b>
          </div>
          <button onClick={() => setVisible(false)} aria-label="Закрыть">×</button>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}