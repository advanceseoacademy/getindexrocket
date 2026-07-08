"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AdminBadge,
  AdminLoading,
  AdminPagination,
  AdminPanel,
  AdminSearchBar,
  AdminTable,
  formatDate,
} from "@/components/admin/admin-ui";

const BlogRichEditor = dynamic(
  () => import("@/components/admin/BlogRichEditor").then((m) => m.BlogRichEditor),
  {
    ssr: false,
    loading: () => (
      <div className="h-[360px] animate-pulse rounded-lg border border-[var(--card-border)] bg-[var(--bg3)]" />
    ),
  },
);

type PostRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  featuredImageUrl: string | null;
  content: string;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  status: string;
  publishedAt: string | null;
  authorName: string | null;
  createdAt: string;
  updatedAt: string;
};

const EMPTY_FORM = {
  title: "",
  slug: "",
  excerpt: "",
  featuredImageUrl: "",
  content: "",
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  status: "draft" as "draft" | "published",
};

function isEditorContentEmpty(html: string) {
  return !html.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim();
}

function postToForm(post: PostRow) {
  return {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt ?? "",
    featuredImageUrl: post.featuredImageUrl ?? "",
    content: post.content,
    metaTitle: post.metaTitle ?? "",
    metaDescription: post.metaDescription ?? "",
    metaKeywords: post.metaKeywords ?? "",
    status: post.status === "published" ? ("published" as const) : ("draft" as const),
  };
}

