import { ChangeEvent, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, LoaderCircle, Upload, X } from "lucide-react";
import { GlassPanel } from "./GlassPanel";

type AnalysisResult = {
  is_trade?: boolean;
  ticker?: string | null;
  side?: string | null;
  entry_price?: number | null;
  current_price?: number | null;
  leverage?: number | null;
  advice?: string | null;
  reasoning?: string | null;
  action?: "HOLD" | "SELL" | string | null;
  timestamp?: string;
  trade_id?: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
};

export function DealModal({ open, onClose }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const chooseFile = () => inputRef.current?.click();

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError(null);
    setResult(null);
    setLoading(true);

    const localUrl = URL.createObjectURL(file);
    setPreviewUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return localUrl;
    });

    const formData = new FormData();
    formData.append("file", file);

    // В обычном браузере Telegram WebApp отсутствует — тогда initData пустой,
    // и FastAPI использует user_id=0 для локального теста.
    const telegramInitData =
      (window as Window & {
        Telegram?: {
          WebApp?: {
            initData?: string;
          };
        };
      }).Telegram?.WebApp?.initData ?? "";
    formData.append("init_data", telegramInitData);

    try {
      const response = await fetch("http://localhost:8000/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.detail || "Сервер не смог обработать скриншот.");
      }

      setResult(data as AnalysisResult);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Неизвестная ошибка.";
      setError(
        message.includes("Failed to fetch") || message.includes("NetworkError")
          ? "Не удалось связаться с сервером. Убедись, что Python-сервер запущен"
          : message,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setError(null);
    setResult(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-3 backdrop-blur-md md:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) handleClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: .98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: .98 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="w-full max-w-lg"
          >
            <GlassPanel className="overflow-hidden rounded-[28px] border-emerald-300/20 bg-slate-950/95 p-5 shadow-[0_25px_90px_rgba(0,0,0,.65)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[.2em] text-emerald-300">🐸 Лягушка ИИ</div>
                  <h2 className="mt-1 text-xl font-bold">Анализ сделки</h2>
                  <p className="mt-1 text-xs leading-5 text-slate-400">Пришли скриншот — сначала посмотрим, что действительно видно на экране.</p>
                </div>
                <button onClick={handleClose} disabled={loading} className="rounded-xl bg-white/5 p-2 text-slate-400 disabled:opacity-40">
                  <X size={17} />
                </button>
              </div>

              <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />

              <div className="mt-5">
                {previewUrl ? (
                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                    <img src={previewUrl} alt="Скриншот сделки" className="max-h-60 w-full object-contain" />
                  </div>
                ) : (
                  <button
                    onClick={chooseFile}
                    className="flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-emerald-300/25 bg-emerald-300/5 px-5 py-10 text-center transition hover:border-emerald-300/50 hover:bg-emerald-300/10"
                  >
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-300 text-slate-950 shadow-[0_0_30px_rgba(67,239,179,.22)]">
                      <Upload size={24} />
                    </span>
                    <span className="mt-3 text-sm font-bold text-emerald-200">Загрузить скриншот</span>
                    <span className="mt-1 text-[10px] text-slate-500">PNG, JPG, WEBP</span>
                  </button>
                )}

                {previewUrl && !loading && !result && (
                  <button onClick={chooseFile} className="mt-3 w-full rounded-2xl border border-emerald-300/20 bg-emerald-300/10 py-2.5 text-xs font-bold text-emerald-200">
                    Выбрать другой скриншот
                  </button>
                )}
              </div>

              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 rounded-2xl border border-emerald-300/15 bg-emerald-300/5 p-4">
                  <div className="flex items-center gap-3">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }} className="text-3xl">🐸</motion.div>
                    <div>
                      <div className="flex items-center gap-2 text-sm font-bold text-emerald-200"><LoaderCircle size={15} className="animate-spin" /> Лягушка анализирует…</div>
                      <div className="mt-1 text-[10px] text-slate-500">Отправляем скриншот на Python-сервер и ждём ответ ИИ.</div>
                    </div>
                  </div>
                </motion.div>
              )}

              {error && (
                <div className="mt-4 flex gap-3 rounded-2xl border border-red-300/20 bg-red-400/5 p-4 text-sm text-red-100">
                  <AlertCircle className="mt-0.5 shrink-0" size={18} />
                  <div>{error}</div>
                </div>
              )}

              {result && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-emerald-200"><CheckCircle2 size={17} /> Анализ получен</div>
                  <div className="grid grid-cols-2 gap-2">
                    <ResultCell label="Тикер" value={result.ticker || "Не определён"} />
                    <ResultCell label="Действие" value={result.action || "HOLD"} accent />
                    <ResultCell label="Сторона" value={result.side || "—"} />
                    <ResultCell label="Текущая цена" value={result.current_price != null ? String(result.current_price) : "Не указана"} />
                  </div>
                  <div className="rounded-2xl border border-emerald-300/15 bg-emerald-300/5 p-4">
                    <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Совет Лягушки</div>
                    <div className="mt-1 text-sm font-semibold text-emerald-100">{result.advice || "Данных для совета недостаточно."}</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Причина</div>
                    <div className="mt-1 text-xs leading-5 text-slate-300">{result.reasoning || "Причина не указана."}</div>
                  </div>
                </motion.div>
              )}
            </GlassPanel>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ResultCell({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="text-[9px] text-slate-500">{label}</div>
      <div className={`mt-1 truncate text-sm font-bold ${accent ? "text-emerald-200" : "text-white"}`}>{value}</div>
    </div>
  );
}
