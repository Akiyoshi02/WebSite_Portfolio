import { useEffect, useState } from "react";
import { fallbackWorkExperience } from "@/lib/fallbackContent";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { WorkExperienceRow } from "@/types/supabase";
import AdminConfirmModal from "../ui/AdminConfirmModal";
import AdminField from "../ui/AdminField";
import AdminFileUpload from "../ui/AdminFileUpload";
import AdminMarkdownEditor from "../ui/AdminMarkdownEditor";
import AdminTagInput from "../ui/AdminTagInput";
import type { ModuleProps } from "./moduleUtils";
import { toNullableString, withUpdatedAt } from "./moduleUtils";

type ExperienceForm = Omit<WorkExperienceRow, "id" | "created_at" | "updated_at"> & {
  id?: string;
};

type SupabaseErrorLike = {
  message?: string;
  details?: string;
  hint?: string;
  code?: string;
};

function initialsFromCompany(company: string) {
  const initials = company
    .replace(/\([^)]*\)/g, " ")
    .split(/[^a-z0-9]+/i)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return initials || "CO";
}

function isMissingLogoUrlColumn(error: SupabaseErrorLike | null | undefined) {
  const message = `${error?.message ?? ""} ${error?.details ?? ""} ${error?.hint ?? ""} ${error?.code ?? ""}`.toLowerCase();
  return message.includes("logo_url") && (message.includes("schema cache") || message.includes("column") || message.includes("could not find"));
}

function blankExperience(): ExperienceForm {
  return {
    company: "",
    logo: "",
    logo_url: null,
    title: "",
    date_range: "",
    bullets: [""],
    tags: [],
    sort_order: 50,
    url: null,
    body: "",
  };
}

