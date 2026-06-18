import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getAdminSessionIssue } from "@/lib/adminAuth";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import AdminLayout from "./AdminLayout";
import AdminLogin from "./AdminLogin";
import type { AdminModule, AdminModuleDefinition } from "./AdminSidebar";
import AdminToast, { type ToastState } from "./ui/AdminToast";
import AdminConfirmModal from "./ui/AdminConfirmModal";
import SiteIdentityModule from "./modules/SiteIdentityModule";
import AboutModule from "./modules/AboutModule";
import SkillsModule from "./modules/SkillsModule";
import ProjectsModule from "./modules/ProjectsModule";
import ExperienceModule from "./modules/ExperienceModule";
import EducationModule from "./modules/EducationModule";
import TestimonialsModule from "./modules/TestimonialsModule";
import BlogModule from "./modules/BlogModule";
import UsesModule from "./modules/UsesModule";
import NowModule from "./modules/NowModule";

const modules: AdminModuleDefinition[] = [
  { id: "identity", label: "Site Identity", kicker: "// 01. Identity" },
  { id: "about", label: "About", kicker: "// 02. About" },
  { id: "skills", label: "Skills", kicker: "// 03. Skills" },
  { id: "projects", label: "Projects", kicker: "// 04. Projects" },
  { id: "experience", label: "Experience", kicker: "// 05. Experience" },
  { id: "education", label: "Education", kicker: "// 06. Education" },
  { id: "testimonials", label: "Testimonials", kicker: "// 07. Testimonials" },
  { id: "blog", label: "Blog Posts", kicker: "// 08. Blog" },
  { id: "uses", label: "Uses Page", kicker: "// 09. Uses" },
  { id: "now", label: "Now Page", kicker: "// 10. Now" },
];

export default function AdminApp() {
  const [session, setSession] = useState<Session | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [authError, setAuthError] = useState("");
  const [currentModule, setCurrentModule] = useState<AdminModule>("identity");
  const [toast, setToast] = useState<ToastState | null>(null);
  const [confirmRebuild, setConfirmRebuild] = useState(false);
  const [rebuilding, setRebuilding] = useState(false);

  const notify = useMemo(
    () => (message: string, type: "success" | "error" = "success") => {
      setToast({ message, type });
      window.setTimeout(() => setToast(null), 3600);
    },
    [],
  );

  useEffect(() => {
    let mounted = true;

    async function applySession(nextSession: Session | null) {
      if (!mounted) return;

      if (!nextSession) {
        setSession(null);
        setCheckingSession(false);
        return;
      }

      const sessionIssue = getAdminSessionIssue(nextSession);
      if (sessionIssue) {
        setSession(null);
        setAuthError(sessionIssue);
        setCheckingSession(false);
        await supabase.auth.signOut();
        return;
      }

      setAuthError("");
      setSession(nextSession);
      setCheckingSession(false);
    }

    if (!isSupabaseConfigured) {
      setCheckingSession(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      void applySession(data.session);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void applySession(nextSession);
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  async function logout() {
    await supabase.auth.signOut();
  }

  async function triggerRebuild() {
    if (!session?.access_token) {
      notify("Sign in again before triggering rebuilds.", "error");
      setConfirmRebuild(false);
      return;
    }

    setRebuilding(true);
    setConfirmRebuild(false);
    try {
      const response = await fetch("/api/rebuild", {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) throw new Error(payload?.error ?? `Netlify returned ${response.status}`);
      notify("Build triggered. Site will be live in 1-2 minutes.");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Failed to trigger build.", "error");
    } finally {
      setRebuilding(false);
    }
  }

  function renderModule() {
    const props = { notify };
    switch (currentModule) {
      case "identity":
        return <SiteIdentityModule {...props} />;
      case "about":
        return <AboutModule {...props} />;
      case "skills":
        return <SkillsModule {...props} />;
      case "projects":
        return <ProjectsModule {...props} />;
      case "experience":
        return <ExperienceModule {...props} />;
      case "education":
        return <EducationModule {...props} />;
      case "testimonials":
        return <TestimonialsModule {...props} />;
      case "blog":
        return <BlogModule {...props} />;
      case "uses":
        return <UsesModule {...props} />;
      case "now":
        return <NowModule {...props} />;
      default:
        return null;
    }
  }

  if (checkingSession) {
    return (
      <main className="admin-login-shell">
        <div className="admin-login-card glass">
          <p className="admin-login-subtitle">// loading.session</p>
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <>
        <AdminLogin authError={authError} />
        <AdminToast toast={toast} />
      </>
    );
  }

  return (
    <>
      <AdminLayout
        modules={modules}
        currentModule={currentModule}
        onSelectModule={setCurrentModule}
        onRebuild={() => setConfirmRebuild(true)}
        rebuilding={rebuilding}
        user={session.user}
        onLogout={logout}
      >
        {renderModule()}
      </AdminLayout>
      <AdminConfirmModal
        open={confirmRebuild}
        title="Trigger rebuild?"
        message="Trigger a new Netlify build to publish changes?"
        confirmLabel="Rebuild"
        onConfirm={() => void triggerRebuild()}
        onCancel={() => setConfirmRebuild(false)}
      />
      <AdminToast toast={toast} />
    </>
  );
}
