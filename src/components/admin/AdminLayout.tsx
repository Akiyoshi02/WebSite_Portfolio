import type { ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import AdminHeader from "./AdminHeader";
import AdminSidebar, { type AdminModule, type AdminModuleDefinition } from "./AdminSidebar";

interface AdminLayoutProps {
  modules: AdminModuleDefinition[];
  currentModule: AdminModule;
  onSelectModule: (module: AdminModule) => void;
  onRebuild: () => void;
  rebuilding: boolean;
  user: User | null;
  onLogout: () => void;
  children: ReactNode;
}

export default function AdminLayout({
  modules,
  currentModule,
  onSelectModule,
  onRebuild,
  rebuilding,
  user,
  onLogout,
  children,
}: AdminLayoutProps) {
  const activeModule = modules.find((module) => module.id === currentModule) ?? modules[0];

  return (
    <div className="admin-wrap">
      <AdminHeader activeModule={activeModule} user={user} onLogout={onLogout} />
      <AdminSidebar
        modules={modules}
        currentModule={currentModule}
        onSelect={onSelectModule}
        onRebuild={onRebuild}
        rebuilding={rebuilding}
      />
      <main className="admin-main">{children}</main>
    </div>
  );
}
