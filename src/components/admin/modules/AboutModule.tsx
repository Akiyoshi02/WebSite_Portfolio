import { useEffect, useState } from "react";
import { fallbackAboutContent } from "@/lib/fallbackContent";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { AboutContentRow } from "@/types/supabase";
import AdminField from "../ui/AdminField";
import AdminFileUpload from "../ui/AdminFileUpload";
import AdminTagInput from "../ui/AdminTagInput";
import type { ModuleProps } from "./moduleUtils";
import { withUpdatedAt } from "./moduleUtils";

type SupabaseErrorLike = {
  message?: string;
  details?: string;
  hint?: string;
  code?: string;
};

function isMissingProfileImageColumn(error: SupabaseErrorLike | null | undefined) {
  const message = `${error?.message ?? ""} ${error?.details ?? ""} ${error?.hint ?? ""} ${error?.code ?? ""}`.toLowerCase();
  return message.includes("profile_image_url") && (message.includes("schema cache") || message.includes("column") || message.includes("could not find"));
}

export default function AboutModule({ notify }: ModuleProps) {
  const [data, setData] = useState<AboutContentRow>(fallbackAboutContent);
  const [saving, setSaving] = useState(false);
  const [profileImageColumnAvailable, setProfileImageColumnAvailable] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase
      .from("about_content")
      .select("*")
      .eq("id", 1)
      .single()
      .then(({ data: row, error }) => {
        if (error) {
          notify(`Loaded fallback about content: ${error.message}`, "error");
          return;
        }
        if (row) {
          setData({
            ...fallbackAboutContent,
            ...(row as AboutContentRow),
            profile_image_url: (row as AboutContentRow).profile_image_url ?? null,
          });
        }
      });

    supabase
      .from("about_content")
      .select("profile_image_url")
      .limit(1)
      .then(({ error }) => setProfileImageColumnAvailable(!isMissingProfileImageColumn(error)));
  }, [notify]);

  function patch(next: Partial<AboutContentRow>) {
    setData((current) => ({ ...current, ...next }));
  }

  async function save() {
    if (!isSupabaseConfigured) {
      notify("Supabase is not configured yet.", "error");
      return;
    }

    setSaving(true);
    const { id: _id, updated_at: _updatedAt, profile_image_url, ...payloadWithoutProfileImage } = data;
    const payload = profileImageColumnAvailable
      ? { ...payloadWithoutProfileImage, profile_image_url }
      : payloadWithoutProfileImage;
    let savedWithoutProfileImageColumn = false;
    let { error } = await supabase
      .from("about_content")
      .update(withUpdatedAt(payload))
      .eq("id", 1);

    if (isMissingProfileImageColumn(error)) {
      setProfileImageColumnAvailable(false);
      savedWithoutProfileImageColumn = true;
      ({ error } = await supabase
        .from("about_content")
        .update(withUpdatedAt(payloadWithoutProfileImage))
        .eq("id", 1));
    }

    setSaving(false);
    notify(
      error
        ? error.message
        : savedWithoutProfileImageColumn
          ? "About saved. Run the image columns migration before saving the portrait."
          : "About content saved.",
      error || savedWithoutProfileImageColumn ? "error" : "success",
    );
  }

  return (
    <section className="admin-module">
      <header className="admin-module-header">
        <div>
          <p className="admin-module-subtitle">// 02. About</p>
          <h1 className="admin-module-title">About Section</h1>
        </div>
        <button className="admin-btn-save" type="button" onClick={() => void save()} disabled={saving}>
          {saving ? "Saving..." : "Save About"}
        </button>
      </header>

      <div className="admin-card">
        <h2 className="admin-card-title">Bio</h2>
        <p className="admin-card-note">
          These paragraphs appear in the homepage About Me section beside the portrait and code card.
        </p>
        <AdminField label="Opening Bio Paragraph" hint="The first paragraph under the About section heading. Use this for the broad intro.">
          <textarea value={data.bio_paragraph_1} onChange={(event) => patch({ bio_paragraph_1: event.target.value })} />
        </AdminField>
        <AdminField label="Supporting Bio Paragraph" hint="The second About paragraph. Use this for goals, interests, or working style.">
          <textarea value={data.bio_paragraph_2} onChange={(event) => patch({ bio_paragraph_2: event.target.value })} />
        </AdminField>
      </div>

      <div className="admin-card">
        <h2 className="admin-card-title">Portrait</h2>
        <p className="admin-card-note">
          This image appears in the homepage About Me section. Leave it empty to show the placeholder image.
        </p>
        {profileImageColumnAvailable ? (
          <>
            <AdminField label="Profile Image URL" hint="Optional. Paste a public image URL or upload one below.">
              <input value={data.profile_image_url ?? ""} onChange={(event) => patch({ profile_image_url: event.target.value || null })} />
            </AdminField>
            <AdminFileUpload
              folder="about"
              previewUrl={data.profile_image_url}
              recommendedWidth={840}
              recommendedHeight={1050}
              recommendedNote="Matches the rounded 4:5 portrait frame in the About section."
              previewShape="rounded"
              lockRatioByDefault
              onUploaded={(profile_image_url) => patch({ profile_image_url })}
              onRemove={() => patch({ profile_image_url: null })}
            />
            {data.profile_image_url ? (
              <div className="admin-form-actions">
                <button className="admin-btn-ghost" type="button" onClick={() => patch({ profile_image_url: null })}>
                  Remove Image
                </button>
              </div>
            ) : null}
          </>
        ) : (
          <div className="admin-empty">
            Portrait uploads need the Supabase image columns migration before they can be saved.
          </div>
        )}
      </div>

      <div className="admin-card">
        <h2 className="admin-card-title">Skill Chips</h2>
        <p className="admin-card-note">
          These small chips appear below the About bio paragraphs. Keep them short so they wrap cleanly on mobile.
        </p>
        <AdminTagInput value={data.chips} onChange={(chips) => patch({ chips })} />
      </div>

      <div className="admin-card">
        <h2 className="admin-card-title">Stats</h2>
        <p className="admin-card-note">
          These numbers animate in the About section. The site adds the plus sign visually, so enter only the number.
        </p>
        <div className="admin-row">
          <AdminField label="Featured Projects Count" hint="Shown as the Featured Projects stat in the About section.">
            <input
              type="number"
              value={data.stat_featured_projects}
              onChange={(event) => patch({ stat_featured_projects: Number(event.target.value) })}
            />
          </AdminField>
          <AdminField label="Years Coding Count" hint="Shown as the Years Coding stat in the About section.">
            <input
              type="number"
              value={data.stat_years_coding}
              onChange={(event) => patch({ stat_years_coding: Number(event.target.value) })}
            />
          </AdminField>
          <AdminField label="Technologies Count" hint="Shown as the Technologies stat in the About section.">
            <input
              type="number"
              value={data.stat_technologies}
              onChange={(event) => patch({ stat_technologies: Number(event.target.value) })}
            />
          </AdminField>
          <AdminField label="Skill Domains Count" hint="Shown as the Skill Domain stat in the About section.">
            <input
              type="number"
              value={data.stat_skill_domains}
              onChange={(event) => patch({ stat_skill_domains: Number(event.target.value) })}
            />
          </AdminField>
        </div>
      </div>
    </section>
  );
}
