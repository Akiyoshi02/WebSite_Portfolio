import { useEffect, useMemo, useState } from "react";
import { fallbackSkillCategories } from "@/lib/fallbackContent";
import { getSkillIconSrc } from "@/lib/iconSources";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { SkillCategoryWithItems, SkillItemRow } from "@/types/supabase";
import AdminConfirmModal from "../ui/AdminConfirmModal";
import AdminField from "../ui/AdminField";
import type { ModuleProps } from "./moduleUtils";
import { sortByOrder, updateSortOrder } from "./moduleUtils";

const blankItem = (categoryId: string): Omit<SkillItemRow, "id" | "created_at"> => ({
  category_id: categoryId,
  name: "",
  icon_slug: "",
  brand_hex: "#00f5d4",
  fallback: null,
  sort_order: 50,
});

export default function SkillsModule({ notify }: ModuleProps) {
  const [categories, setCategories] = useState<SkillCategoryWithItems[]>(fallbackSkillCategories);
  const [selectedCategoryId, setSelectedCategoryId] = useState(fallbackSkillCategories[0]?.id ?? "");
  const [newCategoryTitle, setNewCategoryTitle] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryTitle, setEditingCategoryTitle] = useState("");
  const [itemDraft, setItemDraft] = useState<Omit<SkillItemRow, "id" | "created_at">>(
    blankItem(fallbackSkillCategories[0]?.id ?? ""),
  );
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ type: "category" | "item"; id: string; label: string } | null>(
    null,
  );

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === selectedCategoryId) ?? categories[0],
    [categories, selectedCategoryId],
  );
  const sortedCategories = sortByOrder(categories);
  const sortedItems = sortByOrder(selectedCategory?.skill_items ?? []);

  async function load() {
    if (!isSupabaseConfigured) return;
    const { data, error } = await supabase
      .from("skill_categories")
      .select("*, skill_items(*)")
      .order("sort_order", { ascending: true });

    if (error) {
      notify(error.message, "error");
      return;
    }

    const next = ((data ?? []) as SkillCategoryWithItems[]).map((category) => ({
      ...category,
      skill_items: sortByOrder(category.skill_items ?? []),
    }));
    setCategories(next);
    setSelectedCategoryId((current) => current || next[0]?.id || "");
    setItemDraft(blankItem(next[0]?.id ?? ""));
  }

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    if (!selectedCategory) return;
    setItemDraft((current) => ({ ...current, category_id: selectedCategory.id }));
  }, [selectedCategory?.id]);

  async function addCategory() {
    if (!newCategoryTitle.trim()) return;
    if (!isSupabaseConfigured) {
      notify("Supabase is not configured yet.", "error");
      return;
    }

    const { error } = await supabase.from("skill_categories").insert({
      title: newCategoryTitle.trim(),
      sort_order: (categories.length + 1) * 10,
    });
    if (error) {
      notify(error.message, "error");
      return;
    }
    setNewCategoryTitle("");
    notify("Skill category added.");
    await load();
  }

  async function saveCategoryTitle(id: string) {
    if (!editingCategoryTitle.trim()) return;
    const { error } = await supabase
      .from("skill_categories")
      .update({ title: editingCategoryTitle.trim() })
      .eq("id", id);
    if (error) {
      notify(error.message, "error");
      return;
    }
    setEditingCategoryId(null);
    notify("Skill category updated.");
    await load();
  }

  function startEditCategory(category: SkillCategoryWithItems) {
    setEditingCategoryId(category.id);
    setEditingCategoryTitle(category.title);
  }

  function startEditItem(item: SkillItemRow) {
    setEditingItemId(item.id);
    setItemDraft({
      category_id: item.category_id,
      name: item.name,
      icon_slug: item.icon_slug,
      brand_hex: item.brand_hex,
      fallback: item.fallback,
      sort_order: item.sort_order,
    });
  }

  function resetItemDraft() {
    setEditingItemId(null);
    setItemDraft(blankItem(selectedCategory?.id ?? ""));
  }

  async function saveItem() {
    if (!selectedCategory || !itemDraft.name.trim()) return;
    if (!isSupabaseConfigured) {
      notify("Supabase is not configured yet.", "error");
      return;
    }

    const payload = {
      ...itemDraft,
      category_id: selectedCategory.id,
      name: itemDraft.name.trim(),
      icon_slug: itemDraft.icon_slug.trim(),
      fallback: itemDraft.fallback?.trim() || null,
      sort_order: itemDraft.sort_order || (sortedItems.length + 1) * 10,
    };

    const result = editingItemId
      ? await supabase.from("skill_items").update(payload).eq("id", editingItemId)
      : await supabase.from("skill_items").insert(payload);

    if (result.error) {
      notify(result.error.message, "error");
      return;
    }

    notify(editingItemId ? "Skill item updated." : "Skill item added.");
    resetItemDraft();
    await load();
  }

  async function deletePending() {
    if (!pendingDelete) return;
    const table = pendingDelete.type === "category" ? "skill_categories" : "skill_items";
    const { error } = await supabase.from(table).delete().eq("id", pendingDelete.id);
    if (error) {
      notify(error.message, "error");
      return;
    }
    notify(pendingDelete.type === "category" ? "Category deleted." : "Skill item deleted.");
    setPendingDelete(null);
    await load();
  }

  async function reorderCategory(fromId: string, toId: string) {
    if (fromId === toId) return;
    const current = sortedCategories;
    const fromIndex = current.findIndex((item) => item.id === fromId);
    const toIndex = current.findIndex((item) => item.id === toId);
    if (fromIndex < 0 || toIndex < 0) return;
    const next = [...current];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    setCategories(next.map((item, index) => ({ ...item, sort_order: (index + 1) * 10 })));
    await updateSortOrder("skill_categories", next.map((item) => item.id));
  }

  async function reorderItem(fromId: string, toId: string) {
    if (!selectedCategory || fromId === toId) return;
    const current = sortedItems;
    const fromIndex = current.findIndex((item) => item.id === fromId);
    const toIndex = current.findIndex((item) => item.id === toId);
    if (fromIndex < 0 || toIndex < 0) return;
    const next = [...current];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    setCategories((items) =>
      items.map((category) =>
        category.id === selectedCategory.id
          ? { ...category, skill_items: next.map((item, index) => ({ ...item, sort_order: (index + 1) * 10 })) }
          : category,
      ),
    );
    await updateSortOrder("skill_items", next.map((item) => item.id));
  }

  return (
    <section className="admin-module is-wide">
      <header className="admin-module-header">
        <div>
          <p className="admin-module-subtitle">// 03. Skills</p>
          <h1 className="admin-module-title">Skills</h1>
        </div>
      </header>

      <div className="admin-grid-2">
        <div className="admin-card">
          <h2 className="admin-card-title">Categories</h2>
          <p className="admin-card-note">
            Categories become grouped sections in the homepage Skills area. Drag categories to change their order.
          </p>
          <div className="admin-row" style={{ gridTemplateColumns: "1fr auto" }}>
            <input
              className="admin-inline-input"
              value={newCategoryTitle}
              placeholder="New category"
              onChange={(event) => setNewCategoryTitle(event.target.value)}
            />
            <button className="admin-btn-add" type="button" onClick={() => void addCategory()}>
              Add
            </button>
          </div>

          <div className="admin-list" style={{ marginTop: 16 }}>
            {sortedCategories.map((category) => (
              <div
                className={`admin-list-item ${category.id === selectedCategory?.id ? "is-active" : ""}`}
                draggable
                key={category.id}
                onDragStart={(event) => event.dataTransfer.setData("text/plain", category.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => void reorderCategory(event.dataTransfer.getData("text/plain"), category.id)}
              >
                <span className="admin-drag-handle">::</span>
                <div className="admin-list-item-info">
                  {editingCategoryId === category.id ? (
                    <input
                      className="admin-inline-input"
                      value={editingCategoryTitle}
                      onChange={(event) => setEditingCategoryTitle(event.target.value)}
                    />
                  ) : (
                    <button
                      className="admin-nav-item"
                      type="button"
                      onClick={() => setSelectedCategoryId(category.id)}
                      style={{ padding: 0, minHeight: 0 }}
                    >
                      <span className="admin-list-item-title">{category.title}</span>
                    </button>
                  )}
                  <div className="admin-list-item-meta">{category.skill_items?.length ?? 0} items</div>
                </div>
                <div className="admin-list-actions">
                  {editingCategoryId === category.id ? (
                    <button className="admin-btn-small" type="button" onClick={() => void saveCategoryTitle(category.id)}>
                      Save
                    </button>
                  ) : (
                    <button className="admin-btn-small" type="button" data-admin-action="edit" onClick={() => startEditCategory(category)}>
                      Edit
                    </button>
                  )}
                  <button
                    className="admin-btn-delete"
                    type="button"
                    aria-label={`Delete ${category.title}`}
                    onClick={() =>
                      setPendingDelete({
                        type: "category",
                        id: category.id,
                        label: category.title,
                      })
                    }
                  >
                    x
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card">
          <h2 className="admin-card-title">{selectedCategory?.title ?? "Items"}</h2>
          <p className="admin-card-note">
            Items appear as skill cards inside the selected category. Drag items to reorder them within this group.
          </p>
          {selectedCategory ? (
            <>
              <div className="admin-inline-form">
                <div className="admin-row">
                  <AdminField label="Skill Name" hint="Visible label on the skill card, for example React or Supabase.">
                    <input
                      value={itemDraft.name}
                      onChange={(event) => setItemDraft((current) => ({ ...current, name: event.target.value }))}
                    />
                  </AdminField>
                  <AdminField label="Icon Slug or URL" hint="Examples: react, devicon:css3, simple-icons:sendgrid, or an SVG URL.">
                    <input
                      value={itemDraft.icon_slug}
                      onChange={(event) => setItemDraft((current) => ({ ...current, icon_slug: event.target.value }))}
                    />
                  </AdminField>
                </div>
                <div className="admin-row-3">
                  <AdminField label="Icon Brand Color" hint="Used to tint Simple Icons and as the card accent color.">
                    <div className="admin-color-field">
                      <input
                        type="color"
                        value={itemDraft.brand_hex}
                        onChange={(event) => setItemDraft((current) => ({ ...current, brand_hex: event.target.value }))}
                      />
                      <input
                        value={itemDraft.brand_hex}
                        onChange={(event) => setItemDraft((current) => ({ ...current, brand_hex: event.target.value }))}
                      />
                    </div>
                  </AdminField>
                  <AdminField label="Fallback Text" hint="Shown only when no icon can be loaded. Keep it to 2-4 characters.">
                    <input
                      maxLength={4}
                      value={itemDraft.fallback ?? ""}
                      onChange={(event) => setItemDraft((current) => ({ ...current, fallback: event.target.value }))}
                    />
                  </AdminField>
                  <AdminField label="Sort Order" hint="Lower numbers appear earlier. Dragging items also updates this.">
                    <input
                      type="number"
                      value={itemDraft.sort_order}
                      onChange={(event) => setItemDraft((current) => ({ ...current, sort_order: Number(event.target.value) }))}
                    />
                  </AdminField>
                </div>
                <div className="admin-form-actions">
                  {editingItemId ? (
                    <button className="admin-btn-ghost" type="button" onClick={resetItemDraft}>
                      Cancel
                    </button>
                  ) : null}
                  <button className="admin-btn-save" type="button" onClick={() => void saveItem()}>
                    {editingItemId ? "Save Item" : "Add Item"}
                  </button>
                </div>
              </div>

              <div className="admin-list">
                {sortedItems.map((item) => {
                  const iconSrc = getSkillIconSrc(item.icon_slug, item.brand_hex);
                  return (
                    <div
                      className="admin-list-item"
                      draggable
                      key={item.id}
                      onDragStart={(event) => event.dataTransfer.setData("text/plain", item.id)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => void reorderItem(event.dataTransfer.getData("text/plain"), item.id)}
                    >
                      <span className="admin-drag-handle">::</span>
                      {iconSrc ? (
                        <img src={iconSrc} alt="" width="28" height="28" referrerPolicy="no-referrer" />
                      ) : (
                        <span className="admin-pill">{item.fallback || item.name.slice(0, 2)}</span>
                      )}
                      <div className="admin-list-item-info">
                        <div className="admin-list-item-title">{item.name}</div>
                        <div className="admin-list-item-meta">{item.icon_slug || "Fallback only"}</div>
                      </div>
                      <span className="admin-color-swatch" style={{ background: item.brand_hex }} />
                      <div className="admin-list-actions">
                        <button className="admin-btn-small" type="button" data-admin-action="edit" onClick={() => startEditItem(item)}>
                          Edit
                        </button>
                        <button
                          className="admin-btn-delete"
                          type="button"
                          aria-label={`Delete ${item.name}`}
                          onClick={() => setPendingDelete({ type: "item", id: item.id, label: item.name })}
                        >
                          x
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="admin-empty">Add a category to start managing skill items.</div>
          )}
        </div>
      </div>

      <AdminConfirmModal
        open={Boolean(pendingDelete)}
        title={pendingDelete?.type === "category" ? "Delete category?" : "Delete item?"}
        message={
          pendingDelete?.type === "category"
            ? `Delete ${pendingDelete.label}? This also deletes every item in it.`
            : `Delete ${pendingDelete?.label}?`
        }
        confirmLabel="Delete"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => void deletePending()}
      />
    </section>
  );
}
