import { useEffect, useRef, type ReactNode } from "react";
import {
  FileText,
  Check,
  LoaderCircle,
  X,
  FolderOpen,
  FileSpreadsheet,
  FileCode2,
  Image as ImageIcon,
  Music,
  Film,
  Archive,
  File as GenericFile,
} from "lucide-react";
export function Badge({ status }: { status: string }) {
  return (
    <span className={"badge " + status}>
      {status === "indexed" ? (
        <Check size={12} />
      ) : ["pending", "processing", "uploading"].includes(status) ? (
        <LoaderCircle size={12} className="spin" />
      ) : null}
      {status.replaceAll("_", " ")}
    </span>
  );
}
export function FileIcon({ extension }: { extension: string }) {
  const Icon = [".xlsx", ".csv", ".xls"].includes(extension)
    ? FileSpreadsheet
    : [".py", ".js", ".ts", ".tsx", ".css", ".json", ".html", ".sql"].includes(
          extension,
        )
      ? FileCode2
      : [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"].includes(extension)
        ? ImageIcon
        : [".mp3", ".wav", ".ogg"].includes(extension)
          ? Music
          : [".mp4", ".webm", ".mov"].includes(extension)
            ? Film
            : [".zip", ".tar", ".gz"].includes(extension)
              ? Archive
              : [".pdf", ".docx", ".txt", ".md"].includes(extension)
                ? FileText
                : GenericFile;
  return (
    <span className={"file-icon " + extension.slice(1)}>
      <Icon size={22} />
      <small>{extension.slice(1).toUpperCase() || "FILE"}</small>
    </span>
  );
}
export function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="empty-state">
      <FolderOpen size={34} />
      {children}
    </div>
  );
}
export function Highlight({ text, term }: { text: string; term: string }) {
  if (!term.trim()) return <>{text}</>;
  const at = text.toLowerCase().indexOf(term.toLowerCase());
  return at < 0 ? (
    <>{text}</>
  ) : (
    <>
      {text.slice(0, at)}
      <mark>{text.slice(at, at + term.length)}</mark>
      {text.slice(at + term.length)}
    </>
  );
}
export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = dialog.current;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    el?.showModal();
    el?.querySelector<HTMLElement>("[autofocus]")?.focus();
    return () => {
      el?.close();
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      aria-label={title}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === dialog.current) onClose();
      }}
    >
      <div className="modal-head">
        <h2>{title}</h2>
        <button
          className="icon-button"
          aria-label="Close dialog"
          onClick={onClose}
        >
          <X />
        </button>
      </div>
      {children}
    </dialog>
  );
}
