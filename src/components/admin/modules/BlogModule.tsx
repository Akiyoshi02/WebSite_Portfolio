import { useEffect, useState } from "react";
import { fallbackBlogPosts } from "@/lib/fallbackContent";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { BlogPostRow } from "@/types/supabase";
import AdminConfirmModal from "../ui/AdminConfirmModal";
import AdminField from "../ui/AdminField";
import AdminFileUpload from "../ui/AdminFileUpload";
import AdminMarkdownEditor from "../ui/AdminMarkdownEditor";
import AdminTagInput from "../ui/AdminTagInput";
import type { ModuleProps } from "./moduleUtils";
import { slugify, toNullableString, withUpdatedAt } from "./moduleUtils";

type BlogForm = Omit<BlogPostRow, "id" | "created_at" | "updated_at"> & {
  id?: string;
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

function blankPost(): BlogForm {
  return {
    title: "",
    slug: "",
    description: "",
    pub_date: today(),
    updated_date: null,
    tags: [],
    cover_url: null,
    cover_alt: null,
    draft: false,
    body: "",
  };
}

export default function BlogModule({ notify }: ModuleProps) {
  const [posts, setPosts] = useState<BlogPostRow[]>(fallbackBlogPosts);
  const [form, setForm] = useState<BlogForm | null>(null);
  const [slugEdited, setSlugEdited] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BlogPostRow | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    if (!isSupabaseConfigured) return;
    const { data, error } = await supabase.from("blog_posts").select("*").order("pub_date", { ascending: false });
    if (error) {
      notify(error.message, "error");
      return;
    }
    setPosts((data ?? []) as BlogPostRow[]);
  }

  useEffect(() => {
    void load();
  }, []);

  function patch(next: Partial<BlogForm>) {
    setForm((current) => (current ? { ...current, ...next } : current));
  }

  function handleTitle(value: string) {
    setForm((current) => {
      if (!current) return current;
      return { ...current, title: value, slug: slugEdited ? current.slug : slugify(value) };
    });
  }

  async function save() {
    if (!form) return;
    if (!isSupabaseConfigured) {
      notify("Supabase is not configured yet.", "error");
      return;
    }

    setSaving(true);
    const { id, ...rawPayload } = form;
    const payload = withUpdatedAt({
      ...rawPayload,
      updated_date: toNullableString(rawPayload.updated_date),
      cover_url: toNullableString(rawPayload.cover_url),
      cover_alt: toNullableString(rawPayload.cover_alt),
    });
    const result = id
      ? await supabase.from("blog_posts").update(payload).eq("id", id)
      : await supabase.from("blog_posts").insert(payload);
    setSaving(false);

    if (result.error) {
      notify(result.error.message, "error");
      return;
    }

    notify(id ? "Blog post updated." : "Blog post created.");
    setForm(null);
    await load();
  }

  async function deletePost() {
    if (!deleteTarget) return;
    const { error } = await supabase.from("blog_posts").delete().eq("id", deleteTarget.id);
    if (error) {
      notify(error.message, "error");
      return;
    }
    notify("Blog post deleted.");
    setDeleteTarget(null);
    await load();
  }

  return (
    <section className="admin-module is-wide">
      <header className="admin-module-header">
        <div>
          <p className="admin-module-subtitle">// 08. Blog</p>
          <h1 className="admin-module-title">Blog Posts</h1>
        </div>
        <button
          className="admin-btn-add"
          type="button"
          onClick={() => {
            setForm(blankPost());
            setSlugEdited(false);
          }}
        >
          New Post
        </button>
      </header>

      {form ? (
        <div className="admin-card">
          <h2 className="admin-card-title">{form.id ? `Edit ${form.title}` : "New Post"}</h2>
          <p className="admin-card-note">
            Blog posts appear on the Writing page, the homepage Writing preview, RSS, and their own /blog/[slug] pages when published.
          </p>
          <AdminField label="Post Title" hint="Shown on the blog index, homepage Writing preview, post page, RSS, and SEO title.">
            <input value={form.title} onChange={(event) => handleTitle(event.target.value)} />
          </AdminField>
          <AdminField label="Post URL Slug" hint="Controls the URL, for example /blog/hello-world. Changing this can break old links.">
            <input
              value={form.slug}
              onChange={(event) => {
                setSlugEdited(true);
                patch({ slug: event.target.value });
              }}
            />
          </AdminField>
          <AdminField label="Post Summary" hint="Shown in blog listings, RSS, social previews, and the top of the post page.">
            <textarea value={form.description} onChange={(event) => patch({ description: event.target.value })} />
          </AdminField>
          <div className="admin-row">
            <AdminField label="Published Date" hint="Shown on the post page and used as RSS/article publish metadata.">
              <input type="date" value={form.pub_date} onChange={(event) => patch({ pub_date: event.target.value })} />
            </AdminField>
            <AdminField label="Updated Date" hint="Optional. When set, it appears on the post page and article modified metadata.">
              <input
                type="date"
                value={form.updated_date ?? ""}
                onChange={(event) => patch({ updated_date: event.target.value || null })}
              />
            </AdminField>
          </div>
          <AdminField label="Post Tags" hint="Shown on the post page and included as RSS categories.">
            <AdminTagInput value={form.tags} onChange={(tags) => patch({ tags })} />
          </AdminField>
          <label className="admin-toggle-row">
            <span>
              <span className="admin-toggle-label">Draft</span>
              <span className="admin-toggle-desc">Hides this post from public listings and generated post pages.</span>
            </span>
            <input type="checkbox" checked={form.draft} onChange={(event) => patch({ draft: event.target.checked })} />
          </label>
          <div className="admin-row">
            <AdminField label="Cover Image URL" hint="Optional social/listing image where supported. Leave empty if the post has no cover.">
              <input value={form.cover_url ?? ""} onChange={(event) => patch({ cover_url: event.target.value })} />
            </AdminField>
            <AdminField label="Cover Image Alt Text" hint="Accessibility text for the cover image. Describe the image itself.">
              <input value={form.cover_alt ?? ""} onChange={(event) => patch({ cover_alt: event.target.value })} />
            </AdminField>
          </div>
          <AdminFileUpload
            label="Upload blog cover"
            folder="blog-covers"
            previewUrl={form.cover_url}
            recommendedWidth={1200}
            recommendedHeight={675}
            recommendedNote="Matches the 16:9 Writing card cover and blog post cover."
            previewShape="rect"
            lockRatioByDefault
            onUploaded={(cover_url) => patch({ cover_url })}
            onRemove={() => patch({ cover_url: null })}
          />
          <AdminMarkdownEditor
            hint="Main post content shown on the /blog/[slug] page. Supports Markdown."
            value={form.body}
            onChange={(body) => patch({ body })}
          />
          <div className="admin-form-actions">
            <button className="admin-btn-ghost" type="button" onClick={() => setForm(null)}>
              Cancel
            </button>
            <button className="admin-btn-save" type="button" onClick={() => void save()} disabled={saving}>
              {saving ? "Saving..." : "Save Post"}
            </button>
          </div>
        </div>
      ) : (
        <div className="admin-list">
          {posts.map((post) => (
            <article className="admin-list-item" key={post.id}>
              <div className="admin-list-item-info">
                <div className="admin-list-item-title">{post.title}</div>
                <div className="admin-list-item-meta">
                  {post.pub_date} / {post.tags.join(", ") || "no tags"}
                </div>
                {post.draft ? <span className="admin-pill">Draft</span> : null}
              </div>
              <div className="admin-list-actions">
                <button
                  className="admin-btn-small"
                  type="button"
                  data-admin-action="edit"
                  onClick={() => {
                    setForm({ ...post });
                    setSlugEdited(true);
                  }}
                >
                  Edit
                </button>
                <button
                  className="admin-btn-delete"
                  type="button"
                  aria-label={`Delete ${post.title}`}
                  onClick={() => setDeleteTarget(post)}
                >
                  x
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <AdminConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete blog post?"
        message={`Delete ${deleteTarget?.title ?? "this post"}?`}
        confirmLabel="Delete"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void deletePost()}
      />
    </section>
  );
}
