import { useCallback, useEffect, useState } from "react";
import { api } from "../api";

const POLL_MS = 2000;

function formatHora(iso) {
  return new Date(iso).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatFecha(iso) {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function nombreDelLog(log) {
  if (log.empleado_nombre) return log.empleado_nombre;
  if (log.acceso_permitido) return "Visita (acceso manual)";
  return "Tarjeta desconocida";
}

export default function AccessMonitor() {
  const [logs, setLogs] = useState([]);
  const [offline, setOffline] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [aviso, setAviso] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const cargarLogs = useCallback(async () => {
    try {
      const data = await api.getAccessLogs();
      data.sort((a, b) => b.id - a.id);
      setLogs(data);
      setOffline(false);
    } catch {
      setOffline(true);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarLogs();
    const timer = setInterval(cargarLogs, POLL_MS);
    return () => clearInterval(timer);
  }, [cargarLogs]);

  const ultimo = logs[0] ?? null;
  const ultimoDenegado = ultimo && !ultimo.acceso_permitido;

  async function permitirAcceso(uid) {
    setEnviando(true);
    setAviso(null);
    try {
      await api.createAccessLog({
        uid_rfid: uid ?? "MANUAL",
        acceso_permitido: true,
      });
      setAviso({ tipo: "ok", texto: "Acceso manual registrado. Puede pasar." });
      await cargarLogs();
    } catch (e) {
      setAviso({ tipo: "error", texto: `No se pudo registrar el acceso: ${e.message}` });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="space-y-6">
      {offline && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          ⚠️ No se pudo conectar con el servidor. Verificá que el backend esté
          corriendo en <span className="font-mono">http://localhost:8000</span>.
        </div>
      )}

      {/* Último ingreso */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Último ingreso
          </h2>
          <button
            onClick={() => permitirAcceso(null)}
            disabled={enviando}
            className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-sky-400 disabled:opacity-50"
          >
            Permitir acceso manual
          </button>
        </div>

        {cargando ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center text-slate-500">
            Cargando…
          </div>
        ) : !ultimo ? (
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 p-10 text-center text-slate-500">
            Todavía no hay ingresos registrados. Esperando la primera tarjeta…
          </div>
        ) : (
          <div
            key={ultimo.id}
            className={`animate-card-in rounded-2xl border p-8 ${
              ultimo.acceso_permitido
                ? "border-emerald-500/40 bg-emerald-500/10"
                : "border-rose-500/40 bg-rose-500/10"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div>
                <p className="text-3xl font-bold">{nombreDelLog(ultimo)}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                  <span className="rounded-full bg-slate-800 px-3 py-1 font-semibold text-slate-200">
                    Ficha N° {ultimo.empleado ?? "—"}
                  </span>
                  <span className="rounded-full bg-slate-800 px-3 py-1 font-mono text-slate-300">
                    UID {ultimo.uid_rfid}
                  </span>
                  <span className="text-slate-400">
                    {formatFecha(ultimo.fecha_hora)} · {formatHora(ultimo.fecha_hora)}
                  </span>
                </div>
              </div>

              <div
                className={`rounded-xl px-6 py-4 text-center text-xl font-black tracking-wide ${
                  ultimo.acceso_permitido
                    ? "bg-emerald-500 text-emerald-950"
                    : "bg-rose-500 text-rose-950"
                }`}
              >
                {ultimo.acceso_permitido ? "✔ ACCESO PERMITIDO" : "✖ ACCESO DENEGADO"}
              </div>
            </div>

            {ultimoDenegado && (
              <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-rose-500/30 pt-5">
                <p className="text-sm text-rose-200">
                  ¿Es una persona nueva y hay que dejarla pasar?
                </p>
                <button
                  onClick={() => permitirAcceso(ultimo.uid_rfid)}
                  disabled={enviando}
                  className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-bold text-emerald-950 transition-colors hover:bg-emerald-400 disabled:opacity-50"
                >
                  Permitir acceso a {ultimo.uid_rfid}
                </button>
              </div>
            )}
          </div>
        )}

        {aviso && (
          <div
            className={`mt-4 rounded-xl px-4 py-3 text-sm ${
              aviso.tipo === "ok"
                ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                : "border border-rose-500/40 bg-rose-500/10 text-rose-300"
            }`}
          >
            {aviso.texto}
          </div>
        )}
      </section>

      {/* Historial */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
          Últimos movimientos
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3">Hora</th>
                <th className="px-5 py-3">Ficha</th>
                <th className="px-5 py-3">Nombre</th>
                <th className="px-5 py-3">UID tarjeta</th>
                <th className="px-5 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {logs.slice(0, 12).map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40">
                  <td className="px-5 py-3 text-slate-400">
                    {formatFecha(log.fecha_hora)} {formatHora(log.fecha_hora)}
                  </td>
                  <td className="px-5 py-3 font-semibold">
                    {log.empleado ?? "—"}
                  </td>
                  <td className="px-5 py-3">{nombreDelLog(log)}</td>
                  <td className="px-5 py-3 font-mono text-slate-300">
                    {log.uid_rfid}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        log.acceso_permitido
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-rose-500/15 text-rose-400"
                      }`}
                    >
                      {log.acceso_permitido ? "Permitido" : "Denegado"}
                    </span>
                  </td>
                </tr>
              ))}
              {!cargando && logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-500">
                    Sin movimientos todavía.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
