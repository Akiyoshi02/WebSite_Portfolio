export type AdminModule =
  | "identity"
  | "about"
  | "skills"
  | "projects"
  | "experience"
  | "education"
  | "testimonials"
  | "blog"
  | "uses"
  | "now";

export interface AdminModuleDefinition {
  id: AdminModule;
  label: string;
  kicker: string;
}

interface AdminSidebarProps {
  modules: AdminModuleDefinition[];
  currentModule: AdminModule;
  onSelect: (module: AdminModule) => void;
  onRebuild: () => void;
  rebuilding: boolean;
}

export default function AdminSidebar({
  modules,
  currentModule,
  onSelect,
  onRebuild,
  rebuilding,
}: AdminSidebarProps) {
  return (
    <aside className="admin-sidebar" aria-label="Admin modules">
      {modules.map((module, index) => (
        <button
          className={`admin-nav-item ${currentModule === module.id ? "is-active" : ""}`}
          key={module.id}
          type="button"
          onClick={() => onSelect(module.id)}
        >
          <span className="admin-nav-index">{String(index + 1).padStart(2, "0")}</span>
          <span>{module.label}</span>
        </button>
      ))}
      <div className="admin-nav-divider" />
      <div className="admin-sidebar-footer">
        <button className="admin-btn-save" type="button" data-admin-action="rebuild" onClick={onRebuild} disabled={rebuilding}>
          {rebuilding ? "Triggering..." : "Rebuild Site"}
        </button>
      </div>
    </aside>
  );
}