function scrollToEditor(node: HTMLDivElement | null) {
  if (!node) return;
  requestAnimationFrame(() => {
    node.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

export function AdminPosts() {
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loadingEditor, setLoadingEditor] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const editorRef = useRef<HTMLDivElement>(null);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (query) params.set("q", query);
    if (statusFilter) params.set("status", statusFilter);
    const res = await fetch(`/api/admin/posts?${params}`);
    const data = await res.json();
    if (res.ok) {
      setPosts(data.posts);
      setPages(data.pagination.pages);
    }
    setLoading(false);
  }, [page, query, statusFilter]);

  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(q);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  function startCreate() {
    setCreating(true);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setMsg("");
    setErr("");
  }

  async function startEdit(id: string) {
    const cached = posts.find((p) => p.id === id);
    setCreating(false);
    setEditingId(id);
    setMsg("");
    setErr("");

    if (cached) {
      setForm(postToForm(cached));
    } else {
      setLoadingEditor(true);
    }

    try {
      const res = await fetch(`/api/admin/posts/${id}`);
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error ?? "Failed to load post");
        if (!cached) {
          setEditingId(null);
        }
        return;
      }
      setForm(postToForm(data.post as PostRow));
    } finally {
      setLoadingEditor(false);
    }
  }

  function closeEditor() {
    setCreating(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setMsg("");
    setErr("");
  }

  async function savePost(nextStatus?: "draft" | "published") {
    setSaving(true);
    setMsg("");
    setErr("");

    const payload = {
      ...form,
      status: nextStatus ?? form.status,
    };

    const res = editingId
      ? await fetch(`/api/admin/posts/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await fetch("/api/admin/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setErr(data.error ?? "Save failed");
      return;
    }

    setMsg(nextStatus === "published" ? "Published successfully" : "Saved successfully");
    setForm({
      title: data.post.title,
      slug: data.post.slug,
      excerpt: data.post.excerpt ?? "",
      featuredImageUrl: data.post.featuredImageUrl ?? "",
      content: data.post.content,
      metaTitle: data.post.metaTitle ?? "",
      metaDescription: data.post.metaDescription ?? "",
      metaKeywords: data.post.metaKeywords ?? "",
      status: data.post.status === "published" ? "published" : "draft",
    });
    setEditingId(data.post.id);
    setCreating(false);
    await loadPosts();
  }

  async function uploadFeaturedImage(file: File) {
    setUploadingImage(true);
    setErr("");
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/blog-image", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error ?? "Image upload failed");
        return;
      }
      setForm((f) => ({ ...f, featuredImageUrl: data.url }));
    } finally {
      setUploadingImage(false);
    }
  }

  async function deletePost() {
    if (!editingId || !confirm("Delete this post permanently?")) return;
    setSaving(true);
    setErr("");
    const res = await fetch(`/api/admin/posts/${editingId}`, { method: "DELETE" });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json();
      setErr(data.error ?? "Delete failed");
      return;
    }
    closeEditor();
    await loadPosts();
  }

  useEffect(() => {
    if (creating || editingId) {
      scrollToEditor(editorRef.current);
    }
  }, [creating, editingId]);

  const showEditor = creating || editingId;

  function renderEditorPanel() {
    return (
      <div ref={editorRef}>
        <AdminPanel title={creating ? "New post" : "Edit post"}>
          {loadingEditor ? (
            <div className="p-8">
              <AdminLoading />
            </div>
          ) : (
            <div className="space-y-5 p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1 block text-[var(--muted)]">Title *</span>
                <input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--bg2)] px-3 py-2"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-[var(--muted)]">Slug (URL)</span>
                <input
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  placeholder="auto-generated from title"
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--bg2)] px-3 py-2"
                />
              </label>
            </div>

            <label className="block text-sm">
              <span className="mb-1 block text-[var(--muted)]">Excerpt</span>
              <textarea
                value={form.excerpt}
                onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                rows={2}
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--bg2)] px-3 py-2"
              />
            </label>

            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--bg2)] p-4">
              <p className="mb-3 text-sm font-semibold">Featured image</p>
              {form.featuredImageUrl ? (
                <div className="mb-4 overflow-hidden rounded-lg border border-[var(--card-border)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.featuredImageUrl}
                    alt="Featured preview"
                    className="max-h-56 w-full object-cover"
                  />
                </div>
              ) : (
                <p className="mb-3 text-xs text-[var(--muted)]">
                  Shown on the blog list and at the top of the post. Recommended 1200×630 or wider.
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3">
                <label className="cursor-pointer rounded-lg border border-[var(--card-border)] bg-[var(--bg3)] px-4 py-2 text-sm hover:border-[var(--accent)]">
                  {uploadingImage ? "Uploading…" : "Upload image"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="sr-only"
                    disabled={uploadingImage || saving}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void uploadFeaturedImage(file);
                      e.target.value = "";
                    }}
                  />
                </label>
                {form.featuredImageUrl ? (
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, featuredImageUrl: "" }))}
                    className="text-sm text-[#f87171]"
                  >
                    Remove
                  </button>
                ) : null}
              </div>
              <label className="mt-4 block text-sm">
                <span className="mb-1 block text-[var(--muted)]">Or paste image URL</span>
                <input
                  value={form.featuredImageUrl}
                  onChange={(e) => setForm((f) => ({ ...f, featuredImageUrl: e.target.value }))}
                  placeholder="https://… or /blog/your-image.jpg"
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--bg3)] px-3 py-2"
                />
              </label>
            </div>

            <div className="block text-sm">
              <span className="mb-2 block text-[var(--muted)]">Content *</span>
              <BlogRichEditor
                key={editingId ?? "new"}
                value={form.content}
                onChange={(html) => setForm((f) => ({ ...f, content: html }))}
              />
            </div>

            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--bg2)] p-4">
              <p className="mb-3 text-sm font-semibold">SEO settings</p>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-sm">
                  <span className="mb-1 block text-[var(--muted)]">Meta title</span>
                  <input
                    value={form.metaTitle}
                    onChange={(e) => setForm((f) => ({ ...f, metaTitle: e.target.value }))}
                    placeholder="Defaults to post title"
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--bg3)] px-3 py-2"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block text-[var(--muted)]">Meta keywords</span>
                  <input
                    value={form.metaKeywords}
                    onChange={(e) => setForm((f) => ({ ...f, metaKeywords: e.target.value }))}
                    placeholder="backlink indexing, seo, google indexing"
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--bg3)] px-3 py-2"
                  />
                </label>
              </div>
              <label className="mt-4 block text-sm">
                <span className="mb-1 block text-[var(--muted)]">Meta description</span>
                <textarea
                  value={form.metaDescription}
                  onChange={(e) => setForm((f) => ({ ...f, metaDescription: e.target.value }))}
                  rows={2}
                  placeholder="155 characters recommended for search snippets"
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--bg3)] px-3 py-2"
                />
              </label>
            </div>

            {msg ? <p className="text-sm text-[var(--success)]">{msg}</p> : null}
            {err ? <p className="text-sm text-[#f87171]">{err}</p> : null}

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={saving || !form.title.trim() || isEditorContentEmpty(form.content)}
                onClick={() => savePost("draft")}
                className="rounded-lg border border-[var(--card-border)] px-4 py-2 text-sm disabled:opacity-40"
              >
                Save draft
              </button>
              <button
                type="button"
                disabled={saving || !form.title.trim() || isEditorContentEmpty(form.content)}
                onClick={() => savePost("published")}
                className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--on-accent)] disabled:opacity-40"
              >
                {form.status === "published" ? "Update & keep published" : "Publish"}
              </button>
              {editingId && form.status === "published" ? (
                <Link
                  href={`/blog/${form.slug}`}
                  target="_blank"
                  className="text-sm text-[var(--blue)] no-underline hover:underline"
                >
                  View live →
                </Link>
              ) : null}
              {editingId ? (
                <button
                  type="button"
                  disabled={saving}
                  onClick={deletePost}
                  className="ml-auto text-sm text-[#f87171]"
                >
                  Delete
                </button>
              ) : null}
              <button type="button" onClick={closeEditor} className="text-sm text-[var(--muted)]">
                Cancel
              </button>
            </div>
            </div>
          )}
        </AdminPanel>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Blog posts</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Create, publish, and manage SEO-friendly blog content
          </p>
        </div>
        {!showEditor ? (
          <button
            type="button"
            onClick={startCreate}
            className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--on-accent)]"
          >
            + New post
          </button>
        ) : null}
      </div>

      {creating ? renderEditorPanel() : null}

      <AdminPanel
        title="All posts"
        action={
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-[var(--card-border)] bg-[var(--bg2)] px-3 py-2 text-sm"
            >
              <option value="">All statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
            <AdminSearchBar value={q} onChange={setQ} placeholder="Search title or slug…" />
          </div>
        }
      >
        {loading ? (
          <div className="p-8">
            <AdminLoading />
          </div>
        ) : (
          <>
            <AdminTable>
              <thead>
                <tr className="border-b border-[var(--card-border)] text-xs text-[var(--muted)]">
                  <th className="px-5 py-3 font-medium">Title</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Published</th>
                  <th className="px-5 py-3 font-medium">Updated</th>
                  <th className="px-5 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {posts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-[var(--muted)]">
                      No posts yet — create your first blog post
                    </td>
                  </tr>
                ) : (
                  posts.map((post) => (
                    <tr key={post.id} className="border-b border-[var(--card-border)] last:border-0">
                      <td className="px-5 py-3">
                        <div>{post.title}</div>
                        <div className="text-xs text-[var(--muted2)]">/blog/{post.slug}</div>
                      </td>
                      <td className="px-5 py-3">
                        <AdminBadge tone={post.status === "published" ? "green" : "default"}>
                          {post.status}
                        </AdminBadge>
                      </td>
                      <td className="px-5 py-3 text-xs text-[var(--muted)]">
                        {post.publishedAt ? formatDate(post.publishedAt) : "—"}
                      </td>
                      <td className="px-5 py-3 text-xs text-[var(--muted)]">
                        {formatDate(post.updatedAt)}
                      </td>
                      <td className="px-5 py-3">
                        <button
                          type="button"
                          onClick={() => startEdit(post.id)}
                          className="text-sm text-[var(--blue)]"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </AdminTable>
            <AdminPagination page={page} pages={pages} onPage={setPage} />
          </>
        )}
      </AdminPanel>

      {editingId ? renderEditorPanel() : null}
    </div>
  );
}
