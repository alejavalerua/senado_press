"use client";

import { useState, useRef, useEffect } from "react";
import { ImagePlus, Send, X, Loader2, Reply } from "lucide-react";
import { PostTag, PostWithAuthor, POST_TAG_LABELS } from "@/domain/entities/Post";
import { Senator } from "@/domain/entities/Senator";
import { Profile } from "@/domain/entities/Profile";

interface ComposeBoxProps {
  senators: Senator[];
  journalists: Profile[];
  onPublished: () => void;
  replyTo?: PostWithAuthor | null;
  onCancelReply?: () => void;
}

const TAGS: PostTag[] = ["observacion", "debate", "pregunta", "critica", "sesion"];

export function ComposeBox({
  senators,
  journalists,
  onPublished,
  replyTo,
  onCancelReply,
}: ComposeBoxProps) {
  const [content, setContent] = useState("");
  const [tag, setTag] = useState<PostTag>("observacion");
  const [targetSenatorId, setTargetSenatorId] = useState("");
  const [targetJournalistId, setTargetJournalistId] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "warning" | "error"; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isReply = !!replyTo;

  useEffect(() => {
    if (replyTo) {
      setTag(replyTo.tag);
      setTargetJournalistId(replyTo.author.id);
      setContent(`@${replyTo.author.username} `);
      textareaRef.current?.focus();
    }
  }, [replyTo]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setImageUrl(data.url);
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Error al subir imagen" });
      setImagePreview(null);
    } finally {
      setUploading(false);
    }
  }

  function resetForm() {
    setContent("");
    setTag("observacion");
    setTargetSenatorId("");
    setTargetJournalistId("");
    setImageUrl(null);
    setImagePreview(null);
    onCancelReply?.();
  }

  async function handlePublish() {
    const minLength = isReply ? 3 : 10;
    if (content.trim().length < minLength) {
      setMessage({ type: "error", text: `Escribe al menos ${minLength} caracteres` });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          tag,
          imageUrl,
          targetSenatorId: targetSenatorId || null,
          targetJournalistId: targetJournalistId || null,
          parentPostId: replyTo?.id ?? null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage({
        type: data.autoApproved ? "success" : "warning",
        text: data.moderationMessage,
      });

      resetForm();
      onPublished();
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Error al publicar" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`bg-white rounded-2xl card-shadow p-5 space-y-4 ${isReply ? "border-2 border-senate-200" : ""}`}>
      {isReply && replyTo && (
        <div className="flex items-center justify-between bg-senate-50 rounded-lg px-3 py-2">
          <div className="flex items-center gap-2 text-sm text-senate-700">
            <Reply className="w-4 h-4" />
            Respondiendo a <strong>{replyTo.author.displayName}</strong>
          </div>
          <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <h2 className="font-display font-bold text-senate-900 text-lg">
        {isReply ? "Escribir respuesta" : "Redactar despacho"}
      </h2>

      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={
          isReply
            ? "Escribe tu respuesta..."
            : "Escribe tu observación, crítica o pregunta dirigida a un senador o colega periodista..."
        }
        className="w-full h-28 p-4 rounded-xl border border-gray-200 focus:border-senate-400 focus:ring-2 focus:ring-senate-200 outline-none resize-none text-sm leading-relaxed"
        maxLength={2000}
      />

      {!isReply && (
        <div className="flex flex-wrap gap-3">
          <select
            value={tag}
            onChange={(e) => setTag(e.target.value as PostTag)}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:border-senate-400 outline-none"
          >
            {TAGS.map((t) => (
              <option key={t} value={t}>{POST_TAG_LABELS[t]}</option>
            ))}
          </select>

          <select
            value={targetSenatorId}
            onChange={(e) => setTargetSenatorId(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:border-senate-400 outline-none flex-1 min-w-[160px]"
          >
            <option value="">Dirigido a senador...</option>
            {senators.map((s) => (
              <option key={s.id} value={s.id}>{s.fullName} ({s.party})</option>
            ))}
          </select>

          <select
            value={targetJournalistId}
            onChange={(e) => setTargetJournalistId(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:border-senate-400 outline-none flex-1 min-w-[160px]"
          >
            <option value="">Dirigido a periodista...</option>
            {journalists.map((j) => (
              <option key={j.id} value={j.id}>{j.displayName}</option>
            ))}
          </select>
        </div>
      )}

      {imagePreview && (
        <div className="relative inline-block">
          <img src={imagePreview} alt="Vista previa" className="max-h-40 rounded-xl border border-gray-200" />
          <button
            onClick={() => { setImagePreview(null); setImageUrl(null); }}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {message && (
        <div className={`text-sm p-3 rounded-lg ${
          message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
          message.type === "warning" ? "bg-amber-50 text-amber-700 border border-amber-200" :
          "bg-red-50 text-red-700 border border-red-200"
        }`}>
          {message.text}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-senate-700 hover:bg-senate-50 border border-senate-200 transition-colors"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
            Adjuntar imagen
          </button>
        </div>

        <button
          onClick={handlePublish}
          disabled={loading || uploading}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-senate-700 hover:bg-senate-800 text-white font-semibold text-sm transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {isReply ? "Responder" : "Publicar despacho"}
        </button>
      </div>

      {!isReply && (
        <p className="text-xs text-gray-400">
          Los despachos pasan por moderación automática. Contenido inadecuado será revisado antes de publicarse.
        </p>
      )}
    </div>
  );
}