import { useMemo } from "react";
import { marked } from "marked";

interface AdminMarkdownEditorProps {
  value: string;
  onChange: (next: string) => void;
  label?: string;
  hint?: string;
}

export default function AdminMarkdownEditor({
  value,
  onChange,
  label = "Body",
  hint = "Write in Markdown/MDX",
}: AdminMarkdownEditorProps) {
  const preview = useMemo(() => marked.parse(value || "", { async: false }) as string, [value]);

  return (
    <div className="admin-field admin-markdown-editor">
      <label>{label}</label>
      {hint ? <span className="admin-field-hint">{hint}</span> : null}
      <div className="admin-markdown-grid">
        <textarea
          className="is-code"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          spellCheck={false}
        />
        <div className="admin-markdown-preview prose" dangerouslySetInnerHTML={{ __html: preview }} />
      </div>
    </div>
  );
}
