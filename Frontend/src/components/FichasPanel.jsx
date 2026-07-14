import { useCallback, useEffect, useState } from "react";
import { api } from "../api";

const FORM_INICIAL = { nombre: "", uid_rfid: "", activo: true };

export default function FichasPanel() {
  const [empleados, setEmpleados] = useState([]);
  const [form, setForm] = useState(FORM_INICIAL);
  const [aviso, setAviso] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [offline, setOffline] = useState(false);

  const cargarEmpleados = useCallback(async () => {
    try {
      const data = await api.getEmployees();
      data.sort((a, b) => a.id - b.id);
      setEmpleados(data);
      setOffline(false);
    } catch {
      setOffline(true);
    }
  }, []);

  useEffect(() => {
    cargarEmpleados();
  }, [cargarEmpleados]);

  async function crearFicha(e) {
    e.preventDefault();
    setEnviando(true);
    setAviso(null);
    try {
      const nuevo = await api.createEmployee({
        nombre: form.nombre.trim(),
        uid_rfid: form.uid_rfid.trim().toUpperCase(),
        activo: form.activo,
      });
      setAviso({
        tipo: "ok",
        texto: `Ficha N° ${nuevo.id} creada para ${nuevo.nombre}.`,
      });
      setForm(FORM_INICIAL);
      await cargarEmpleados();
    } catch (err) {
      setAviso({ tipo: "error", texto: `No se pudo crear la ficha: ${err.message}` });
    } finally {
      setEnviando(false);
    }
  }

  async function toggleActivo(emp) {
    try {
      await api.updateEmployee(emp.id, {
        nombre: emp.nombre,
        uid_rfid: emp.uid_rfid,
        activo: !emp.activo,
      });
      await cargarEmpleados();
    } catch (err) {
      setAviso({ tipo: "error", texto: `No se pudo actualizar: ${err.message}` });
    }
  }

  async function eliminarFicha(emp) {
    const ok = window.confirm(
      `¿Eliminar la ficha N° ${emp.id} de ${emp.nombre}? Esta acción no se puede deshacer.`
    );
    if (!ok) return;
    try {
      await api.deleteEmployee(emp.id);
      await cargarEmpleados();
    } catch (err) {
      setAviso({ tipo: "error", texto: `No se pudo eliminar: ${err.message}` });
    }
  }

  return (
    <div className="space-y-8">
      {offline && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          ⚠️ No se pudo conectar con el servidor. Verificá que el backend esté
          corriendo en <span className="font-mono">http://localhost:8000</span>.
        </div>
      )}

      {/* Alta de ficha */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-lg font-bold">Crear ficha nueva</h2>
        <p className="mt-1 text-sm text-slate-400">
          El número de ficha se asigna automáticamente al guardar.
        </p>

        <form onSubmit={crearFicha} className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-300">
              Nombre y apellido
            </span>
            <input
              type="text"
              required
              maxLength={100}
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Ej: Juan Pérez"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 placeholder-slate-500 outline-none focus:border-sky-500"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-300">
              UID de la tarjeta RFID
            </span>
            <input
              type="text"
              required
              maxLength={20}
              value={form.uid_rfid}
              onChange={(e) => setForm({ ...form, uid_rfid: e.target.value })}
              placeholder="Ej: 11:22:33:44"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 font-mono text-slate-100 placeholder-slate-500 outline-none focus:border-sky-500"
            />
          </label>

          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={form.activo}
              onChange={(e) => setForm({ ...form, activo: e.target.checked })}
              className="h-4 w-4 accent-sky-500"
            />
            Ficha activa (puede ingresar)
          </label>

          <div className="flex items-end justify-end">
            <button
              type="submit"
              disabled={enviando}
              className="rounded-lg bg-sky-500 px-6 py-2 font-semibold text-white transition-colors hover:bg-sky-400 disabled:opacity-50"
            >
              {enviando ? "Guardando…" : "Crear ficha"}
            </button>
          </div>
        </form>

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

      {/* Listado */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
          Fichas registradas ({empleados.length})
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3">Ficha N°</th>
                <th className="px-5 py-3">Nombre</th>
                <th className="px-5 py-3">UID tarjeta</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {empleados.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-800/40">
                  <td className="px-5 py-3 font-bold">{emp.id}</td>
                  <td className="px-5 py-3">{emp.nombre}</td>
                  <td className="px-5 py-3 font-mono text-slate-300">
                    {emp.uid_rfid}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        emp.activo
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-slate-600/30 text-slate-400"
                      }`}
                    >
                      {emp.activo ? "Activa" : "Inactiva"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => toggleActivo(emp)}
                      className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-300 transition-colors hover:bg-slate-700"
                    >
                      {emp.activo ? "Desactivar" : "Activar"}
                    </button>
                    <button
                      onClick={() => eliminarFicha(emp)}
                      className="ml-2 rounded-lg border border-rose-500/40 px-3 py-1.5 text-xs font-semibold text-rose-400 transition-colors hover:bg-rose-500/10"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {empleados.length === 0 && !offline && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-500">
                    No hay fichas registradas todavía.
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
