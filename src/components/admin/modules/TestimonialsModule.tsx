import { useEffect, useState } from "react";
import { fallbackTestimonials } from "@/lib/fallbackContent";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { TestimonialRow } from "@/types/supabase";
import AdminConfirmModal from "../ui/AdminConfirmModal";
import AdminField from "../ui/AdminField";
import AdminFileUpload from "../ui/AdminFileUpload";
import type { ModuleProps } from "./moduleUtils";
import { initialsFromName, sortByOrder, withUpdatedAt } from "./moduleUtils";

type TestimonialForm = Omit<TestimonialRow, "id" | "created_at" | "updated_at"> & {
  id?: string;
};

type SupabaseErrorLike = {
  message?: string;
  details?: string;
  hint?: string;
  code?: string;
};

function blankTestimonial(): TestimonialForm {
  return {
    text: "",
    name: "",
    title: "",
    company: "",
    initials: "",
    avatar_url: null,
    sort_order: 50,
  };
}

function isMissingAvatarColumn(error: SupabaseErrorLike | null | undefined) {
  const message = `${error?.message ?? ""} ${error?.details ?? ""} ${error?.hint ?? ""} ${error?.code ?? ""}`.toLowerCase();
  return message.includes("avatar_url") && (message.includes("schema cache") || message.includes("column") || message.includes("could not find"));
}

function normalizedInitials(name: string, initials: string) {
  return (initials || initialsFromName(name) || "NA").slice(0, 2).toUpperCase();
}

