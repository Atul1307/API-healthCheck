'use client';

import AddServiceForm from "@/components/AddServiceForm";
import ServiceCard from "@/components/ServiceCard";
import { useCallback, useEffect, useState } from "react";

function SummaryBar({ services }){
  const checked = services.filter((s) => s.status !== null);
  const up = services.filter((s) => s.status === 'UP').length;
  const slow = services.filter((s) => s.status === 'SLOW').length;
  const down = services.filter((s) => s.status === 'DOWN').length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[
        {label: 'Services', value: services.length, color:'text-white'},
        {label: 'UP', value: up, color:'text-emerald-400'},
        {label: 'SLOW', value: slow, color:'text-amber-400'},
        {label: 'DOWN', value: down, color:'text-red-400'},
      ].map(({ label, value, color}) => (
        <div key={label} className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center">
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          <p className={`text-slate-400 text-xs mt-0.5`}>{label}</p>
        </div>
      ))}
    </div>
  )
}

export default function DashboardPage(){
  const [services, setServices] = useState([]);
  const [refreshingIds, setRefreshingIds] = useState(new Set());
  const [isRefreshingAll, setIsRefreshingAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadServices = useCallback(async () => {
    try{
      const res = await fetch('/api/services');
      if(!res.ok) throw new Error('failed to load services');
      const data = await res.json();
      setServices(data);
    } catch(err) {
      setError(err.message);
    } finally{
      setLoading(false);
    }
  },[]);

  useEffect(() => {
    loadServices();
  }, [loadServices])

  async function handleRefresh(id){
    setRefreshingIds((prev) => new Set([...prev, id]));
    try{
      const res = await fetch(`/api/services/${id}/check`, { method: 'POST'});
      if(!res.ok) throw new Error('Check failed');
      const updated = await res.json();
      setServices((prev) => prev.map((s) => (s.id === id ? updated : s)))
    } catch(err){
      alert(`Refresh failed : ${err.message}`)
    } finally {
      setRefreshingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      })
    }
  }

  async function handleRefreshAll() {
    setIsRefreshingAll(true);
    try{
      await Promise.all(services.map((s) => handleRefresh(s.id)));
    } finally {
      setIsRefreshingAll(false);
    }
  }

  async function handleDelete(id){
    if(!confirm('Delete this service?')) return;
    try{
      const res = await fetch(`/api/services/${id}`, { method: 'DELETE' });
      if(!res.ok) throw new Error('Delete failed');
      setServices((prev) => prev.filter((s) => s.id !== id));
    } catch(err){
      alert(`Delete failed: ${err.message}`)
    }
  }

  async function handleAdd(name, url){
    const res = await fetch('/api/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify({ name, url}),
    })
    if(!res.ok){
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || 'Failed to add service');
    }
    const created = await res.json();
    setServices((prev) => [...prev, created]);
  }

  const hasUnchecked = services.some((s) => s.status === null);

  return ( 
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-5xl mx-auto px-4 py-10 flex flex-col gap-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">API Health Monitor</h1>
            <p className="text-slate-400 text-sm mt-1">Track uptime and latency of your public APIs</p>
          </div>
          <button onClick={handleRefreshAll} disabled={isRefreshingAll || services.length === 0} className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:curso-not-allowed rounded-lg text-slate-300 text-sm font-medium transition-colors">
            <svg className={`w-4 h-4 ${isRefreshingAll ? 'animate-spin' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {isRefreshingAll ? 'Checking All...' : 'Refresh All' }
          </button>
        </div>

        {!loading && <SummaryBar services={services} />}

        {!loading && hasUnchecked && (
          <div className="flex items-center gap-3 bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-3">
            <svg className="w-4 h-4 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-blue-300 text-sm">
              Some services haven&apos;t veeb checked yet. Hit{' '}
              <button onClick={handleRefreshAll} className="underline font-semibold hover:text-blue-200">Refresh All</button>{' '}to run all checks now.
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>
        )}

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1,2,3,4].map((i) => (
              <div key={i} className="bg-slate-800 border border-slate-700 rounded-xl p-5 h-48 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && services.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onRefresh={handleRefresh}
                onDelete={handleDelete}
                isRefreshing={refreshingIds.has(service.id)}
              />
            ))}
          </div>
        )}

        {!loading && services.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <svg className="w-12 h-12 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-slate-400 text-sm">No services monitored yet. Add one below.</p>
          </div>
        )}

        <AddServiceForm onAdd={handleAdd}/>
      </div>
    </main>
  )
}