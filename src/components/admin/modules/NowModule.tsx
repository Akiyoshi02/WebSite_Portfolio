import { useEffect, useState } from "react";
import { fallbackNowPage } from "@/lib/fallbackContent";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { NowPageRow } from "@/types/supabase";
import AdminField from "../ui/AdminField";
import type { ModuleProps } from "./moduleUtils";
import { withUpdatedAt } from "./moduleUtils";

export default function NowModule({ notify }: ModuleProps) {
  const [data, setData] = useState<NowPageRow>(fallbackNowPage);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase
      .from("now_page")
      .select("*")
      .eq("id", 1)
      .single()
      .then(({ data: row, error }) => {
        if (error) {
          notify(`Loaded fallback now page: ${error.message}`, "error");
          return;
        }
        if (row) setData(row as NowPageRow);
      });
  }, [notify]);

  function patch(next: Partial<NowPageRow>) {
    setData((current) => ({ ...current, ...next }));
  }

  async function save() {
    if (!isSupabaseConfigured) {
      notify("Supabase is not configured yet.", "error");
      return;
    }

    setSaving(true);
    const { id: _id, updated_at: _updatedAt, ...payload } = data;
    const { error } = await supabase.from("now_page").update(withUpdatedAt(payload)).eq("id", 1);
    setSaving(false);
    notify(error ? error.message : "Now page saved.", error ? "error" : "success");
  }

  return (
    <section className="admin-module">
      <header className="admin-module-header">
        <div>
          <p className="admin-module-subtitle">// 10. Now</p>
          <h1 className="admin-module-title">Now Page</h1>
        </div>
        <button className="admin-btn-save" type="button" onClick={() => void save()} disabled={saving}>
          {saving ? "Saving..." : "Save Now Page"}
        </button>
      </header>

      <div className="admin-card">
        <h2 className="admin-card-title">Now Page Content</h2>
        <p className="admin-card-note">
          These values appear on the public /now page as a short snapshot of current focus.
        </p>
        <AdminField label="Current Location" hint="Shown after the Location label on the /now page.">
          <input value={data.location} onChange={(event) => patch({ location: event.target.value })} />
        </AdminField>
        <AdminField label="Working On" hint="Shown after the Working on label. Use this for current job, projects, or active priorities.">
          <textarea value={data.working_on} onChange={(event) => patch({ working_on: event.target.value })} />
        </AdminField>
        <AdminField label="Studying" hint="Shown after the Studying label. Use this for courses, degree work, or formal learning.">
          <textarea value={data.studying} onChange={(event) => patch({ studying: event.target.value })} />
        </AdminField>
        <AdminField label="Learning" hint="Shown after the Learning label. Use this for skills, topics, or technologies being explored.">
          <textarea value={data.learning} onChange={(event) => patch({ learning: event.target.value })} />
        </AdminField>
        <AdminField label="Open To" hint="Shown after the Open to label. Use this for roles, collaborations, freelance, or opportunities.">
          <textarea value={data.open_to} onChange={(event) => patch({ open_to: event.target.value })} />
        </AdminField>
        <AdminField label="Public Last Updated Date" hint="Shown at the bottom of the /now page as Last updated.">
          <input type="date" value={data.last_updated} onChange={(event) => patch({ last_updated: event.target.value })} />
        </AdminField>
      </div>
    </section>
  );
}
