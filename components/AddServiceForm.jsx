'use client'

import { useState } from "react"

export default function AddServiceForm({ onAdd }){
    const [name, setName] = useState('');
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(e){
        e.preventDefault();
        setError('');

        if(!name.trim() || !url.trim()){
            setError('Both name and URL are required.');
            return;
        }

        try{
            new URL(url.trim());
        } catch{
            setError('Please enter a valid URL (include https://).');
            return;
        }
        setLoading(true);
        try{
            await onAdd(name.trim(), url.trim());
            setName('');
            setUrl('');
        } catch(err){
            setError(err.message || 'Failed to add service.');
        } finally {
            setLoading(false);
        }
    }
    return (
        <form
            onSubmit={handleSubmit}
            className="bg-slate-800 border border-slate-700 rounded-xl p-5 flex flex-col gap-4"
        >
            <h2 className="text-white font-semibold text-base">Add New Service</h2>
            <div className="flex flex-col sm:flex-row gap-3">
                <input 
                    type="text"
                    placeholder="Service name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
                <input 
                    type="text"
                    placeholder="https://api.example.com/health"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="flex-[2] bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button type="submit" disabled={loading} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white text-sm font-semibold transition-colors whitespace-nowrap">
                    {loading ? 'Adding...' : '+ Add'}
                </button>
            </div>
            {error && (
                <p className="text-red-400 text-xs">{error}</p>
            )}
        </form>
    )
}