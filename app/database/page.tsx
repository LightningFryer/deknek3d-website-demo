"use client";
import { useState, useEffect, useCallback } from "react";
import { authClient } from "@/app/lib/auth-client";
import type { Note } from "@/app/db/notes-schema";

type NoteWithOwnership = Note & { isOwner: boolean };

export default function DatabasePage() {
  const { data: session } = authClient.useSession();
  const [notes, setNotes] = useState<NoteWithOwnership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [creating, setCreating] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editIsPublic, setEditIsPublic] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/notes");
      if (!res.ok) throw new Error("Failed to fetch notes");
      const data: Note[] = await res.json();
      const enriched = data.map((n) => ({
        ...n,
        isOwner: session?.user?.id === n.userId,
      }));
      setNotes(enriched);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load notes");
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, isPublic }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to create note");
      }
      setTitle("");
      setContent("");
      setIsPublic(false);
      await fetchNotes();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create note");
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (note: NoteWithOwnership) => {
    setEditingId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditIsPublic(note.isPublic);
  };

  const cancelEdit = () => setEditingId(null);

  const handleSave = async (id: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          content: editContent,
          isPublic: editIsPublic,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to update note");
      }
      setEditingId(null);
      await fetchNotes();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update note");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this note?")) return;
    try {
      const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete note");
      await fetchNotes();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete note");
    }
  };

  const myNotes = notes.filter((n) => n.isOwner);
  const publicNotes = notes.filter((n) => !n.isOwner && n.isPublic);

  return (
    <main className="min-h-screen p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold">Database Explorer</h1>
          <p className="text-base-content/60 mt-1">
            Create, Read, Update, Delete notes stored in PostgreSQL
          </p>
        </div>
        <a href="/" className="btn btn-ghost rounded-xl">
          ← Home
        </a>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Notes", value: notes.length },
          { label: "My Notes", value: myNotes.length },
          {
            label: "Public Notes",
            value:
              publicNotes.length + myNotes.filter((n) => n.isPublic).length,
          },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="border border-base-300 bg-base-200 rounded-xl p-4 text-center drop-shadow-sm"
          >
            <p className="text-3xl font-bold">{value}</p>
            <p className="text-base-content/60 text-sm">{label}</p>
          </div>
        ))}
      </div>

      {error && (
        <div className="alert alert-error rounded-xl mb-4">
          <span>{error}</span>
          <button
            className="btn btn-sm btn-ghost"
            onClick={() => setError(null)}
          >
            ✕
          </button>
        </div>
      )}

      {session?.user ? (
        <form
          onSubmit={handleCreate}
          className="border border-base-300 bg-base-200 rounded-xl p-6 mb-8 drop-shadow-md"
        >
          <p className="text-xl font-bold mb-4">Create New Note</p>
          <div className="flex flex-col gap-3">
            <input
              type="text"
              className="input input-bordered rounded-xl w-full"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <textarea
              className="textarea textarea-bordered rounded-xl w-full h-24"
              placeholder="Content (optional)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                className="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
              <span className="text-sm">Make public (visible to everyone)</span>
            </label>
            <button
              type="submit"
              className="btn btn-primary rounded-xl"
              disabled={creating}
            >
              {creating ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                "Save Note"
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="alert mb-8 rounded-xl border border-base-300 bg-base-200">
          <span>
            <a href="/signin" className="link link-primary font-medium">
              Sign in
            </a>{" "}
            to create, edit, and delete notes.
          </span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg" />
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-12 text-base-content/50">
          No notes yet.{" "}
          {session?.user ? "Create one above!" : "Sign in to create notes."}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {myNotes.length > 0 && (
            <>
              <p className="text-lg font-semibold text-base-content/70">
                My Notes
              </p>
              {myNotes.map((note) =>
                editingId === note.id ? (
                  <div
                    key={note.id}
                    className="border border-primary/40 bg-base-200 rounded-xl p-5 drop-shadow-md"
                  >
                    <input
                      className="input input-bordered rounded-xl w-full mb-2"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                    />
                    <textarea
                      className="textarea textarea-bordered rounded-xl w-full h-24 mb-2"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                    />
                    <label className="flex items-center gap-2 mb-3 cursor-pointer select-none text-sm">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm"
                        checked={editIsPublic}
                        onChange={(e) => setEditIsPublic(e.target.checked)}
                      />
                      Public
                    </label>
                    <div className="flex gap-2">
                      <button
                        className="btn btn-primary btn-sm rounded-xl"
                        onClick={() => handleSave(note.id)}
                        disabled={saving}
                      >
                        {saving ? (
                          <span className="loading loading-spinner loading-xs" />
                        ) : (
                          "Save"
                        )}
                      </button>
                      <button
                        className="btn btn-ghost btn-sm rounded-xl"
                        onClick={cancelEdit}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={() => startEdit(note)}
                    onDelete={() => handleDelete(note.id)}
                  />
                ),
              )}
            </>
          )}

          {publicNotes.length > 0 && (
            <>
              <p className="text-lg font-semibold text-base-content/70 mt-4">
                Public Notes
              </p>
              {publicNotes.map((note) => (
                <NoteCard key={note.id} note={note} />
              ))}
            </>
          )}
        </div>
      )}
    </main>
  );
}

function NoteCard({
  note,
  onEdit,
  onDelete,
}: {
  note: NoteWithOwnership;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  return (
    <div className="border border-base-300 bg-base-200 rounded-xl p-5 drop-shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-lg leading-tight">{note.title}</p>
            {note.isPublic && (
              <span className="badge badge-outline badge-sm">Public</span>
            )}
            {!note.isPublic && note.isOwner && (
              <span className="badge badge-outline badge-sm opacity-50">
                Private
              </span>
            )}
          </div>
          {note.content && (
            <p className="text-base-content/70 mt-1 text-sm whitespace-pre-wrap">
              {note.content}
            </p>
          )}
          <p className="text-base-content/40 text-xs mt-2">
            {new Date(note.createdAt).toLocaleString()}
          </p>
        </div>
        {note.isOwner && (
          <div className="flex gap-1 shrink-0">
            <button
              className="btn btn-ghost btn-sm rounded-xl"
              onClick={onEdit}
            >
              Edit
            </button>
            <button
              className="btn btn-ghost btn-sm rounded-xl text-error"
              onClick={onDelete}
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
