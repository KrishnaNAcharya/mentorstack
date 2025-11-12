"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { adminAPI } from "@/lib/admin-api";
import { TrendingUp, Search, User as UserIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface UserLite { id: number; name: string; email: string; reputation: number; avatarUrl?: string | null; }

export default function AdminReputationPage() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<UserLite[]>([]);
  const [selected, setSelected] = useState<UserLite | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [adjusting, setAdjusting] = useState(false);
  const [points, setPoints] = useState<number>(0);
  const [reason, setReason] = useState<string>("");

  // Pretty-print action names and hide internal labels like "admin"
  const formatAction = (action: string) => {
    if (!action) return "";
    const map: Record<string, string> = {
      admin_adjustment: "Manual adjustment",
    };
    const pretty = map[action] ?? action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    return pretty.replace(/\bAdmin\b/gi, "").trim();
  };

  useEffect(() => {
    // Prefetch a few users to get started
    (async () => {
      try {
        const res = await adminAPI.getUsers(1, 10);
        setUsers(res.users.map(u => ({ id: u.id, name: u.name, email: u.email, reputation: u.reputation, avatarUrl: (u as any).avatarUrl })));
      } catch {}
    })();
  }, []);

  const searchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getUsers(1, 20, undefined, query || undefined);
      setUsers(res.users.map(u => ({ id: u.id, name: u.name, email: u.email, reputation: u.reputation, avatarUrl: (u as any).avatarUrl })));
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (uid: number, p = 1) => {
    setLoading(true);
    try {
      const res = await adminAPI.getReputationHistory(uid, p, 20);
      setHistory(res.items);
      setTotal(res.total);
      setPage(p);
      if (res.user) setSelected(prev => prev ? { ...prev, reputation: res.user.reputation } : { id: res.user.id, name: res.user.name, email: res.user.email, reputation: res.user.reputation });
    } finally {
      setLoading(false);
    }
  };

  const onPickUser = async (u: UserLite) => {
    setSelected(u);
    await fetchHistory(u.id, 1);
  };

  const onAdjust = async () => {
    if (!selected) return;
    if (!points || points === 0) { alert('Enter non-zero points'); return; }
    setAdjusting(true);
    try {
      await adminAPI.adjustReputation({ userId: selected.id, points, reason });
      setPoints(0);
      setReason("");
      await fetchHistory(selected.id, 1);
    } catch (e: any) {
      alert(e.message || 'Failed to adjust reputation');
    } finally {
      setAdjusting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Hero header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-6 text-white shadow">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/15 text-white shadow-sm ring-1 ring-white/30">
                  <TrendingUp className="w-5 h-5" />
                </span>
                Reputation Manager
              </h1>
              <p className="mt-1 text-white/90">Search users, view history, and apply manual adjustments with full audit trail</p>
            </div>
          </div>
          <div className="pointer-events-none absolute -left-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="pointer-events-none absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        </div>

        {/* Search and selection */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-white/80 backdrop-blur rounded-lg border shadow-sm">
              <Search className="w-4 h-4 text-gray-400" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search users by name or email" className="flex-1 outline-none text-sm bg-transparent" />
              <button onClick={searchUsers} className="px-3 py-1.5 rounded-lg text-sm text-teal-900 bg-white border hover:bg-emerald-50">Search</button>
            </div>

            <div className="bg-white border rounded-xl shadow divide-y">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500">Users</div>
              {loading && users.length === 0 ? (
                <div className="p-6 text-center text-gray-500">Loading…</div>
              ) : users.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No users</div>
              ) : users.map(u => (
                <button key={u.id} onClick={() => onPickUser(u)} className={`w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 ${selected?.id === u.id ? 'bg-teal-50' : ''}`}>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-100 to-emerald-100 flex items-center justify-center overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {u.avatarUrl ? <img src={u.avatarUrl} alt="avatar" className="w-full h-full object-cover" /> : <UserIcon className="w-4 h-4 text-teal-600" />}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{u.name}</div>
                    <div className="text-xs text-gray-500">{u.email}</div>
                  </div>
                  <div className="ml-auto text-sm font-semibold text-gray-900">{u.reputation}</div>
                </button>
              ))}
            </div>
          </div>

          {/* History and adjust */}
          <div className="lg:col-span-2 space-y-4">
            {selected ? (
              <>
                <div className="relative p-[1px] rounded-xl bg-gradient-to-br from-teal-200 via-emerald-200 to-transparent">
                  <div className="bg-white rounded-xl shadow p-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">Selected user</div>
                    <div className="text-lg font-semibold text-gray-900">{selected.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Current reputation</div>
                    <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-emerald-600">{selected.reputation}</div>
                  </div>
                  </div>
                </div>

                <div className="bg-white border rounded-xl shadow p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-semibold text-gray-700">Adjust reputation</div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-600 mb-1">Points</label>
                      <input type="number" value={points} onChange={e => setPoints(Number(e.target.value))} placeholder="e.g., 10 or -5" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
                    </div>
                    <div className="md:col-span-4">
                      <label className="block text-xs text-gray-600 mb-1">Reason (kept in audit)</label>
                      <input value={reason} onChange={e => setReason(e.target.value)} placeholder="Short reason for adjustment" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-end">
                    <button onClick={onAdjust} disabled={adjusting} className="px-4 py-2 rounded-lg text-white bg-gradient-to-r from-teal-500 to-emerald-500 shadow disabled:opacity-50">{adjusting ? 'Applying…' : 'Apply adjustment'}</button>
                  </div>
                </div>

                <div className="bg-white border rounded-xl shadow overflow-hidden">
                  <div className="grid grid-cols-12 px-4 py-2 text-xs font-semibold text-gray-500">
                    <div className="col-span-6">Event</div>
                    <div className="col-span-2">Points</div>
                    <div className="col-span-4 text-right">When</div>
                  </div>
                  {loading && history.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">Loading history…</div>
                  ) : history.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">No reputation events</div>
                  ) : (
                    <div className="divide-y">
                      {history.map((h: any) => (
                        <div key={h.id} className="grid grid-cols-12 items-center px-4 py-3">
                          <div className="col-span-6">
                            <div className="text-sm font-semibold text-gray-900">{formatAction(h.action)}</div>
                            {h.description && <div className="text-xs text-gray-500">{h.description}</div>}
                          </div>
                          <div className={`col-span-2 font-semibold ${h.points >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                            <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs border ${h.points >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                              {h.points >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                              {h.points}
                            </div>
                          </div>
                          <div className="col-span-4 text-right text-sm text-gray-600">{new Date(h.createdAt).toLocaleString()}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {total > history.length && (
                    <div className="p-3 text-center">
                      <button onClick={() => fetchHistory(selected.id, page + 1)} className="px-4 py-2 rounded-lg border-2 border-slate-200 bg-white/70 text-sm text-slate-700 hover:bg-white hover:border-slate-300 transition">Load more</button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-white border rounded-xl shadow p-8 text-center text-gray-600">
                Pick a user to view and adjust reputation
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
