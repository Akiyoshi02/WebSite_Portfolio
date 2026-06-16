import { useEffect, useState } from "react";
import { fallbackSiteConfigRow } from "@/lib/fallbackContent";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { SiteConfigRow } from "@/types/supabase";
import AdminField from "../ui/AdminField";
import AdminTagInput from "../ui/AdminTagInput";
import type { ModuleProps } from "./moduleUtils";
import { withUpdatedAt } from "./moduleUtils";

export default function SiteIdentityModule({ notify }: ModuleProps) {
  const [data, setData] = useState<SiteConfigRow>(fallbackSiteConfigRow);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase
      .from("site_config")
      .select("*")
      .eq("id", 1)
      .single()
      .then(({ data: row, error }) => {
        if (error) {
          notify(`Loaded fallback identity: ${error.message}`, "error");
          return;
        }
        if (row) setData({ ...fallbackSiteConfigRow, ...(row as SiteConfigRow) });
      });
  }, [notify]);

  function patch(next: Partial<SiteConfigRow>) {
    setData((current) => ({ ...current, ...next }));
  }

  async function save() {
    if (!isSupabaseConfigured) {
      notify("Supabase is not configured yet.", "error");
      return;
    }

    setSaving(true);
    const { id: _id, updated_at: _updatedAt, ...payload } = data;
    const { data: updatedRow, error } = await supabase
      .from("site_config")
      .update(withUpdatedAt(payload))
      .eq("id", 1)
      .select("*")
      .single();
    setSaving(false);

    if (error) {
      notify(error.message, "error");
      return;
    }

    setData({ ...fallbackSiteConfigRow, ...(updatedRow as SiteConfigRow) });
    notify("Site identity saved.");
  }

  return (
    <section className="admin-module">
      <header className="admin-module-header">
        <div>
          <p className="admin-module-subtitle">// 01. Identity</p>
          <h1 className="admin-module-title">Site Identity</h1>
        </div>
        <button className="admin-btn-save" type="button" onClick={() => void save()} disabled={saving}>
          {saving ? "Saving..." : "Save Identity"}
        </button>
      </header>

      <div className="admin-card">
        <h2 className="admin-card-title">Personal Info</h2>
        <p className="admin-card-note">
          These values shape the main identity shown in the hero, footer, terminal, and search metadata.
        </p>
        <div className="admin-row">
          <AdminField label="Display Name" hint="Shown as the large name in the homepage hero, page titles, footer, share image, and terminal welcome.">
            <input value={data.name} onChange={(event) => patch({ name: event.target.value })} />
          </AdminField>
          <AdminField label="Full Legal Name" hint="Used mostly for Person structured data in SEO. It is not usually visible on the page.">
            <input value={data.full_name} onChange={(event) => patch({ full_name: event.target.value })} />
          </AdminField>
        </div>
        <div className="admin-row">
          <AdminField label="Terminal Short Name" hint="Used in the portfolio terminal prompt, for example shortname@portfolio:~$.">
            <input value={data.short_name} onChange={(event) => patch({ short_name: event.target.value })} />
          </AdminField>
          <AdminField label="Primary Role" hint="Shown beside the hero typewriter text and used as the job title in structured SEO data.">
            <input value={data.role} onChange={(event) => patch({ role: event.target.value })} />
          </AdminField>
        </div>
        <AdminField label="Hero Copy" hint="Shown as the paragraph under the hero role on the homepage.">
          <textarea value={data.hero_copy} onChange={(event) => patch({ hero_copy: event.target.value })} />
        </AdminField>
      </div>

      <div className="admin-card">
        <h2 className="admin-card-title">SEO & Meta</h2>
        <p className="admin-card-note">
          These values mostly affect browser titles, Google/social previews, canonical URLs, and language metadata.
        </p>
        <AdminField label="Homepage Tagline" hint="Used in the homepage title and the default social share image subtitle.">
          <input value={data.tagline} onChange={(event) => patch({ tagline: event.target.value })} />
        </AdminField>
        <AdminField label="Default SEO Description" hint="Used as the fallback meta and social description when a page does not provide its own.">
          <textarea value={data.description} onChange={(event) => patch({ description: event.target.value })} />
        </AdminField>
        <div className="admin-row">
          <AdminField label="Canonical Site URL" hint="Used to build canonical links and share URLs. This does not change the actual Netlify domain.">
            <input value={data.site_url} onChange={(event) => patch({ site_url: event.target.value })} />
          </AdminField>
          <AdminField label="Site Language / Locale" hint="Sets html lang, OG locale, RSS language, and JSON-LD language. It does not translate page copy.">
            <input value={data.locale} onChange={(event) => patch({ locale: event.target.value })} />
          </AdminField>
        </div>
      </div>

      <div className="admin-card">
        <h2 className="admin-card-title">Contact & Location</h2>
        <p className="admin-card-note">
          These appear in the Contact section, social email link, terminal contact command, and some SEO data.
        </p>
        <div className="admin-row">
          <AdminField label="Public Email" hint="Shown in Contact, mail icons, copy button, terminal output, and SEO email data. It does not change the Netlify contact-form inbox.">
            <input type="email" value={data.email} onChange={(event) => patch({ email: event.target.value })} />
          </AdminField>
          <AdminField label="Public Location" hint="Shown in the Contact section and terminal. The map coordinates are currently separate and do not move automatically.">
            <input value={data.location} onChange={(event) => patch({ location: event.target.value })} />
          </AdminField>
        </div>
        <AdminField label="Timezone Label" hint="Shown beside location and in the contact form response-time text.">
          <input value={data.timezone_label} onChange={(event) => patch({ timezone_label: event.target.value })} />
        </AdminField>
      </div>

      <div className="admin-card">
        <h2 className="admin-card-title">Branding & Status</h2>
        <p className="admin-card-note">
          These control browser-level theme metadata, footer copyright years, and the hero availability indicator.
        </p>
        <div className="admin-row">
          <AdminField label="Browser Theme Color" hint="Updates the theme-color meta tag used by browsers and mobile UI. It does not recolor the whole site theme.">
            <div className="admin-color-field">
              <input type="color" value={data.theme_color} onChange={(event) => patch({ theme_color: event.target.value })} />
              <input value={data.theme_color} onChange={(event) => patch({ theme_color: event.target.value })} />
            </div>
          </AdminField>
          <AdminField label="Portfolio Start Year" hint="Used in the footer copyright range, for example 2024-2026.">
            <input
              type="number"
              value={data.start_year}
              onChange={(event) => patch({ start_year: Number(event.target.value) })}
            />
          </AdminField>
        </div>
        <label className="admin-toggle-row">
          <span>
            <span className="admin-toggle-label">Open to Work</span>
            <span className="admin-toggle-desc">Shows or hides the "Open to Work" pill in the homepage hero.</span>
          </span>
          <input
            type="checkbox"
            checked={data.open_to_work}
            onChange={(event) => patch({ open_to_work: event.target.checked })}
          />
        </label>
      </div>

      <div className="admin-card">
        <h2 className="admin-card-title">Typewriter Roles</h2>
        <p className="admin-card-note admin-card-note-wide">
          These rotate beside the primary role in the homepage hero. The first item is shown before the animation starts.
        </p>
        <AdminTagInput value={data.typewriter_roles} onChange={(typewriter_roles) => patch({ typewriter_roles })} />
      </div>

      <div className="admin-card">
        <h2 className="admin-card-title">Focus Lately</h2>
        <p className="admin-card-note">
          These chips appear in the Contact section under "Focus lately".
        </p>
        <AdminTagInput value={data.focus_lately} onChange={(focus_lately) => patch({ focus_lately })} />
      </div>

      <div className="admin-card">
        <h2 className="admin-card-title">Social Links</h2>
        <p className="admin-card-note">
          Empty links are hidden where the site supports that network. GitHub also controls the username used for the Skills activity preview.
        </p>
        <div className="admin-row">
          {(
            [
              ["GitHub", "social_github", "Hero/footer/contact icon, Skills activity username, terminal links, and SEO sameAs."],
              ["LinkedIn", "social_linkedin", "Hero/footer/contact icon, terminal contact links, and SEO sameAs."],
              ["X", "social_x", "Hero/footer icon, extra Contact social icon, and SEO sameAs."],
              ["Instagram", "social_instagram", "Hero/footer icon, extra Contact social icon, and SEO sameAs."],
              ["Facebook", "social_facebook", "Hero/footer icon, extra Contact social icon, and SEO sameAs."],
              ["Mastodon", "social_mastodon", "Hero/footer icon, extra Contact social icon, and SEO sameAs."],
              ["YouTube", "social_youtube", "Hero/footer icon, extra Contact social icon, and SEO sameAs."],
            ] as const
          ).map(([label, key, hint]) => (
            <AdminField label={label} hint={hint} key={key}>
              <input
                value={data[key] ?? ""}
                onChange={(event) => patch({ [key]: event.target.value || null } as Partial<SiteConfigRow>)}
              />
            </AdminField>
          ))}
        </div>
      </div>
    </section>
  );
}
