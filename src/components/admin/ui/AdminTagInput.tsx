import { useState } from "react";

interface AdminTagInputProps {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}

export default function AdminTagInput({
  value,
  onChange,
  placeholder = "Add item and press Enter",
}: AdminTagInputProps) {
  const [draft, setDraft] = useState("");

  function addTag(input: string) {
    const parts = input
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
    if (parts.length === 0) return;
    onChange([...value, ...parts.filter((part) => !value.includes(part))]);
    setDraft("");
  }

  return (
    <div className="admin-tag-wrap">
      {value.map((tag) => (
        <span className="admin-tag-pill" key={tag}>
          {tag}
          <button
            className="admin-tag-remove"
            type="button"
            aria-label={`Remove ${tag}`}
            onClick={() => onChange(value.filter((item) => item !== tag))}
          >
            x
          </button>
        </span>
      ))}
      <input
        className="admin-tag-input"
        value={draft}
        placeholder={placeholder}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => addTag(draft)}
        onPaste={(event) => {
          const pasted = event.clipboardData.getData("text");
          if (pasted.includes(",")) {
            event.preventDefault();
            addTag(pasted);
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === ",") {
            event.preventDefault();
            addTag(draft);
          }
          if (event.key === "Backspace" && !draft && value.length > 0) {
            onChange(value.slice(0, -1));
          }
        }}
      />
    </div>
  );
}
