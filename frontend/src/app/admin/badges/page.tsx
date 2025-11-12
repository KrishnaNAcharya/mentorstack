"use client";

import { useEffect, useMemo, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { adminAPI } from "@/lib/admin-api";
import { Award, Plus, Search, ToggleLeft, ToggleRight, Upload, Pencil, XCircle, CheckCircle2, LayoutGrid, ListFilter, ChevronDown, Medal, Trophy, Power } from "lucide-react";

interface BadgeForm {
  id?: number;
  name: string;
  description: string;
  reputationThreshold: number;
  imageUrl?: string | null;
  isActive: boolean;
}

export default function AdminBadgesPage() {
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<BadgeForm | null>(null);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState<'grid' | 'table'>("grid");
  const [statusFilter, setStatusFilter] = useState<'all'|'active'|'inactive'>("all");
  const [sortBy, setSortBy] = useState<'threshold'|'name'|'awarded'>("threshold");
  const [sortDir, setSortDir] = useState<'asc'|'desc'>("asc");
  const skeletonKeys = ['a','b','c','d','e','f'];

  const filteredSorted = useMemo(() => {
    let arr = badges.slice();
    // filter by search
    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter(b => b.name.toLowerCase().includes(q) || (b.description || '').toLowerCase().includes(q));
    }
    // filter by status
    if (statusFilter !== 'all') {
      arr = arr.filter(b => statusFilter === 'active' ? b.isActive : !b.isActive);
    }
    // sort
    arr.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'threshold') cmp = (a.reputationThreshold ?? 0) - (b.reputationThreshold ?? 0);
      else if (sortBy === 'name') cmp = String(a.name).localeCompare(String(b.name));
      else cmp = (a.awardedCount ?? 0) - (b.awardedCount ?? 0);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return arr;
  }, [badges, search, statusFilter, sortBy, sortDir]);

  const openCreate = () => {
    setEditing({ name: "", description: "", reputationThreshold: 0, imageUrl: null, isActive: true });
    setShowModal(true);
  };

  const openEdit = (badge: any) => {
    setEditing({
      id: badge.id,
      name: badge.name,
      description: badge.description,
      reputationThreshold: badge.reputationThreshold,
      imageUrl: badge.imageUrl,
      isActive: badge.isActive,
    });
    setShowModal(true);
  };

  const resetModal = () => {
    setShowModal(false);
    setEditing(null);
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminAPI.getBadges();
      setBadges(res.badges);
    } catch (e: any) {
      setError(e.message || "Failed to load badges");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onUploadIcon = async (file: File) => {
    const { imageUrl } = await adminAPI.uploadBadgeIcon(file);
    setEditing(prev => prev ? { ...prev, imageUrl } : prev);
  };

  const onSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      if (editing.id) {
        await adminAPI.updateBadge(editing.id, {
          name: editing.name,
          description: editing.description,
          reputationThreshold: Number(editing.reputationThreshold) || 0,
          imageUrl: editing.imageUrl || null,
          isActive: editing.isActive,
        });
      } else {
        await adminAPI.createBadge({
          name: editing.name,
          description: editing.description,
          reputationThreshold: Number(editing.reputationThreshold) || 0,
          imageUrl: editing.imageUrl || null,
          isActive: editing.isActive,
        });
      }
      await load();
      resetModal();
    } catch (e: any) {
      alert(e.message || "Failed to save badge");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (badge: any) => {
    try {
      await adminAPI.toggleBadgeActive(badge.id);
      await load();
    } catch (e: any) {
      alert(e.message || "Failed to toggle");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 relative">
        {/* Hero gradient background */}
        <div className="absolute -top-10 -left-10 w-60 h-60 bg-teal-300/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-16 right-0 w-72 h-72 bg-emerald-300/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="relative flex items-start justify-between overflow-hidden rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-6 text-white shadow">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/15 text-white shadow-sm ring-1 ring-white/30">
                <Award className="w-5 h-5" />
              </span>
              Badges Management
            </h1>
            <p className="mt-1 text-white/90">Design and curate badges users can earn across the platform</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/10 backdrop-blur flex items-center justify-center shadow-inner">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-[10px] sm:text-xs font-medium opacity-80">Total</div>
                    <div className="text-2xl sm:text-3xl font-extrabold">{badges.length}</div>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-teal-900 bg-white shadow hover:bg-emerald-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <Plus className="w-4 h-4" /> Create Badge
            </button>
          </div>
          {/* soft corners aura */}
          <div className="pointer-events-none absolute -left-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="pointer-events-none absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        </div>

        {/* Controls toolbar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-white/80 backdrop-blur border rounded-xl shadow-sm w-full lg:max-w-md">
            <Search className="w-4 h-4 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search badges..." className="flex-1 outline-none text-sm bg-transparent" />
          </div>

          <div className="flex items-center gap-2">
            {/* Status filter segmented */}
            <div className="inline-flex p-1 rounded-xl border bg-white/80 backdrop-blur shadow-sm">
              {(['all','active','inactive'] as const).map(k => (
                <button key={k}
                  onClick={() => setStatusFilter(k)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${statusFilter === k ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow' : 'text-gray-700 hover:bg-gray-50'}`}
                >{k[0].toUpperCase() + k.slice(1)}</button>
              ))}
            </div>

            {/* Sort */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-white/80 backdrop-blur shadow-sm">
              <span className="text-sm text-gray-600">Sort</span>
              <div className="relative">
                <select
                  className="appearance-none pr-6 text-sm bg-transparent outline-none"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                >
                  <option value="threshold">Threshold</option>
                  <option value="name">Name</option>
                  <option value="awarded">Awarded</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              <button onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')} className="text-sm text-gray-700 hover:text-gray-900">
                {sortDir === 'asc' ? 'Asc' : 'Desc'}
              </button>
            </div>

            {/* View toggle */}
            <div className="inline-flex p-1 rounded-xl border bg-white/80 backdrop-blur shadow-sm">
              <button onClick={() => setView('grid')} className={`px-2.5 py-1.5 rounded-lg ${view==='grid'?'bg-teal-600 text-white shadow':'text-gray-700 hover:bg-gray-50'}`} aria-label="Grid view">
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button onClick={() => setView('table')} className={`px-2.5 py-1.5 rounded-lg ${view==='table'?'bg-teal-600 text-white shadow':'text-gray-700 hover:bg-gray-50'}`} aria-label="Table view">
                <ListFilter className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          // Skeletons
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {skeletonKeys.map((k) => (
              <div key={k} className="rounded-2xl border bg-white shadow-sm p-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gray-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-1/2 bg-gray-200 rounded" />
                    <div className="h-3 w-2/3 bg-gray-100 rounded" />
                  </div>
                </div>
                <div className="mt-4 h-8 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600 bg-red-50 rounded-xl border">{error}</div>
        ) : filteredSorted.length === 0 ? (
          <div className="bg-white rounded-2xl border shadow-sm p-10 text-center">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 flex items-center justify-center text-teal-600">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="mt-3 text-lg font-semibold text-gray-900">No badges yet</h3>
            <p className="text-gray-600">Create your first badge to get started</p>
            <button onClick={openCreate} className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white bg-gradient-to-r from-teal-500 to-emerald-500 shadow hover:from-teal-600 hover:to-emerald-600">
              <Plus className="w-4 h-4" /> Create Badge
            </button>
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredSorted.map((badge) => (
              <div key={badge.id} className="group relative p-[1px] rounded-2xl bg-gradient-to-br from-teal-200 via-emerald-200 to-transparent hover:from-teal-300 hover:via-emerald-300 transition">
                <div className="rounded-2xl bg-white shadow-sm p-4 hover:shadow-lg transition-all relative overflow-hidden will-change-transform">
                  {/* subtle radial aura */}
                  <div className="pointer-events-none absolute -top-10 -right-10 w-32 h-32 bg-teal-200/30 rounded-full blur-2xl" />
                  {/* shimmer on hover */}
                  <span className="pointer-events-none absolute -left-1/2 top-0 h-full w-1/2 -skew-x-12 bg-white/10 opacity-0 translate-x-[-120%] group-hover:opacity-100 group-hover:translate-x-[220%] transition duration-700" />
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-50 to-emerald-50 border flex items-center justify-center overflow-hidden ring-1 ring-white/50 shadow-inner">
                      {badge.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={badge.imageUrl} alt={badge.name} className="w-full h-full object-cover" />
                      ) : (
                        <Award className="w-6 h-6 text-teal-600" />
                      )}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 text-[10px] px-1.5 py-0.5 rounded-full border ${badge.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>{badge.isActive ? 'Active' : 'Off'}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-semibold text-gray-900 truncate">{badge.name}</div>
                        <div className="text-sm text-gray-600 line-clamp-2">{badge.description}</div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                        <Medal className="w-3.5 h-3.5" /> Threshold: {badge.reputationThreshold}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-gray-50 text-gray-700 border">
                        <Trophy className="w-3.5 h-3.5 text-amber-500" /> Awarded: {badge.awardedCount ?? 0}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <button
                        onClick={() => toggleActive(badge)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition border-2 ${badge.isActive
                          ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-300 hover:shadow-sm'
                          : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 hover:shadow-sm'}`}
                      >
                        {badge.isActive ? <Power className="w-4 h-4 text-red-600" /> : <ToggleLeft className="w-4 h-4 text-emerald-600" />} {badge.isActive ? 'Disable' : 'Enable'}
                      </button>
                      <button onClick={() => openEdit(badge)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-white bg-gradient-to-r from-emerald-500 to-teal-600 shadow hover:from-emerald-600 hover:to-teal-700 transition">
                        <Pencil className="w-4 h-4" /> Edit
                      </button>
                    </div>
                  </div>
                </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border rounded-xl shadow overflow-hidden">
            <div className="grid grid-cols-12 px-4 py-2 text-xs font-semibold text-gray-500">
              <div className="col-span-5">Badge</div>
              <div className="col-span-2">Threshold</div>
              <div className="col-span-2">Awarded</div>
              <div className="col-span-3 text-right">Actions</div>
            </div>
            <div className="divide-y">
              {filteredSorted.map(badge => (
                <div key={badge.id} className="grid grid-cols-12 items-center px-4 py-3 hover:bg-gray-50">
                  <div className="col-span-5 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-teal-50 to-emerald-50 border flex items-center justify-center overflow-hidden">
                      {badge.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={badge.imageUrl} alt={badge.name} className="w-full h-full object-cover" />
                      ) : (
                        <Award className="w-5 h-5 text-teal-500" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{badge.name}</span>
                        {badge.isActive ? (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border">
                            <XCircle className="w-3 h-3" /> Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{badge.description}</p>
                    </div>
                  </div>
                  <div className="col-span-2 text-gray-900">{badge.reputationThreshold}</div>
                  <div className="col-span-2 text-gray-900">{badge.awardedCount ?? 0}</div>
                  <div className="col-span-3 flex items-center gap-2 justify-end">
                    <button
                      onClick={() => toggleActive(badge)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition border-2 ${badge.isActive
                        ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-300 hover:shadow-sm'
                        : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 hover:shadow-sm'}`}
                    >
                      {badge.isActive ? <Power className="w-4 h-4 text-red-600" /> : <ToggleLeft className="w-4 h-4 text-emerald-600" />} {badge.isActive ? 'Disable' : 'Enable'}
                    </button>
                    <button onClick={() => openEdit(badge)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-white bg-gradient-to-r from-emerald-500 to-teal-600 shadow hover:from-emerald-600 hover:to-teal-700 transition">
                      <Pencil className="w-4 h-4" /> Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal */}
        {showModal && editing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Ambient gradient backdrop (matches Articles modals) */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/90 via-slate-900/85 to-cyan-900/90 backdrop-blur-sm" />
            {/* Glassy modal container */}
            <div className="relative w-full max-w-2xl rounded-2xl border border-emerald-300/60 bg-gradient-to-br from-white/92 to-white/82 backdrop-blur-xl shadow-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-emerald-200/60 bg-white/20 backdrop-blur-md">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 inline-flex items-center justify-center rounded-md bg-emerald-100 text-emerald-700">
                    <Award className="w-4 h-4" />
                  </span>
                  {editing.id ? 'Edit Badge' : 'Create Badge'}
                </h2>
              </div>
              <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div />
                <button onClick={resetModal} className="p-2 rounded-lg hover:bg-white/60">
                  <XCircle className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <label htmlFor="badge-name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input id="badge-name" value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500" placeholder="e.g., Helpful Hero" />
                  </div>
                  <div>
                    <label htmlFor="badge-description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea id="badge-description" value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} rows={3} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500" placeholder="Describe how to earn this badge" />
                  </div>
                  <div>
                    <label htmlFor="badge-threshold" className="block text-sm font-medium text-gray-700 mb-1">Reputation Threshold</label>
                    <input id="badge-threshold" type="number" value={editing.reputationThreshold} onChange={e => setEditing({ ...editing, reputationThreshold: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500" placeholder="0" />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-700">Active</span>
                    <button type="button" role="switch" aria-checked={editing.isActive} onClick={() => setEditing({ ...editing, isActive: !editing.isActive })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${editing.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                      <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${editing.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>
                <div className="space-y-3 md:sticky md:top-4">
                  <span className="block text-sm font-medium text-gray-700">Badge Icon</span>
                  <label className="rounded-xl border-2 border-dashed bg-gradient-to-br from-teal-50 to-emerald-50 aspect-square flex items-center justify-center overflow-hidden cursor-pointer hover:border-teal-300">
                    {editing.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={editing.imageUrl} alt="badge preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center text-teal-600">
                        <Upload className="w-6 h-6 mb-1" />
                        <span className="text-xs">Click to upload</span>
                      </div>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        try { await onUploadIcon(f); } catch (err: any) { alert(err.message || 'Upload failed'); }
                      }
                    }} />
                  </label>
                  <p className="text-xs text-gray-500">PNG/SVG, Clear Image recommended.</p>
                  {editing.imageUrl && (
                    <button onClick={() => setEditing({ ...editing, imageUrl: null })} className="text-xs text-gray-500 underline">Remove image</button>
                  )}
                  {/* Live preview removed by request */}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2">
                <button onClick={resetModal} className="px-4 py-2.5 rounded-lg font-semibold border-2 border-slate-300 bg-white/70 text-slate-700 hover:bg-white hover:border-slate-400 transition">Cancel</button>
                <button onClick={onSave} disabled={saving} className="px-4 py-2.5 rounded-lg font-semibold text-white bg-gradient-to-r from-teal-500 to-emerald-600 shadow-md hover:from-teal-600 hover:to-emerald-700 transition disabled:opacity-50">
                  {saving ? 'Saving…' : 'Save Badge'}
                </button>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </AdminLayout>
  );
}
