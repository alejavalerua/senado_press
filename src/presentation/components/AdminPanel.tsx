"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Loader2, Check, X, Ban, Save, Radio, RefreshCw, Shield,
  Users, Gavel, FileText, Plus, Pencil, Trash2,
} from "lucide-react";
import { Header } from "./Header";
import { LiveBar } from "./LiveBar";
import { Footer } from "./Footer";
import { SessionPayload } from "@/infrastructure/auth/session";
import { SenateState } from "@/domain/entities/SenateState";
import { PostWithAuthor, POST_TAG_LABELS, POST_TAG_COLORS, POST_STATUS_LABELS } from "@/domain/entities/Post";
import { Profile, getJournalistStatus } from "@/domain/entities/Profile";
import { Senator } from "@/domain/entities/Senator";

interface AdminPanelProps {
  user: SessionPayload;
  initialState: SenateState;
}

type AdminTab = "sesion" | "despachos" | "periodistas" | "senadores";

export function AdminPanel({ user, initialState }: AdminPanelProps) {
  const [tab, setTab] = useState<AdminTab>("despachos");
  const [state, setState] = useState(initialState);
  const [allPosts, setAllPosts] = useState<PostWithAuthor[]>([]);
  const [journalists, setJournalists] = useState<Profile[]>([]);
  const [senators, setSenators] = useState<Senator[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    liveTopic: initialState.liveTopic,
    isLive: initialState.isLive,
    activeProjects: initialState.activeProjects,
    activeDispatches: initialState.activeDispatches,
    openQuestions: initialState.openQuestions,
    activeDebates: initialState.activeDebates,
    nextSessionAt: initialState.nextSessionAt
      ? new Date(initialState.nextSessionAt).toISOString().slice(0, 16)
      : "",
    sessionDurationMinutes: initialState.sessionDurationMinutes,
  });

  const [editingJournalist, setEditingJournalist] = useState<Profile | null>(null);
  const [journalistForm, setJournalistForm] = useState({ displayName: "", email: "", status: "libre" as "libre" | "bloqueado" });

  const [showSenatorForm, setShowSenatorForm] = useState(false);
  const [editingSenator, setEditingSenator] = useState<Senator | null>(null);
  const [senatorForm, setSenatorForm] = useState({ fullName: "", party: "", caucus: "" });

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/posts");
      const data = await res.json();
      if (res.ok) setAllPosts(data.posts);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadJournalists = useCallback(async () => {
    const res = await fetch("/api/admin/journalists");
    const data = await res.json();
    if (res.ok) setJournalists(data.journalists);
  }, []);

  const loadSenators = useCallback(async () => {
    const res = await fetch("/api/admin/senators");
    const data = await res.json();
    if (res.ok) setSenators(data.senators);
  }, []);

  useEffect(() => {
    loadPosts();
    loadJournalists();
    loadSenators();
  }, [loadPosts, loadJournalists, loadSenators]);

  async function handleSaveState() {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/senate-state", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          liveTopic: form.liveTopic,
          isLive: form.isLive,
          activeProjects: Number(form.activeProjects),
          activeDispatches: Number(form.activeDispatches),
          openQuestions: Number(form.openQuestions),
          activeDebates: Number(form.activeDebates),
          nextSessionAt: form.nextSessionAt ? new Date(form.nextSessionAt).toISOString() : null,
          sessionDurationMinutes: Number(form.sessionDurationMinutes),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setState(data.state);
      setMessage("Estado del senado actualizado correctamente");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  async function moderatePost(postId: string, action: "approve" | "reject" | "block", note?: string) {
    const res = await fetch(`/api/posts/${postId}/moderate`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, note }),
    });
    if (res.ok) loadPosts();
  }

  function startEditJournalist(j: Profile) {
    setEditingJournalist(j);
    setJournalistForm({
      displayName: j.displayName,
      email: j.email ?? "",
      status: getJournalistStatus(j),
    });
  }

  async function saveJournalist() {
    if (!editingJournalist) return;
    const res = await fetch(`/api/admin/journalists/${editingJournalist.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(journalistForm),
    });
    const data = await res.json();
    if (res.ok) {
      setEditingJournalist(null);
      loadJournalists();
      setMessage("Periodista actualizado");
    } else {
      setMessage(data.error ?? "Error al actualizar");
    }
  }

  async function saveSenator() {
    const payload = {
      fullName: senatorForm.fullName,
      party: senatorForm.party,
      caucus: senatorForm.caucus || null,
    };

    const url = editingSenator
      ? `/api/admin/senators/${editingSenator.id}`
      : "/api/admin/senators";
    const method = editingSenator ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (res.ok) {
      setShowSenatorForm(false);
      setEditingSenator(null);
      setSenatorForm({ fullName: "", party: "", caucus: "" });
      loadSenators();
      setMessage(editingSenator ? "Senador actualizado" : "Senador agregado");
    } else {
      setMessage(data.error ?? "Error al guardar senador");
    }
  }

  async function deleteSenator(id: string) {
    if (!confirm("¿Desactivar este senador de la lista?")) return;
    const res = await fetch(`/api/admin/senators/${id}`, { method: "DELETE" });
    if (res.ok) loadSenators();
  }

  const pendingPosts = allPosts.filter((p) => p.status === "pending" || p.status === "rejected");
  const tabs: { id: AdminTab; label: string; icon: typeof Radio }[] = [
    { id: "despachos", label: "Despachos", icon: FileText },
    { id: "sesion", label: "Sesión", icon: Radio },
    { id: "periodistas", label: "Periodistas", icon: Users },
    { id: "senadores", label: "Senadores", icon: Gavel },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} />
      <LiveBar state={state} />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-parliament-600" />
          <div>
            <h1 className="font-display text-2xl font-bold text-gray-900">Panel de Administración</h1>
            <p className="text-sm text-gray-500">Secretario General — Samuel Lugo</p>
          </div>
        </div>

        {message && (
          <p className={`text-sm p-3 rounded-lg ${
            message.includes("correctamente") || message.includes("actualizado") || message.includes("agregado")
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}>
            {message}
          </p>
        )}

        <div className="flex gap-2 overflow-x-auto pb-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                tab === id
                  ? "bg-parliament-700 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-parliament-300"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* DESPACHOS */}
        {tab === "despachos" && (
          <section className="bg-white rounded-2xl card-shadow p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-lg">
                Todos los despachos ({allPosts.length})
              </h2>
              <button onClick={loadPosts} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>

            {pendingPosts.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-amber-700">
                  Pendientes de moderación ({pendingPosts.length})
                </h3>
                {pendingPosts.map((post) => (
                  <PostAdminCard key={post.id} post={post} onModerate={moderatePost} highlight />
                ))}
              </div>
            )}

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-600">Historial completo</h3>
              {loading && allPosts.length === 0 ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : allPosts.length === 0 ? (
                <p className="text-center text-gray-400 py-8">No hay despachos publicados aún</p>
              ) : (
                allPosts.map((post) => (
                  <PostAdminCard key={post.id} post={post} onModerate={moderatePost} />
                ))
              )}
            </div>
          </section>
        )}

        {/* SESIÓN */}
        {tab === "sesion" && (
          <section className="bg-white rounded-2xl card-shadow p-6 space-y-5">
            <h2 className="font-display font-bold text-lg flex items-center gap-2">
              <Radio className="w-5 h-5 text-parliament-600" />
              Control de Sesión y Debate
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tema del debate (barra EN VIVO)</label>
                <input
                  value={form.liveTopic}
                  onChange={(e) => setForm({ ...form, liveTopic: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-parliament-400 outline-none"
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isLive"
                  checked={form.isLive}
                  onChange={(e) => setForm({ ...form, isLive: e.target.checked })}
                  className="w-5 h-5 rounded accent-parliament-600"
                />
                <label htmlFor="isLive" className="text-sm font-medium text-gray-700">Sesión EN VIVO activa</label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Próxima sesión</label>
                <input
                  type="datetime-local"
                  value={form.nextSessionAt}
                  onChange={(e) => setForm({ ...form, nextSessionAt: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duración (minutos)</label>
                <input
                  type="number"
                  value={form.sessionDurationMinutes}
                  onChange={(e) => setForm({ ...form, sessionDurationMinutes: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none"
                  min={30}
                  max={480}
                />
              </div>
              {(["activeProjects", "activeDispatches", "openQuestions", "activeDebates"] as const).map((key) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {key === "activeProjects" ? "Proyectos activos" :
                     key === "activeDispatches" ? "Despachos" :
                     key === "openQuestions" ? "Preguntas abiertas" : "Debates activos"}
                  </label>
                  <input
                    type="number"
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none"
                    min={0}
                  />
                </div>
              ))}
            </div>
            <button
              onClick={handleSaveState}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-parliament-700 hover:bg-parliament-800 text-white font-semibold text-sm disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Guardar cambios
            </button>
          </section>
        )}

        {/* PERIODISTAS */}
        {tab === "periodistas" && (
          <section className="bg-white rounded-2xl card-shadow p-6 space-y-4">
            <h2 className="font-display font-bold text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-parliament-600" />
              Periodistas registrados ({journalists.length})
            </h2>

            {editingJournalist && (
              <div className="border border-parliament-200 rounded-xl p-4 space-y-3 bg-parliament-50">
                <h3 className="font-semibold text-sm">Editar: {editingJournalist.displayName}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    value={journalistForm.displayName}
                    onChange={(e) => setJournalistForm({ ...journalistForm, displayName: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-gray-200 text-sm"
                    placeholder="Nombre"
                  />
                  <input
                    value={journalistForm.email}
                    onChange={(e) => setJournalistForm({ ...journalistForm, email: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-gray-200 text-sm"
                    placeholder="Correo"
                  />
                  <select
                    value={journalistForm.status}
                    onChange={(e) => setJournalistForm({ ...journalistForm, status: e.target.value as "libre" | "bloqueado" })}
                    className="px-3 py-2 rounded-lg border border-gray-200 text-sm"
                  >
                    <option value="libre">Libre</option>
                    <option value="bloqueado">Bloqueado</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button onClick={saveJournalist} className="px-4 py-2 bg-parliament-700 text-white rounded-lg text-sm">Guardar</button>
                  <button onClick={() => setEditingJournalist(null)} className="px-4 py-2 bg-gray-200 rounded-lg text-sm">Cancelar</button>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-gray-500">
                    <th className="py-2 pr-4">Nombre</th>
                    <th className="py-2 pr-4">Correo</th>
                    <th className="py-2 pr-4">Medio</th>
                    <th className="py-2 pr-4">Estado</th>
                    <th className="py-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {journalists.map((j) => (
                    <tr key={j.id} className="border-b border-gray-100">
                      <td className="py-3 pr-4 font-medium">{j.displayName}</td>
                      <td className="py-3 pr-4 text-gray-600">{j.email ?? "—"}</td>
                      <td className="py-3 pr-4 text-gray-500">{j.mediaOutlet ?? "—"}</td>
                      <td className="py-3 pr-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          j.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                        }`}>
                          {getJournalistStatus(j)}
                        </span>
                      </td>
                      <td className="py-3">
                        <button
                          onClick={() => startEditJournalist(j)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* SENADORES */}
        {tab === "senadores" && (
          <section className="bg-white rounded-2xl card-shadow p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-lg flex items-center gap-2">
                <Gavel className="w-5 h-5 text-parliament-600" />
                Lista de senadores ({senators.filter((s) => s.isActive).length})
              </h2>
              <button
                onClick={() => { setShowSenatorForm(true); setEditingSenator(null); setSenatorForm({ fullName: "", party: "", caucus: "" }); }}
                className="flex items-center gap-1 px-3 py-1.5 bg-parliament-700 text-white rounded-lg text-sm"
              >
                <Plus className="w-4 h-4" /> Agregar
              </button>
            </div>

            {(showSenatorForm || editingSenator) && (
              <div className="border border-parliament-200 rounded-xl p-4 space-y-3 bg-parliament-50">
                <h3 className="font-semibold text-sm">{editingSenator ? "Editar senador" : "Nuevo senador"}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    value={senatorForm.fullName}
                    onChange={(e) => setSenatorForm({ ...senatorForm, fullName: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-gray-200 text-sm"
                    placeholder="Nombre completo"
                  />
                  <input
                    value={senatorForm.party}
                    onChange={(e) => setSenatorForm({ ...senatorForm, party: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-gray-200 text-sm"
                    placeholder="Partido"
                  />
                  <input
                    value={senatorForm.caucus}
                    onChange={(e) => setSenatorForm({ ...senatorForm, caucus: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-gray-200 text-sm"
                    placeholder="Bancada (opcional)"
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={saveSenator} className="px-4 py-2 bg-parliament-700 text-white rounded-lg text-sm">Guardar</button>
                  <button
                    onClick={() => { setShowSenatorForm(false); setEditingSenator(null); }}
                    className="px-4 py-2 bg-gray-200 rounded-lg text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {senators.filter((s) => s.isActive).map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-sm">{s.fullName}</p>
                    <p className="text-xs text-gray-500">{s.party}{s.caucus ? ` · ${s.caucus}` : ""}</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setEditingSenator(s);
                        setShowSenatorForm(false);
                        setSenatorForm({ fullName: s.fullName, party: s.party, caucus: s.caucus ?? "" });
                      }}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteSenator(s.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

function PostAdminCard({
  post,
  onModerate,
  highlight = false,
}: {
  post: PostWithAuthor;
  onModerate: (id: string, action: "approve" | "reject" | "block", note?: string) => void;
  highlight?: boolean;
}) {
  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    approved: "bg-emerald-100 text-emerald-700",
    rejected: "bg-gray-100 text-gray-600",
    blocked: "bg-red-100 text-red-700",
  };

  return (
    <div className={`border rounded-xl p-4 space-y-2 ${highlight ? "border-amber-300 bg-amber-50/50" : "border-gray-200"}`}>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-semibold text-sm">{post.author.displayName}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full border ${POST_TAG_COLORS[post.tag]}`}>
          {POST_TAG_LABELS[post.tag]}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[post.status]}`}>
          {POST_STATUS_LABELS[post.status]}
        </span>
        {post.parentPostId && (
          <span className="text-xs text-gray-400">↳ Respuesta</span>
        )}
        <span className="text-xs text-gray-400 ml-auto">
          {new Date(post.createdAt).toLocaleString("es-CO")}
        </span>
      </div>
      <p className="text-sm text-gray-800">{post.content}</p>
      {post.moderationNote && (
        <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
          Filtro: {post.moderationNote}
        </p>
      )}
      {(post.status === "pending" || post.status === "rejected") && (
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => onModerate(post.id, "approve")}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs hover:bg-emerald-700"
          >
            <Check className="w-3 h-3" /> Aprobar
          </button>
          <button
            onClick={() => onModerate(post.id, "reject")}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-200 text-gray-700 text-xs"
          >
            <X className="w-3 h-3" /> Rechazar
          </button>
          <button
            onClick={() => onModerate(post.id, "block", "Bloqueado por el Secretario General")}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs"
          >
            <Ban className="w-3 h-3" /> Bloquear
          </button>
        </div>
      )}
      {post.status === "approved" && (
        <button
          onClick={() => onModerate(post.id, "block", "Bloqueado por el Secretario General")}
          className="text-xs text-red-600 hover:underline"
        >
          Bloquear despacho
        </button>
      )}
    </div>
  );
}