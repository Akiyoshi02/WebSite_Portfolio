import type { ReactNode } from "react";

interface AdminFieldProps {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: ReactNode;
}

export default function AdminField({ label, htmlFor, hint, children }: AdminFieldProps) {
  return (
    <div className="admin-field">
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {hint ? <span className="admin-field-hint">{hint}</span> : null}
    </div>
  );
}
