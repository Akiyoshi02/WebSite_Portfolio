import type { User } from "@supabase/supabase-js";
import type { AdminModuleDefinition } from "./AdminSidebar";

interface AdminHeaderProps {
  activeModule: AdminModuleDefinition;
  user: User | null;
  onLogout: () => void;
}

export default function AdminHeader({ activeModule, user, onLogout }: AdminHeaderProps) {
  return (
    <header className="admin-header">
      <div className="admin-header-brand">
        <img src="/logo.png" alt="" width="34" height="34" />
        <span>AKIYOSHI.ADMIN</span>
      </div>
      <div className="admin-header-title">{activeModule.label}</div>
      <div className="admin-header-actions">
        <span className="admin-user">{user?.email}</span>
        <button className="admin-btn-ghost" type="button" data-admin-action="logout" onClick={onLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}