export default function ExperienceModule({ notify }: ModuleProps) {
  const [items, setItems] = useState<WorkExperienceRow[]>(fallbackWorkExperience);
  const [form, setForm] = useState<ExperienceForm | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<WorkExperienceRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [logoUrlColumnAvailable, setLogoUrlColumnAvailable] = useState(true);

  async function load() {
    if (!isSupabaseConfigured) return;
    const { data, error } = await supabase
      .from("work_experience")
      .select("*")
      .order("sort_order", { ascending: false });
    if (error) {
      notify(error.message, "error");
      return;
    }
    setItems(((data ?? []) as WorkExperienceRow[]).map((item) => ({ ...item, logo_url: item.logo_url ?? null })));
  }

  async function checkLogoUrlColumn() {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.from("work_experience").select("logo_url").limit(1);
    setLogoUrlColumnAvailable(!isMissingLogoUrlColumn(error));
  }

  useEffect(() => {
    void load();
    void checkLogoUrlColumn();
  }, []);

  function patch(next: Partial<ExperienceForm>) {
    setForm((current) => (current ? { ...current, ...next } : current));
  }

  function patchBullet(index: number, value: string) {
    setForm((current) => {
      if (!current) return current;
      const bullets = [...current.bullets];
      bullets[index] = value;
      return { ...current, bullets };
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
    const { logo_url: _logoUrl, ...payloadWithoutLogoUrl } = rawPayload;
    const payloadBase = logoUrlColumnAvailable ? rawPayload : payloadWithoutLogoUrl;
    const logo = (rawPayload.logo || initialsFromCompany(rawPayload.company)).slice(0, 4);
    const payload = withUpdatedAt({
      ...payloadBase,
      logo,
      bullets: rawPayload.bullets.map((item) => item.trim()).filter(Boolean),
      url: toNullableString(rawPayload.url),
      body: toNullableString(rawPayload.body),
    });
    let savedWithoutLogoUrlColumn = false;
    let result = id
      ? await supabase.from("work_experience").update(payload).eq("id", id)
      : await supabase.from("work_experience").insert(payload);

    if (isMissingLogoUrlColumn(result.error)) {
      setLogoUrlColumnAvailable(false);
      savedWithoutLogoUrlColumn = true;
      const retryPayload = withUpdatedAt({
        ...payloadWithoutLogoUrl,
        logo,
        bullets: rawPayload.bullets.map((item) => item.trim()).filter(Boolean),
        url: toNullableString(rawPayload.url),
        body: toNullableString(rawPayload.body),
      });
      result = id
        ? await supabase.from("work_experience").update(retryPayload).eq("id", id)
        : await supabase.from("work_experience").insert(retryPayload);
    }

    setSaving(false);
    if (result.error) {
      notify(result.error.message, "error");
      return;
    }

    notify(
      savedWithoutLogoUrlColumn
        ? "Experience saved. Run the company logo migration before saving logo images."
        : id ? "Experience updated." : "Experience added.",
      savedWithoutLogoUrlColumn ? "error" : "success",
    );
    setForm(null);
    await load();
    await checkLogoUrlColumn();
  }

  async function deleteExperience() {
    if (!deleteTarget) return;
    const { error } = await supabase.from("work_experience").delete().eq("id", deleteTarget.id);
    if (error) {
      notify(error.message, "error");
      return;
    }
    notify("Experience deleted.");
    setDeleteTarget(null);
    await load();
  }

  return (
    <section className="admin-module is-wide">
      <header className="admin-module-header">
        <div>
          <p className="admin-module-subtitle">// 05. Experience</p>
          <h1 className="admin-module-title">Experience</h1>
        </div>
        <button className="admin-btn-add" type="button" onClick={() => setForm(blankExperience())}>
          Add Experience
        </button>
      </header>

      {form ? (
        <div className="admin-card">
          <h2 className="admin-card-title">{form.id ? `Edit ${form.company}` : "New Experience"}</h2>
          <p className="admin-card-note">
            Experience entries appear in the homepage Experience timeline/list and can include optional supporting detail content.
          </p>
          <AdminField label="Company Name" hint="Shown as the main employer/client name in the Experience section.">
            <input value={form.company} onChange={(event) => patch({ company: event.target.value })} />
          </AdminField>
          <div className="admin-card" style={{ boxShadow: "none" }}>
            <h3 className="admin-card-title">Company Logo</h3>
            <p className="admin-card-note">
              Upload a square logo. It appears in a round frame in the public Experience section and this admin list.
            </p>
            {logoUrlColumnAvailable ? (
              <>
                <AdminField label="Company Logo URL" hint="Optional. Paste a public image URL or upload one below.">
                  <input value={form.logo_url ?? ""} onChange={(event) => patch({ logo_url: event.target.value || null })} />
                </AdminField>
                <AdminFileUpload
                  label="Upload company logo"
                  folder="experience-logos"
                  previewUrl={form.logo_url}
                  recommendedWidth={512}
                  recommendedHeight={512}
                  recommendedNote="Matches the circular company logo frame in the Experience section."
                  previewShape="circle"
                  lockRatioByDefault
                  onUploaded={(logo_url) => patch({ logo_url })}
                  onRemove={() => patch({ logo_url: null })}
                />
                {form.logo_url ? (
                  <div className="admin-form-actions">
                    <button className="admin-btn-ghost" type="button" onClick={() => patch({ logo_url: null })}>
                      Remove Logo
                    </button>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="admin-empty">
                Company logo uploads need the Supabase company logo migration before they can be saved.
              </div>
            )}
          </div>
          <div className="admin-row">
            <AdminField label="Role / Position" hint="Shown under the company name in the Experience section.">
              <input value={form.title} onChange={(event) => patch({ title: event.target.value })} />
            </AdminField>
            <AdminField label="Date Range" hint="Shown with the experience entry, for example Nov 2025 - Present.">
              <input value={form.date_range} onChange={(event) => patch({ date_range: event.target.value })} />
            </AdminField>
          </div>

          <div className="admin-field">
            <label>Bullets</label>
            <span className="admin-field-hint">These bullet points appear under the experience entry. Use concrete responsibilities, results, or scope.</span>
            <div className="admin-list">
              {form.bullets.map((bullet, index) => (
                <div className="admin-row" key={index} style={{ gridTemplateColumns: "1fr auto" }}>
                  <input className="admin-inline-input" value={bullet} onChange={(event) => patchBullet(index, event.target.value)} />
                  <button
                    className="admin-btn-delete"
                    type="button"
                    aria-label="Remove bullet"
                    onClick={() => patch({ bullets: form.bullets.filter((_, bulletIndex) => bulletIndex !== index) })}
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
            <button className="admin-btn-add" type="button" onClick={() => patch({ bullets: [...form.bullets, ""] })}>
              Add Bullet
            </button>
          </div>

          <AdminField label="Skill / Context Tags" hint="Shown as chips on the experience entry. Keep each tag short.">
            <AdminTagInput value={form.tags} onChange={(tags) => patch({ tags })} />
          </AdminField>

          <div className="admin-row">
            <AdminField label="Company URL" hint="Optional external link for the company or organization. Leave empty to hide the link.">
              <input value={form.url ?? ""} onChange={(event) => patch({ url: event.target.value })} />
            </AdminField>
            <AdminField label="Display Order" hint="Higher numbers appear earlier in the Experience section.">
              <input type="number" value={form.sort_order} onChange={(event) => patch({ sort_order: Number(event.target.value) })} />
            </AdminField>
          </div>

          <AdminMarkdownEditor
            label="Additional Body"
            hint="Optional supporting prose shown below the bullets in the Experience section. Supports Markdown."
            value={form.body ?? ""}
            onChange={(body) => patch({ body })}
          />

          <div className="admin-form-actions">
            <button className="admin-btn-ghost" type="button" onClick={() => setForm(null)}>
              Cancel
            </button>
            <button className="admin-btn-save" type="button" onClick={() => void save()} disabled={saving}>
              {saving ? "Saving..." : "Save Experience"}
            </button>
          </div>
        </div>
      ) : (
        <div className="admin-list">
          {[...items].sort((a, b) => b.sort_order - a.sort_order).map((item) => (
            <article className="admin-list-item" key={item.id}>
              <img
                className={`admin-list-avatar admin-list-avatar-company ${item.logo_url?.trim() ? "" : "is-placeholder"}`}
                src={item.logo_url?.trim() || "/images/company-placeholder.svg"}
                alt=""
                width="48"
                height="48"
              />
              <div className="admin-list-item-info">
                <div className="admin-list-item-title">{item.company}</div>
                <div className="admin-list-item-meta">
                  {item.title} / {item.date_range}
                </div>
                <div className="admin-badge-row">
                  {item.tags.slice(0, 4).map((tag) => (
                    <span className="admin-pill" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="admin-list-actions">
                <button
                  className="admin-btn-small"
                  type="button"
                  data-admin-action="edit"
                  onClick={() => setForm({ ...item, logo_url: item.logo_url ?? null })}
                >
                  Edit
                </button>
                <button
                  className="admin-btn-delete"
                  type="button"
                  aria-label={`Delete ${item.company}`}
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
        title="Delete experience?"
        message={`Delete ${deleteTarget?.company ?? "this experience"}?`}
        confirmLabel="Delete"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void deleteExperience()}
      />
    </section>
  );
}
