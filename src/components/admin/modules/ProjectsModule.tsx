import { useEffect, useRef, useState } from "react";
import { fallbackProjects } from "@/lib/fallbackContent";
import { createProjectMediaItem, normaliseProjectMedia, projectMediaTypeFromUrl } from "@/lib/projectMedia";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { ProjectCategory, ProjectMediaItem, ProjectMediaType, ProjectRow } from "@/types/supabase";
import AdminConfirmModal from "../ui/AdminConfirmModal";
import AdminField from "../ui/AdminField";
import AdminFileUpload from "../ui/AdminFileUpload";
import AdminMarkdownEditor from "../ui/AdminMarkdownEditor";
import AdminTagInput from "../ui/AdminTagInput";
import type { ModuleProps } from "./moduleUtils";
import { slugify, sortByOrder, toNullableNumber, toNullableString, withUpdatedAt } from "./moduleUtils";

type ProjectForm = Omit<ProjectRow, "id" | "created_at" | "updated_at"> & {
  id?: string;
};

const categories: ProjectCategory[] = ["web", "api", "mobile", "open-source", "other"];
const maxProjectVideoBytes = 100 * 1024 * 1024;

function fileSafeName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9.-]+/g, "-").replace(/^-+|-+$/g, "") || "project-video";
}

function normaliseProjectForForm(project: ProjectRow): ProjectRow {
  return {
    ...project,
    media_items: normaliseProjectMedia(project.media_items),
  };
}

function blankProject(): ProjectForm {
  return {
    title: "",
    slug: "",
    tagline: "",
    description: "",
    category: "web",
    stack: [],
    year: new Date().getFullYear(),
    featured: false,
    wide: false,
    theme_from: "#00f5d4",
    theme_to: "#7b2fff",
    stars: null,
    forks: null,
    cover_url: null,
    cover_alt: null,
    media_items: [],
    link_live: null,
    link_repo: null,
    link_case_study: null,
    draft: false,
    sort_order: 50,
    body: "## Context\n\n\n## What's in it\n\n\n## Decisions\n\n",
  };
}

interface ProjectVideoUploadProps {
  mediaId: string;
  onUploaded: (url: string) => void;
  onError: (message: string) => void;
}

function ProjectVideoUpload({ mediaId, onUploaded, onError }: ProjectVideoUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File | null | undefined) {
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      onError("Please choose a video file.");
      return;
    }

    if (file.size > maxProjectVideoBytes) {
      onError("Please choose a video under 100 MB.");
      return;
    }

    if (!isSupabaseConfigured) {
      onError("Supabase env vars are not configured yet.");
      return;
    }

    setUploading(true);
    try {
      const path = `project-videos/${Date.now()}-${fileSafeName(file.name)}`;
      const { error } = await supabase.storage.from("portfolio-assets").upload(path, file, {
        contentType: file.type || "video/mp4",
        upsert: true,
      });

      if (error) throw error;

      const { data } = supabase.storage.from("portfolio-assets").getPublicUrl(path);
      onUploaded(data.publicUrl);
    } catch (error) {
      onError(error instanceof Error ? error.message : "Video upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="admin-field project-video-upload">
      <label>Upload Video File</label>
      <input
        ref={inputRef}
        id={`project-video-${mediaId}`}
        type="file"
        accept="video/*"
        onChange={(event) => void handleFile(event.target.files?.[0])}
      />
      <button className="admin-btn-small" type="button" onClick={() => inputRef.current?.click()} disabled={uploading}>
        {uploading ? "Uploading..." : "Upload video"}
      </button>
      <span className="admin-field-hint">MP4, WebM, MOV up to 100 MB.</span>
    </div>
  );
}

