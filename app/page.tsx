'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Thermometer, Droplets, Activity } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Dashboard() {
  const [lecturas, setLecturas] = useState<any[]>([]);

  useEffect(() => {
    fetchLecturas();

    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'lecturas' }, (payload) => {
        setLecturas((prev) => [payload.new, ...prev.slice(0, 49)]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchLecturas() {
    const { data } = await supabase
      .from('lecturas')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (data) setLecturas(data.reverse());
  }

  const nodo1 = lecturas.filter((l) => l.nodo === 1).slice(-1)[0] || {};
  const nodo2 = lecturas.filter((l) => l.nodo === 2).slice(-1)[0] || {};

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 font-sans">
      <header className="mb-8 border-b border-slate-800 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-emerald-400">Control de Cultivo — Gírgolas</h1>
          <p className="text-sm text-slate-400">Monitoreo autónomo de incubación y fructificación</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-full text-xs text-emerald-400 border border-emerald-500/20">
          <Activity size={14} className="animate-pulse" />
          Sistema Online
        </div>
      </header>

      {/* Tarjetas de estado actual */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Nodo 1 - Incubación */}
        <div className="bg-slate-800/60 border border-slate-700/50 p-5 rounded-2xl shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-lg text-amber-400">Nodo 1: Incubación</h2>
            <span className="text-xs text-slate-400">
              {nodo1.created_at ? new Date(nodo1.created_at).toLocaleTimeString() : 'Sin datos'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
              <Thermometer className="text-amber-400" size={28} />
              <div>
                <p className="text-xs text-slate-400">Temperatura</p>
                <p className="text-2xl font-bold">{nodo1.temperatura ?? '--'} °C</p>
              </div>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
              <Droplets className="text-blue-400" size={28} />
              <div>
                <p className="text-xs text-slate-400">Humedad</p>
                <p className="text-2xl font-bold">{nodo1.humedad ?? '--'} %</p>
              </div>
            </div>
          </div>
        </div>

        {/* Nodo 2 - Fructificación */}
        <div className="bg-slate-800/60 border border-slate-700/50 p-5 rounded-2xl shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-lg text-emerald-400">Nodo 2: Fructificación</h2>
            <span className="text-xs text-slate-400">
              {nodo2.created_at ? new Date(nodo2.created_at).toLocaleTimeString() : 'Sin datos'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
              <Thermometer className="text-emerald-400" size={28} />
              <div>
                <p className="text-xs text-slate-400">Temperatura</p>
                <p className="text-2xl font-bold">{nodo2.temperatura ?? '--'} °C</p>
              </div>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
              <Droplets className="text-blue-400" size={28} />
              <div>
                <p className="text-xs text-slate-400">Humedad</p>
                <p className="text-2xl font-bold">{nodo2.humedad ?? '--'} %</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico histórico */}
      <div className="bg-slate-800/60 border border-slate-700/50 p-5 rounded-2xl shadow-xl">
        <h3 className="font-semibold text-base mb-4 text-slate-300">Histórico de Temperatura (°C)</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lecturas}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="created_at" tickFormatter={(t) => new Date(t).toLocaleTimeString()} stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip labelFormatter={(t) => new Date(t).toLocaleString()} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
              <Line type="monotone" dataKey="temperatura" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}