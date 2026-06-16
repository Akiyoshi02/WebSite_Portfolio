import { useEffect, useState } from "react";
import { fallbackEducation } from "@/lib/fallbackContent";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { EducationRow, LogoType } from "@/types/supabase";
import AdminConfirmModal from "../ui/AdminConfirmModal";
import AdminField from "../ui/AdminField";
import AdminFileUpload from "../ui/AdminFileUpload";
import AdminTagInput from "../ui/AdminTagInput";
import type { ModuleProps } from "./moduleUtils";
import { sortByOrder, toNullableString, withUpdatedAt } from "./moduleUtils";

type EducationForm = Omit<EducationRow, "id" | "created_at" | "updated_at"> & {
  id?: string;
};

function blankEducation(): EducationForm {
  return {
    institution: "",
    period: "",
    degree: "",
    logo_path: null,
    logo_type: "wide",
    logo_width: 0,
    logo_height: 0,
    tags: [],
    sort_order: 50,
  };
}

export default function EducationModule({ notify }: ModuleProps) {
  const [items, setItems] = useState<EducationRow[]>(fallbackEducation);
  const [form, setForm] = useState<EducationForm | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EducationRow | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    if (!isSupabaseConfigured) return;
    const { data, error } = await supabase.from("education").select("*").order("sort_order", { ascending: true });
    if (error) {
      notify(error.message, "error");
      return;
    }
    setItems((data ?? []) as EducationRow[]);
  }

  useEffect(() => {
    void load();
  }, []);

  function patch(next: Partial<EducationForm>) {
    setForm((current) => (current ? { ...current, ...next } : current));
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
      logo_path: toNullableString(rawPayload.logo_path),
    });
    const result = id
      ? await supabase.from("education").update(payload).eq("id", id)
      : await supabase.from("education").insert(payload);
    setSaving(false);

    if (result.error) {
      notify(result.error.message, "error");
      return;
    }

    notify(id ? "Education updated." : "Education added.");
    setForm(null);
    await load();
  }

  async function deleteEducation() {
    if (!deleteTarget) return;
    const { error } = await supabase.from("education").delete().eq("id", deleteTarget.id);
    if (error) {
      notify(error.message, "error");
      return;
    }
    notify("Education deleted.");
    setDeleteTarget(null);
    await load();
  }

  return (
    <section className="admin-module is-wide">
      <header className="admin-module-header">
        <div>
          <p className="admin-module-subtitle">// 06. Education</p>
          <h1 className="admin-module-title">Education</h1>
        </div>
        <button className="admin-btn-add" type="button" onClick={() => setForm(blankEducation())}>
          Add Education
        </button>
      </header>

      {form ? (
        <div className="admin-card">
          <h2 className="admin-card-title">{form.id ? `Edit ${form.institution}` : "New Education"}</h2>
          <p className="admin-card-note">
            Education entries appear in the homepage Education section, ordered by the display order value.
          </p>
          <AdminField label="Institution Name" hint="Shown as the main school, university, or institution name.">
            <input value={form.institution} onChange={(event) => patch({ institution: event.target.value })} />
          </AdminField>
          <div className="admin-row">
            <AdminField label="Study Period" hint="Shown with the education entry, for example 2022 - 2025 or 2025 - Present.">
              <input value={form.period} onChange={(event) => patch({ period: event.target.value })} />
            </AdminField>
            <AdminField label="Display Order" hint="Lower numbers appear earlier in the Education section.">
              <input type="number" value={form.sort_order} onChange={(event) => patch({ sort_order: Number(event.target.value) })} />
            </AdminField>
          </div>
          <AdminField label="Degree / Qualification" hint="Shown under the institution name.">
            <input value={form.degree} onChange={(event) => patch({ degree: event.target.value })} />
          </AdminField>
          <AdminField label="Education Tags" hint="Shown as chips for subjects, achievements, or context. Keep each tag short.">
            <AdminTagInput value={form.tags} onChange={(tags) => patch({ tags })} />
          </AdminField>

          <div className="admin-card" style={{ boxShadow: "none" }}>
            <h3 className="admin-card-title">Logo</h3>
            <p className="admin-card-note">
              The logo appears beside the education entry. Use upload when possible; it fills the public URL automatically.
            </p>
            <AdminField label="Logo Path / Public URL" hint="Path or public URL for the institution logo. Leave empty to show a text fallback.">
              <input value={form.logo_path ?? ""} onChange={(event) => patch({ logo_path: event.target.value })} />
            </AdminField>
            <div className="admin-row-3">
              <AdminField label="Logo Shape Type" hint="Use crest for square/round emblems and wide for horizontal wordmarks.">
                <select value={form.logo_type} onChange={(event) => patch({ logo_type: event.target.value as LogoType })}>
                  <option value="crest">crest</option>
                  <option value="wide">wide</option>
                </select>
              </AdminField>
              <AdminField label="Logo Source Width" hint="Original image width in pixels. Helps Astro reserve the right image space.">
                <input type="number" value={form.logo_width} onChange={(event) => patch({ logo_width: Number(event.target.value) })} />
              </AdminField>
              <AdminField label="Logo Source Height" hint="Original image height in pixels. Helps prevent layout shift.">
                <input type="number" value={form.logo_height} onChange={(event) => patch({ logo_height: Number(event.target.value) })} />
              </AdminField>
            </div>
            <AdminFileUpload
              folder="logos"
              previewUrl={form.logo_path}
              recommendedWidth={form.logo_type === "crest" ? 512 : 520}
              recommendedHeight={form.logo_type === "crest" ? 512 : 208}
              recommendedNote={
                form.logo_type === "crest"
                  ? "Matches the square crest placement in the Education section."
                  : "Matches the wide education logo placement."
              }
              previewShape={form.logo_type === "crest" ? "rounded" : "rect"}
              previewFit="contain"
              lockRatioByDefault
              onUploaded={(logo_path, metadata) =>
                patch({
                  logo_path,
                  logo_width: metadata?.width ?? (form.logo_type === "crest" ? 512 : 520),
                  logo_height: metadata?.height ?? (form.logo_type === "crest" ? 512 : 208),
                })
              }
              onRemove={() => patch({ logo_path: null })}
            />
          </div>

          <div className="admin-form-actions">
            <button className="admin-btn-ghost" type="button" onClick={() => setForm(null)}>
              Cancel
            </button>
            <button className="admin-btn-save" type="button" onClick={() => void save()} disabled={saving}>
              {saving ? "Saving..." : "Save Education"}
            </button>
          </div>
        </div>
      ) : (
        <div className="admin-list">
          {sortByOrder(items).map((item) => (
            <article className="admin-list-item" key={item.id}>
              {item.logo_path ? (
                <img src={item.logo_path} alt="" width="48" height="48" style={{ objectFit: "contain" }} />
              ) : (
                <span className="admin-pill">{item.logo_type}</span>
              )}
              <div className="admin-list-item-info">
                <div className="admin-list-item-title">{item.institution}</div>
                <div className="admin-list-item-meta">
                  {item.period} / {item.degree}
                </div>
              </div>
              <div className="admin-list-actions">
                <button className="admin-btn-small" type="button" data-admin-action="edit" onClick={() => setForm({ ...item })}>
                  Edit
                </button>
                <button
                  className="admin-btn-delete"
                  type="button"
                  aria-label={`Delete ${item.institution}`}
                  onClick={() => setDeleteTarget(item)}
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
        title="Delete education?"
        message={`Delete ${deleteTarget?.institution ?? "this education entry"}?`}
        confirmLabel="Delete"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void deleteEducation()}
      />
    </section>
  );
}