export default function ProjectsModule({ notify }: ModuleProps) {
  const [projects, setProjects] = useState<ProjectRow[]>(fallbackProjects.map(normaliseProjectForForm));
  const [form, setForm] = useState<ProjectForm | null>(null);
  const [slugEdited, setSlugEdited] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ProjectRow | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    if (!isSupabaseConfigured) return;
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) {
      notify(error.message, "error");
      return;
    }
    setProjects(((data ?? []) as ProjectRow[]).map(normaliseProjectForForm));
  }

  useEffect(() => {
    void load();
  }, []);

  function startNew() {
    setForm(blankProject());
    setSlugEdited(false);
  }

  function startEdit(project: ProjectRow) {
    setForm({ ...normaliseProjectForForm(project) });
    setSlugEdited(true);
  }

  function patch(next: Partial<ProjectForm>) {
    setForm((current) => (current ? { ...current, ...next } : current));
  }

  function handleTitle(value: string) {
    setForm((current) => {
      if (!current) return current;
      return {
        ...current,
        title: value,
        slug: slugEdited ? current.slug : slugify(value),
      };
    });
  }

  function addMediaItem(type: ProjectMediaType) {
    setForm((current) => {
      if (!current) return current;
      return {
        ...current,
        media_items: [...current.media_items, createProjectMediaItem(type)],
      };
    });
  }

  function updateMediaItem(id: string, next: Partial<ProjectMediaItem>) {
    setForm((current) => {
      if (!current) return current;
      return {
        ...current,
        media_items: current.media_items.map((item) => (item.id === id ? { ...item, ...next } : item)),
      };
    });
  }

  function removeMediaItem(id: string) {
    setForm((current) => {
      if (!current) return current;
      return {
        ...current,
        media_items: current.media_items.filter((item) => item.id !== id),
      };
    });
  }

  function moveMediaItem(id: string, direction: -1 | 1) {
    setForm((current) => {
      if (!current) return current;
      const index = current.media_items.findIndex((item) => item.id === id);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= current.media_items.length) return current;

      const nextItems = [...current.media_items];
      const [item] = nextItems.splice(index, 1);
      nextItems.splice(nextIndex, 0, item);

      return {
        ...current,
        media_items: nextItems,
      };
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
      title: rawPayload.title.trim(),
      slug: rawPayload.slug.trim(),
      stars: toNullableNumber(rawPayload.stars),
      forks: toNullableNumber(rawPayload.forks),
      cover_url: toNullableString(rawPayload.cover_url),
      cover_alt: toNullableString(rawPayload.cover_alt),
      media_items: normaliseProjectMedia(rawPayload.media_items),
      link_live: toNullableString(rawPayload.link_live),
      link_repo: toNullableString(rawPayload.link_repo),
      link_case_study: toNullableString(rawPayload.link_case_study),
    });

    const result = id
      ? await supabase.from("projects").update(payload).eq("id", id)
      : await supabase.from("projects").insert(payload);

    setSaving(false);
    if (result.error) {
      if (result.error.message.includes("media_items")) {
        notify("Project media needs the new projects.media_items column. Run the updated Supabase CMS SQL, then save again.", "error");
        return;
      }
      notify(result.error.message, "error");
      return;
    }

    notify(id ? "Project updated." : "Project created.");
    setForm(null);
    await load();
  }

  async function deleteProject() {
    if (!deleteTarget) return;
    const { error } = await supabase.from("projects").delete().eq("id", deleteTarget.id);
    if (error) {
      notify(error.message, "error");
      return;
    }
    notify("Project deleted.");
    setDeleteTarget(null);
    await load();
  }

  return (
    <section className="admin-module is-wide">
      <header className="admin-module-header">
        <div>
          <p className="admin-module-subtitle">// 04. Projects</p>
          <h1 className="admin-module-title">Projects</h1>
        </div>
        <button className="admin-btn-add" type="button" onClick={startNew}>
          Add Project
        </button>
      </header>

      {form ? (
        <div className="admin-card">
          <h2 className="admin-card-title">{form.id ? `Edit ${form.title}` : "New Project"}</h2>
          <p className="admin-card-note">
            Project entries appear in the homepage Projects grid and generate detail pages at /projects/[slug] when published.
          </p>
          <div className="admin-row">
            <AdminField label="Project Title" hint="Shown on project cards, project detail pages, terminal project output, and SEO titles.">
              <input value={form.title} onChange={(event) => handleTitle(event.target.value)} />
            </AdminField>
            <AdminField label="Project URL Slug" hint="Controls the project page URL, for example /projects/interviewai-pro. Changing this can break old links.">
              <input
                value={form.slug}
                onChange={(event) => {
                  setSlugEdited(true);
                  patch({ slug: event.target.value });
                }}
              />
            </AdminField>
          </div>
          <AdminField label="Short Tagline" hint="Shown as the short summary on the project detail page and used as its SEO description fallback.">
            <input value={form.tagline} onChange={(event) => patch({ tagline: event.target.value })} />
          </AdminField>
          <AdminField label="Project Card Description" hint="Shown on homepage project cards and in terminal project output. Also helps the AI-project command detect AI-related work.">
            <textarea value={form.description} onChange={(event) => patch({ description: event.target.value })} />
          </AdminField>
          <div className="admin-row-3">
            <AdminField label="Filter Category" hint="Controls which homepage project filter tab this card belongs to.">
              <select value={form.category} onChange={(event) => patch({ category: event.target.value as ProjectCategory })}>
                {categories.map((category) => (
                  <option value={category} key={category}>
                    {category}
                  </option>
                ))}
              </select>
            </AdminField>
            <AdminField label="Project Year" hint="Shown on cards, detail pages, terminal, and SEO data.">
              <input type="number" value={form.year} onChange={(event) => patch({ year: Number(event.target.value) })} />
            </AdminField>
            <AdminField label="Display Order" hint="Lower numbers appear earlier in the homepage Projects grid.">
              <input
                type="number"
                value={form.sort_order}
                onChange={(event) => patch({ sort_order: Number(event.target.value) })}
              />
            </AdminField>
          </div>

          <div className="admin-card" style={{ boxShadow: "none" }}>
            <h3 className="admin-card-title">Display Flags</h3>
            <p className="admin-card-note">
              These switches control whether the project is visible and how much space it gets in the grid.
            </p>
            <div className="admin-row-3">
              {(
                [
                  ["Featured", "featured", "Marks the project as featured and shows a Featured badge."],
                  ["Wide Card", "wide", "Lets this project use a wider card layout where the grid supports it."],
                  ["Draft", "draft", "Hides this project from the public site until it is turned off."],
                ] as const
              ).map(([label, key, description]) => (
                <label className="admin-toggle-row" key={key}>
                  <span>
                    <span className="admin-toggle-label">{label}</span>
                    <span className="admin-toggle-desc">{description}</span>
                  </span>
                  <input type="checkbox" checked={form[key]} onChange={(event) => patch({ [key]: event.target.checked })} />
                </label>
              ))}
            </div>
          </div>

          <div className="admin-row">
            <AdminField label="Card Gradient Start" hint="First accent color used by the project card artwork.">
              <div className="admin-color-field">
                <input type="color" value={form.theme_from} onChange={(event) => patch({ theme_from: event.target.value })} />
                <input value={form.theme_from} onChange={(event) => patch({ theme_from: event.target.value })} />
              </div>
            </AdminField>
            <AdminField label="Card Gradient End" hint="Second accent color used by the project card artwork.">
              <div className="admin-color-field">
                <input type="color" value={form.theme_to} onChange={(event) => patch({ theme_to: event.target.value })} />
                <input value={form.theme_to} onChange={(event) => patch({ theme_to: event.target.value })} />
              </div>
            </AdminField>
          </div>

          <AdminField label="Tech Stack" hint="Shown as tags on cards and detail pages. Also appears in terminal output and project SEO keywords.">
            <AdminTagInput value={form.stack} onChange={(stack) => patch({ stack })} />
          </AdminField>

          <div className="admin-row-3">
            <AdminField label="Live Site Link" hint="Adds a View live button when present. Leave empty to hide it.">
              <input value={form.link_live ?? ""} onChange={(event) => patch({ link_live: event.target.value })} />
            </AdminField>
            <AdminField label="Source Code Link" hint="Adds a Source code button and codeRepository metadata when present.">
              <input value={form.link_repo ?? ""} onChange={(event) => patch({ link_repo: event.target.value })} />
            </AdminField>
            <AdminField label="External Case Study Link" hint="Optional external deep-dive link shown on the project detail page and terminal data when configured.">
              <input value={form.link_case_study ?? ""} onChange={(event) => patch({ link_case_study: event.target.value })} />
            </AdminField>
          </div>

          <div className="admin-row">
            <AdminField label="GitHub Stars" hint="Optional display metric for project cards. Leave empty if you do not want to show a count.">
              <input value={form.stars ?? ""} type="number" onChange={(event) => patch({ stars: toNullableNumber(event.target.value) })} />
            </AdminField>
            <AdminField label="GitHub Forks" hint="Optional display metric for project cards. Leave empty if you do not want to show a count.">
              <input value={form.forks ?? ""} type="number" onChange={(event) => patch({ forks: toNullableNumber(event.target.value) })} />
            </AdminField>
          </div>

          <div className="admin-card project-media-manager" style={{ boxShadow: "none" }}>
            <div className="project-media-manager-header">
              <div>
                <h3 className="admin-card-title">Project Media Gallery</h3>
                <p className="admin-card-note">
                  Images and videos shown only on the project detail page. Use Up and Down to control display order.
                </p>
              </div>
              <div className="project-media-manager-actions">
                <button className="admin-btn-small" type="button" onClick={() => addMediaItem("image")}>
                  Add Image
                </button>
                <button className="admin-btn-small" type="button" onClick={() => addMediaItem("video")}>
                  Add Video
                </button>
              </div>
            </div>

            {form.media_items.length ? (
              <div className="project-media-editor-list">
                {form.media_items.map((item, index) => (
                  <article className="project-media-editor" key={item.id}>
                    <header className="project-media-editor-header">
                      <div>
                        <span className="admin-pill">#{index + 1}</span>
                        <strong>{item.type === "video" ? "Video" : "Image"}</strong>
                      </div>
                      <div className="project-media-editor-actions">
                        <button className="admin-btn-ghost" type="button" onClick={() => moveMediaItem(item.id, -1)} disabled={index === 0}>
                          Up
                        </button>
                        <button
                          className="admin-btn-ghost"
                          type="button"
                          onClick={() => moveMediaItem(item.id, 1)}
                          disabled={index === form.media_items.length - 1}
                        >
                          Down
                        </button>
                        <button className="admin-btn-delete" type="button" aria-label="Remove media item" onClick={() => removeMediaItem(item.id)}>
                          x
                        </button>
                      </div>
                    </header>

                    <div className="admin-row">
                      <AdminField label="Media Type" hint="Choose image for screenshots or video for demos, walkthroughs, and clips.">
                        <select value={item.type} onChange={(event) => updateMediaItem(item.id, { type: event.target.value as ProjectMediaType })}>
                          <option value="image">Image</option>
                          <option value="video">Video</option>
                        </select>
                      </AdminField>
                      <AdminField label={item.type === "video" ? "Video URL" : "Image URL"} hint="Paste a public URL or use the upload control below.">
                        <input
                          value={item.url}
                          onChange={(event) => updateMediaItem(item.id, { url: event.target.value })}
                          onBlur={(event) => {
                            if (event.target.value.trim()) {
                              updateMediaItem(item.id, { type: projectMediaTypeFromUrl(event.target.value) });
                            }
                          }}
                        />
                      </AdminField>
                    </div>

                    <div className="admin-row">
                      <AdminField label={item.type === "video" ? "Video Label" : "Image Alt Text"} hint="Used for accessibility and captions where helpful.">
                        <input value={item.alt ?? ""} onChange={(event) => updateMediaItem(item.id, { alt: event.target.value })} />
                      </AdminField>
                      <AdminField label="Caption" hint="Optional short caption displayed below this media item.">
                        <input value={item.caption ?? ""} onChange={(event) => updateMediaItem(item.id, { caption: event.target.value })} />
                      </AdminField>
                    </div>

                    {item.type === "image" ? (
                      <AdminFileUpload
                        label="Upload gallery image"
                        folder="project-media-images"
                        previewUrl={item.url}
                        recommendedWidth={1520}
                        recommendedHeight={840}
                        recommendedNote="Shown in the project detail gallery."
                        previewShape="rect"
                        lockRatioByDefault
                        onUploaded={(url) => updateMediaItem(item.id, { url, type: "image" })}
                        onRemove={() => updateMediaItem(item.id, { url: "" })}
                      />
                    ) : (
                      <>
                        <div className="admin-row">
                          <AdminField label="Poster Image URL" hint="Optional thumbnail for direct video files. YouTube and Vimeo provide their own previews.">
                            <input value={item.poster_url ?? ""} onChange={(event) => updateMediaItem(item.id, { poster_url: event.target.value })} />
                          </AdminField>
                          <ProjectVideoUpload
                            mediaId={item.id}
                            onUploaded={(url) => updateMediaItem(item.id, { url, type: "video" })}
                            onError={(message) => notify(message, "error")}
                          />
                        </div>
                      </>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <p className="admin-empty">No gallery media yet. Add screenshots, demo clips, or walkthrough videos for this project.</p>
            )}
          </div>

          <AdminMarkdownEditor
            hint="Main case-study content shown on the project detail page below the header. Supports Markdown."
            value={form.body}
            onChange={(body) => patch({ body })}
          />

          <div className="admin-form-actions">
            <button className="admin-btn-ghost" type="button" onClick={() => setForm(null)}>
              Cancel
            </button>
            <button className="admin-btn-save" type="button" onClick={() => void save()} disabled={saving}>
              {saving ? "Saving..." : "Save Project"}
            </button>
          </div>
        </div>
      ) : (
        <div className="admin-list">
          {sortByOrder(projects).map((project) => (
            <article className="admin-list-item" key={project.id}>
              <div className="admin-list-item-info">
                <div className="admin-list-item-title">{project.title}</div>
                <div className="admin-list-item-meta">
                  {project.year} / {project.category} / {project.stack.length} stack items
                </div>
                <div className="admin-badge-row">
                  {project.featured ? <span className="admin-pill">Featured</span> : null}
                  {project.draft ? <span className="admin-pill">Draft</span> : null}
                </div>
              </div>
              <div className="admin-list-actions">
                <button className="admin-btn-small" type="button" data-admin-action="edit" onClick={() => startEdit(project)}>
                  Edit
                </button>
                <button
                  className="admin-btn-delete"
                  type="button"
                  aria-label={`Delete ${project.title}`}
                  onClick={() => setDeleteTarget(project)}
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
        title="Delete project?"
        message={`Delete ${deleteTarget?.title ?? "this project"}?`}
        confirmLabel="Delete"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void deleteProject()}
      />
    </section>
  );
}
