import { useState } from "react";
import AccessMonitor from "./components/AccessMonitor.jsx";
import FichasPanel from "./components/FichasPanel.jsx";

const TABS = [
  { id: "monitor", label: "Monitor de acceso" },
  { id: "fichas", label: "Fichas" },
];

export default function App() {
  const [tab, setTab] = useState("monitor");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/15 text-xl">
              🎫
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">
                Control de Acceso RFID
              </h1>
              <p className="text-xs text-slate-400">Molinete — entrada principal</p>
            </div>
          </div>

          <nav className="flex gap-1 rounded-xl bg-slate-800/60 p-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  tab === t.id
                    ? "bg-sky-500 text-white shadow"
                    : "text-slate-300 hover:bg-slate-700/60"
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {tab === "monitor" ? <AccessMonitor /> : <FichasPanel />}
      </main>
    </div>
  );
}