export default function TestimonialsModule({ notify }: ModuleProps) {
  const [items, setItems] = useState<TestimonialRow[]>(fallbackTestimonials);
  const [form, setForm] = useState<TestimonialForm | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TestimonialRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [avatarColumnAvailable, setAvatarColumnAvailable] = useState(true);

  async function load() {
    if (!isSupabaseConfigured) return;
    const { data, error } = await supabase.from("testimonials").select("*").order("sort_order", { ascending: true });
    if (error) {
      notify(error.message, "error");
      return;
    }
    setItems(((data ?? []) as TestimonialRow[]).map((item) => ({ ...item, avatar_url: item.avatar_url ?? null })));
  }

  async function checkAvatarColumn() {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.from("testimonials").select("avatar_url").limit(1);
    setAvatarColumnAvailable(!isMissingAvatarColumn(error));
  }

  useEffect(() => {
    void load();
    void checkAvatarColumn();
  }, []);

  function patch(next: Partial<TestimonialForm>) {
    setForm((current) => (current ? { ...current, ...next } : current));
  }

  function handleName(value: string) {
    setForm((current) => {
      if (!current) return current;
      return {
        ...current,
        name: value,
        initials: current.initials ? current.initials : initialsFromName(value),
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
    const { avatar_url: _avatarUrl, ...payloadWithoutAvatar } = rawPayload;
    const payloadBase = avatarColumnAvailable ? rawPayload : payloadWithoutAvatar;
    const initials = normalizedInitials(rawPayload.name, rawPayload.initials);
    const payload = withUpdatedAt({
      ...payloadBase,
      initials,
    });
    let savedWithoutAvatarColumn = false;
    let result = id
      ? await supabase.from("testimonials").update(payload).eq("id", id)
      : await supabase.from("testimonials").insert(payload);

    if (isMissingAvatarColumn(result.error)) {
      setAvatarColumnAvailable(false);
      savedWithoutAvatarColumn = true;
      const retryPayload = withUpdatedAt({
        ...payloadWithoutAvatar,
        initials,
      });
      result = id
        ? await supabase.from("testimonials").update(retryPayload).eq("id", id)
        : await supabase.from("testimonials").insert(retryPayload);
    }
    setSaving(false);

    if (result.error) {
      notify(result.error.message, "error");
      return;
    }

    notify(
      !savedWithoutAvatarColumn
        ? id ? "Testimonial updated." : "Testimonial added."
        : "Testimonial saved. Run the image columns migration before saving profile photos.",
      savedWithoutAvatarColumn ? "error" : "success",
    );
    setForm(null);
    await load();
    await checkAvatarColumn();
  }

  async function deleteTestimonial() {
    if (!deleteTarget) return;
    const { error } = await supabase.from("testimonials").delete().eq("id", deleteTarget.id);
    if (error) {
      notify(error.message, "error");
      return;
    }
    notify("Testimonial deleted.");
    setDeleteTarget(null);
    await load();
  }

  return (
    <section className="admin-module">
      <header className="admin-module-header">
        <div>
          <p className="admin-module-subtitle">// 07. Testimonials</p>
          <h1 className="admin-module-title">Testimonials</h1>
        </div>
        <button className="admin-btn-add" type="button" onClick={() => setForm(blankTestimonial())}>
          Add Testimonial
        </button>
      </header>

      {form ? (
        <div className="admin-card">
          <h2 className="admin-card-title">{form.id ? `Edit ${form.name}` : "New Testimonial"}</h2>
          <p className="admin-card-note">
            Testimonials appear in the homepage Recommendations carousel. Keep quotes concise so cards stay balanced.
          </p>
          <AdminField label="Recommendation Quote" hint="Main testimonial text shown in the carousel card.">
            <textarea value={form.text} onChange={(event) => patch({ text: event.target.value })} />
          </AdminField>
          <AdminField label="Person Name" hint="Shown as the testimonial author name.">
            <input value={form.name} onChange={(event) => handleName(event.target.value)} />
          </AdminField>
          {avatarColumnAvailable ? (
            <>
              <AdminField label="Profile Photo URL" hint="Optional. Leave empty to show the profile placeholder.">
                <input value={form.avatar_url ?? ""} onChange={(event) => patch({ avatar_url: event.target.value || null })} />
              </AdminField>
              <div className="admin-card" style={{ boxShadow: "none" }}>
                <h3 className="admin-card-title">Profile Photo</h3>
                <p className="admin-card-note">
                  Upload a square or portrait photo. The public card crops it into a circular avatar, or uses the profile placeholder when empty.
                </p>
                <AdminFileUpload
                  folder="testimonials"
                  previewUrl={form.avatar_url}
                  recommendedWidth={400}
                  recommendedHeight={400}
                  recommendedNote="Matches the circular testimonial avatar shown on the portfolio."
                  previewShape="circle"
                  lockRatioByDefault
                  onUploaded={(avatar_url) => patch({ avatar_url })}
                  onRemove={() => patch({ avatar_url: null })}
                />
                {form.avatar_url ? (
                  <div className="admin-form-actions">
                    <button className="admin-btn-ghost" type="button" onClick={() => patch({ avatar_url: null })}>
                      Remove Photo
                    </button>
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <div className="admin-empty">
              Profile photos need the Supabase image columns migration before they can be saved.
            </div>
          )}
          <div className="admin-row">
            <AdminField label="Person Title" hint="Shown below the author name, for example Operations Manager.">
              <input value={form.title} onChange={(event) => patch({ title: event.target.value })} />
            </AdminField>
            <AdminField label="Company / Organization" hint="Shown beside the title to identify where the recommendation came from.">
              <input value={form.company} onChange={(event) => patch({ company: event.target.value })} />
            </AdminField>
          </div>
          <AdminField label="Display Order" hint="Lower numbers appear earlier in the Recommendations carousel.">
            <input type="number" value={form.sort_order} onChange={(event) => patch({ sort_order: Number(event.target.value) })} />
          </AdminField>
          <div className="admin-form-actions">
            <button className="admin-btn-ghost" type="button" onClick={() => setForm(null)}>
              Cancel
            </button>
            <button className="admin-btn-save" type="button" onClick={() => void save()} disabled={saving}>
              {saving ? "Saving..." : "Save Testimonial"}
            </button>
          </div>
        </div>
      ) : (
        <div className="admin-list">
          {sortByOrder(items).map((item) => (
            <article className="admin-list-item" key={item.id}>
              <img
                className={`admin-list-avatar ${item.avatar_url?.trim() ? "" : "is-placeholder"}`}
                src={item.avatar_url?.trim() || "/images/profile-placeholder.svg"}
                alt=""
                width="40"
                height="40"
              />
              <div className="admin-list-item-info">
                <div className="admin-list-item-title">{item.name}</div>
                <div className="admin-list-item-meta">
                  {item.title} / {item.company} / {item.text.slice(0, 96)}
                </div>
              </div>
              <div className="admin-list-actions">
                <button
                  className="admin-btn-small"
                  type="button"
                  data-admin-action="edit"
                  onClick={() => setForm({ ...item, avatar_url: item.avatar_url ?? null })}
                >
                  Edit
                </button>
                <button
                  className="admin-btn-delete"
                  type="button"
                  aria-label={`Delete ${item.name}`}
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
        title="Delete testimonial?"
        message={`Delete testimonial from ${deleteTarget?.name ?? "this person"}?`}
        confirmLabel="Delete"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void deleteTestimonial()}
      />
    </section>
  );
}
