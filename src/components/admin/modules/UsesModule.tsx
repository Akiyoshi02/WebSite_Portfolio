import { useEffect, useState } from "react";
import { fallbackUsesGroups } from "@/lib/fallbackContent";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { UsesGroupWithItems, UsesItemRow } from "@/types/supabase";
import AdminConfirmModal from "../ui/AdminConfirmModal";
import AdminField from "../ui/AdminField";
import type { ModuleProps } from "./moduleUtils";
import { sortByOrder, updateSortOrder } from "./moduleUtils";

type ItemDraft = Omit<UsesItemRow, "id"> & { id?: string };

function blankItem(groupId: string): ItemDraft {
  return {
    group_id: groupId,
    name: "",
    description: "",
    sort_order: 50,
  };
}

export default function UsesModule({ notify }: ModuleProps) {
  const [groups, setGroups] = useState<UsesGroupWithItems[]>(fallbackUsesGroups);
  const [newGroupTitle, setNewGroupTitle] = useState("");
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingGroupTitle, setEditingGroupTitle] = useState("");
  const [activeItemGroupId, setActiveItemGroupId] = useState<string | null>(null);
  const [itemDraft, setItemDraft] = useState<ItemDraft | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ table: "uses_groups" | "uses_items"; id: string; label: string } | null>(
    null,
  );

  async function load() {
    if (!isSupabaseConfigured) return;
    const { data, error } = await supabase
      .from("uses_groups")
      .select("*, uses_items(*)")
      .order("sort_order", { ascending: true });
    if (error) {
      notify(error.message, "error");
      return;
    }
    setGroups(
      ((data ?? []) as UsesGroupWithItems[]).map((group) => ({
        ...group,
        uses_items: sortByOrder(group.uses_items ?? []),
      })),
    );
  }

  useEffect(() => {
    void load();
  }, []);

  async function addGroup() {
    if (!newGroupTitle.trim()) return;
    if (!isSupabaseConfigured) {
      notify("Supabase is not configured yet.", "error");
      return;
    }
    const { error } = await supabase.from("uses_groups").insert({
      title: newGroupTitle.trim(),
      sort_order: (groups.length + 1) * 10,
    });
    if (error) {
      notify(error.message, "error");
      return;
    }
    setNewGroupTitle("");
    notify("Uses group added.");
    await load();
  }

  async function saveGroupTitle(id: string) {
    if (!editingGroupTitle.trim()) return;
    const { error } = await supabase
      .from("uses_groups")
      .update({ title: editingGroupTitle.trim() })
      .eq("id", id);
    if (error) {
      notify(error.message, "error");
      return;
    }
    setEditingGroupId(null);
    notify("Uses group updated.");
    await load();
  }

  async function saveItem() {
    if (!itemDraft || !itemDraft.name.trim()) return;
    if (!isSupabaseConfigured) {
      notify("Supabase is not configured yet.", "error");
      return;
    }
    const { id, ...payload } = itemDraft;
    const result = id
      ? await supabase.from("uses_items").update(payload).eq("id", id)
      : await supabase.from("uses_items").insert(payload);
    if (result.error) {
      notify(result.error.message, "error");
      return;
    }
    notify(id ? "Uses item updated." : "Uses item added.");
    setItemDraft(null);
    setActiveItemGroupId(null);
    await load();
  }

  async function deletePending() {
    if (!pendingDelete) return;
    const { error } = await supabase.from(pendingDelete.table).delete().eq("id", pendingDelete.id);
    if (error) {
      notify(error.message, "error");
      return;
    }
    notify("Uses content deleted.");
    setPendingDelete(null);
    await load();
  }

  async function reorderGroup(fromId: string, toId: string) {
    if (fromId === toId) return;
    const current = sortByOrder(groups);
    const fromIndex = current.findIndex((group) => group.id === fromId);
    const toIndex = current.findIndex((group) => group.id === toId);
    if (fromIndex < 0 || toIndex < 0) return;
    const next = [...current];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    setGroups(next.map((group, index) => ({ ...group, sort_order: (index + 1) * 10 })));
    await updateSortOrder("uses_groups", next.map((group) => group.id));
  }

  async function reorderItem(groupId: string, fromId: string, toId: string) {
    if (fromId === toId) return;
    const group = groups.find((item) => item.id === groupId);
    if (!group) return;
    const current = sortByOrder(group.uses_items);
    const fromIndex = current.findIndex((item) => item.id === fromId);
    const toIndex = current.findIndex((item) => item.id === toId);
    if (fromIndex < 0 || toIndex < 0) return;
    const next = [...current];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    setGroups((items) =>
      items.map((currentGroup) =>
        currentGroup.id === groupId
          ? { ...currentGroup, uses_items: next.map((item, index) => ({ ...item, sort_order: (index + 1) * 10 })) }
          : currentGroup,
      ),
    );
    await updateSortOrder("uses_items", next.map((item) => item.id));
  }

  return (
    <section className="admin-module is-wide">
      <header className="admin-module-header">
        <div>
          <p className="admin-module-subtitle">// 09. Uses</p>
          <h1 className="admin-module-title">Uses Page</h1>
        </div>
      </header>

      <div className="admin-card">
        <h2 className="admin-card-title">Groups</h2>
        <p className="admin-card-note">
          Groups become section headings on the Uses page, such as Editor, Terminal, or Hardware. Drag groups to reorder them.
        </p>
        <div className="admin-row" style={{ gridTemplateColumns: "1fr auto" }}>
          <input
            className="admin-inline-input"
            value={newGroupTitle}
            placeholder="New group"
            onChange={(event) => setNewGroupTitle(event.target.value)}
          />
          <button className="admin-btn-add" type="button" onClick={() => void addGroup()}>
            Add Group
          </button>
        </div>
      </div>

      <div className="admin-list">
        {sortByOrder(groups).map((group) => (
          <section
            className="admin-card"
            draggable
            key={group.id}
            onDragStart={(event) => event.dataTransfer.setData("text/plain", group.id)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => void reorderGroup(event.dataTransfer.getData("text/plain"), group.id)}
          >
            <div className="admin-module-header" style={{ marginBottom: 18 }}>
              <div className="admin-list-item-info">
                {editingGroupId === group.id ? (
                  <input
                    className="admin-inline-input"
                    value={editingGroupTitle}
                    onChange={(event) => setEditingGroupTitle(event.target.value)}
                  />
                ) : (
                  <h2 className="admin-card-title" style={{ margin: 0, borderBottom: 0, paddingBottom: 0 }}>
                    <span className="admin-drag-handle">:: </span>
                    {group.title}
                  </h2>
                )}
                <div className="admin-list-item-meta">
                  {group.uses_items.length} items / shown as a section on the Uses page
                </div>
              </div>
              <div className="admin-list-actions">
                {editingGroupId === group.id ? (
                  <button className="admin-btn-small" type="button" onClick={() => void saveGroupTitle(group.id)}>
                    Save
                  </button>
                ) : (
                  <button
                    className="admin-btn-small"
                    type="button"
                    data-admin-action="edit"
                    onClick={() => {
                      setEditingGroupId(group.id);
                      setEditingGroupTitle(group.title);
                    }}
                  >
                    Edit Group
                  </button>
                )}
                <button className="admin-btn-add" type="button" onClick={() => {
                  setActiveItemGroupId(group.id);
                  setItemDraft(blankItem(group.id));
                }}>
                  Add Item
                </button>
                <button
                  className="admin-btn-delete"
                  type="button"
                  aria-label={`Delete ${group.title}`}
                  onClick={() => setPendingDelete({ table: "uses_groups", id: group.id, label: group.title })}
                >
                  x
                </button>
              </div>
            </div>

            {activeItemGroupId === group.id && itemDraft ? (
              <div className="admin-inline-form">
                <p className="admin-card-note">
                  Items appear as rows under this Uses group. Use the name for the tool or setup item and the description for why it matters.
                </p>
                <div className="admin-row">
                  <AdminField label="Item Name" hint="Shown as the bold item name on the Uses page.">
                    <input value={itemDraft.name} onChange={(event) => setItemDraft({ ...itemDraft, name: event.target.value })} />
                  </AdminField>
                  <AdminField label="Display Order" hint="Lower numbers appear earlier within this Uses group. Dragging items also updates this.">
                    <input
                      type="number"
                      value={itemDraft.sort_order}
                      onChange={(event) => setItemDraft({ ...itemDraft, sort_order: Number(event.target.value) })}
                    />
                  </AdminField>
                </div>
                <AdminField label="Item Description" hint="Shown beside the item name. Keep it practical and short.">
                  <textarea
                    value={itemDraft.description}
                    onChange={(event) => setItemDraft({ ...itemDraft, description: event.target.value })}
                  />
                </AdminField>
                <div className="admin-form-actions">
                  <button className="admin-btn-ghost" type="button" onClick={() => setActiveItemGroupId(null)}>
                    Cancel
                  </button>
                  <button className="admin-btn-save" type="button" onClick={() => void saveItem()}>
                    Save Item
                  </button>
                </div>
              </div>
            ) : null}

            <div className="admin-list">
              {sortByOrder(group.uses_items).map((item) => (
                <article
                  className="admin-list-item"
                  draggable
                  key={item.id}
                  onDragStart={(event) => event.dataTransfer.setData("text/plain", item.id)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => void reorderItem(group.id, event.dataTransfer.getData("text/plain"), item.id)}
                >
                  <span className="admin-drag-handle">::</span>
                  <div className="admin-list-item-info">
                    <div className="admin-list-item-title">{item.name}</div>
                    <div className="admin-list-item-meta">{item.description}</div>
                  </div>
                  <div className="admin-list-actions">
                    <button
                      className="admin-btn-small"
                      type="button"
                      data-admin-action="edit"
                      onClick={() => {
                        setActiveItemGroupId(group.id);
                        setItemDraft({ ...item });
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="admin-btn-delete"
                      type="button"
                      aria-label={`Delete ${item.name}`}
                      onClick={() => setPendingDelete({ table: "uses_items", id: item.id, label: item.name })}
                    >
                      x
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>

      <AdminConfirmModal
        open={Boolean(pendingDelete)}
        title="Delete uses content?"
        message={`Delete ${pendingDelete?.label ?? "this entry"}?`}
        confirmLabel="Delete"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => void deletePending()}
      />
    </section>
  );
}
