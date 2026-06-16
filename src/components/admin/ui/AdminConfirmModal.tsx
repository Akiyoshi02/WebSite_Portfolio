interface AdminConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function AdminConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  onConfirm,
  onCancel,
}: AdminConfirmModalProps) {
  if (!open) return null;
  const confirmAction = confirmLabel.toLowerCase().includes("delete")
    ? "delete"
    : confirmLabel.toLowerCase().includes("rebuild")
      ? "rebuild"
      : "confirm";

  return (
    <div className="admin-modal-overlay" role="presentation" onMouseDown={onCancel}>
      <div
        className="admin-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-confirm-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h2 className="admin-modal-title" id="admin-confirm-title">
          {title}
        </h2>
        <p>{message}</p>
        <div className="admin-modal-actions">
          <button className="admin-btn-ghost" type="button" data-admin-action="cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="admin-btn-save" type="button" data-admin-action={confirmAction} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
