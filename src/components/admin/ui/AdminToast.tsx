export interface ToastState {
  message: string;
  type: "success" | "error";
}

interface AdminToastProps {
  toast: ToastState | null;
}

export default function AdminToast({ toast }: AdminToastProps) {
  if (!toast) return null;
  return <div className={`admin-toast is-${toast.type}`}>{toast.message}</div>;
}
