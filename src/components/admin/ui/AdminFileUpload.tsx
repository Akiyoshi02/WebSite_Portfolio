import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Cropper, { type Area } from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

type ImagePreviewShape = "rect" | "rounded" | "circle";
type ImagePreviewFit = "cover" | "contain";

interface UploadMetadata {
  width: number;
  height: number;
  shape: ImagePreviewShape;
}

interface AdminFileUploadProps {
  label?: string;
  storagePath?: string;
  currentUrl?: string | null;
  onUpload?: (publicUrl: string, metadata?: UploadMetadata) => void;
  onRemove?: () => void;
  recommendedWidth?: number;
  recommendedHeight?: number;
  recommendedNote?: string;
  previewShape?: ImagePreviewShape;
  previewFit?: ImagePreviewFit;
  lockRatioByDefault?: boolean;
  accept?: string;
  folder?: string;
  previewUrl?: string | null;
  onUploaded?: (publicUrl: string, metadata?: UploadMetadata) => void;
}

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const MAX_OUTPUT_DIMENSION = 8000;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/avif",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function fallbackRecommendation(path: string) {
  const key = path.toLowerCase();

  if (key.includes("about")) {
    return {
      width: 840,
      height: 1050,
      note: "Matches the rounded 4:5 About portrait frame.",
      shape: "rounded" as const,
    };
  }

  if (key.includes("testimonial")) {
    return {
      width: 400,
      height: 400,
      note: "Matches the circular testimonial avatar.",
      shape: "circle" as const,
    };
  }

  if (key.includes("experience")) {
    return {
      width: 512,
      height: 512,
      note: "Matches the circular company logo frame.",
      shape: "circle" as const,
    };
  }

  if (key.includes("project")) {
    return {
      width: 1520,
      height: 840,
      note: "Matches the project card media and project detail cover.",
      shape: "rect" as const,
    };
  }

  if (key.includes("blog")) {
    return {
      width: 1200,
      height: 675,
      note: "Matches the 16:9 Writing card and post cover.",
      shape: "rect" as const,
    };
  }

  if (key.includes("logo")) {
    return {
      width: 520,
      height: 208,
      note: "Matches the wide education logo placement.",
      shape: "rect" as const,
    };
  }

  return {
    width: 400,
    height: 400,
    note: "Displayed as an image on the portfolio.",
    shape: "rect" as const,
  };
}

function normaliseStoragePath(path: string) {
  return `${path.replace(/^\/+/, "").replace(/\/+$/, "")}/`;
}

function clampDimension(value: number) {
  if (!Number.isFinite(value)) return 1;
  return Math.min(MAX_OUTPUT_DIMENSION, Math.max(1, Math.round(value)));
}

function percent(value: number, min: number, max: number) {
  return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
}

function rangeStyle(value: number, min: number, max: number): CSSProperties {
  return { "--range-pct": `${percent(value, min, max)}%` } as CSSProperties;
}

function shapeLabel(shape: ImagePreviewShape) {
  if (shape === "circle") return "Circle preview";
  if (shape === "rounded") return "Rounded preview";
  return "Rectangle preview";
}

function createImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", () => reject(new Error("Could not load the selected image.")));
    image.crossOrigin = "anonymous";
    image.src = src;
  });
}

function rotatedSize(width: number, height: number, rotation: number) {
  const radians = (rotation * Math.PI) / 180;
  return {
    width: Math.abs(Math.cos(radians) * width) + Math.abs(Math.sin(radians) * height),
    height: Math.abs(Math.sin(radians) * width) + Math.abs(Math.cos(radians) * height),
  };
}

async function getCroppedImage(
  imageSrc: string,
  pixelCrop: Area,
  rotation: number,
  flipH: boolean,
  flipV: boolean,
  outputWidth: number,
  outputHeight: number,
) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Could not prepare the image canvas.");
  }

  const box = rotatedSize(image.width, image.height, rotation);
  canvas.width = Math.ceil(box.width);
  canvas.height = Math.ceil(box.height);

  context.translate(canvas.width / 2, canvas.height / 2);
  context.rotate((rotation * Math.PI) / 180);
  context.scale(flipH ? -1 : 1, flipV ? -1 : 1);
  context.drawImage(image, -image.width / 2, -image.height / 2);

  const output = document.createElement("canvas");
  output.width = clampDimension(outputWidth);
  output.height = clampDimension(outputHeight);
  const outputContext = output.getContext("2d");

  if (!outputContext) {
    throw new Error("Could not prepare the cropped image canvas.");
  }

  outputContext.drawImage(
    canvas,
    Math.round(pixelCrop.x),
    Math.round(pixelCrop.y),
    Math.round(pixelCrop.width),
    Math.round(pixelCrop.height),
    0,
    0,
    output.width,
    output.height,
  );

  return new Promise<Blob>((resolve, reject) => {
    output.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
          return;
        }
        reject(new Error("Could not export the edited image."));
      },
      "image/webp",
      0.92,
    );
  });
}

function showAdminToast(message: string) {
  if (typeof document === "undefined") return;

  const toast = document.createElement("div");
  toast.className = "admin-toast is-error";
  toast.textContent = message;
  document.body.appendChild(toast);
  window.setTimeout(() => toast.remove(), 4300);
}

export default function AdminFileUpload(props: AdminFileUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const storagePath = normaliseStoragePath(props.storagePath ?? props.folder ?? "uploads");
  const recommendation = useMemo(() => fallbackRecommendation(storagePath), [storagePath]);
  const recommendedWidth = props.recommendedWidth ?? recommendation.width;
  const recommendedHeight = props.recommendedHeight ?? recommendation.height;
  const recommendedNote = props.recommendedNote ?? recommendation.note;
  const previewShape = props.previewShape ?? recommendation.shape;
  const previewFit = props.previewFit ?? "cover";
  const lockRatioDefault = props.lockRatioByDefault ?? previewShape !== "rect";
  const cropShape = previewShape === "circle" ? "round" : "rect";
  const uploadCallback = props.onUpload ?? props.onUploaded;
  const externalPreview = props.currentUrl ?? props.previewUrl ?? "";
  const [previewUrl, setPreviewUrl] = useState(externalPreview);
  const [imageSrc, setImageSrc] = useState("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [baseRotation, setBaseRotation] = useState(0);
  const [fineRotation, setFineRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [targetSize, setTargetSize] = useState({ width: recommendedWidth, height: recommendedHeight });
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [lockRatio, setLockRatio] = useState(lockRatioDefault);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [modalError, setModalError] = useState("");

  const rotation = baseRotation + fineRotation;
  const aspect = targetSize.width / targetSize.height;
  const previewThumbStyle = { aspectRatio: `${recommendedWidth} / ${recommendedHeight}` } as CSSProperties;

  useEffect(() => {
    setPreviewUrl(externalPreview);
  }, [externalPreview]);

  useEffect(() => {
    if (!imageSrc || typeof document === "undefined") return;

    document.body.classList.add("no-scroll");
    return () => document.body.classList.remove("no-scroll");
  }, [imageSrc]);

  useEffect(() => {
    setTargetSize({ width: recommendedWidth, height: recommendedHeight });
    setLockRatio(lockRatioDefault);
  }, [recommendedWidth, recommendedHeight, lockRatioDefault]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  function clearObjectUrl() {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }

  function resetEditor() {
    clearObjectUrl();
    setImageSrc("");
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setBaseRotation(0);
    setFineRotation(0);
    setFlipH(false);
    setFlipV(false);
    setTargetSize({ width: recommendedWidth, height: recommendedHeight });
    setCroppedAreaPixels(null);
    setLockRatio(lockRatioDefault);
    setModalError("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function openFilePicker() {
    inputRef.current?.click();
  }

  function handleFile(file: File | null | undefined) {
    if (!file) return;
    setError("");
    setModalError("");

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      setError("Please choose a PNG, JPG, WebP, AVIF, or GIF image.");
      return;
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      setError("Please choose an image under 10 MB.");
      return;
    }

    clearObjectUrl();
    const objectUrl = URL.createObjectURL(file);
    objectUrlRef.current = objectUrl;
    setImageSrc(objectUrl);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setBaseRotation(0);
    setFineRotation(0);
    setFlipH(false);
    setFlipV(false);
    setTargetSize({ width: recommendedWidth, height: recommendedHeight });
    setCroppedAreaPixels(null);
    setLockRatio(lockRatioDefault);
  }

  function updateDimension(axis: "width" | "height", rawValue: string) {
    const nextValue = clampDimension(Number(rawValue));
    setTargetSize((current) => {
      if (!lockRatio) {
        return { ...current, [axis]: nextValue };
      }

      const ratio = current.width / current.height || recommendedWidth / recommendedHeight || 1;
      return axis === "width"
        ? { width: nextValue, height: clampDimension(nextValue / ratio) }
        : { width: clampDimension(nextValue * ratio), height: nextValue };
    });
  }

  function removeImage() {
    setPreviewUrl("");
    setError("");

    if (props.onRemove) {
      props.onRemove();
      return;
    }

    uploadCallback?.("", { width: 0, height: 0, shape: previewShape });
  }

  async function applyAndUpload() {
    if (!croppedAreaPixels) {
      setModalError("Choose a crop area before uploading.");
      return;
    }

    if (!uploadCallback) {
      const message = "This upload field is missing an upload handler.";
      setModalError(message);
      showAdminToast(message);
      return;
    }

    if (!isSupabaseConfigured) {
      const message = "Supabase env vars are not configured yet.";
      setModalError(message);
      showAdminToast(message);
      return;
    }

    setUploading(true);
    setModalError("");

    let blob: Blob;
    try {
      blob = await getCroppedImage(
        imageSrc,
        croppedAreaPixels,
        rotation,
        flipH,
        flipV,
        targetSize.width,
        targetSize.height,
      );
    } catch (canvasError) {
      const message = canvasError instanceof Error ? canvasError.message : "Could not edit this image.";
      setUploading(false);
      showAdminToast(message);
      resetEditor();
      return;
    }

    try {
      const fullPath = `${storagePath}${Date.now()}.webp`;
      const { error: uploadError } = await supabase.storage
        .from("portfolio-assets")
        .upload(fullPath, blob, { contentType: "image/webp", upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from("portfolio-assets").getPublicUrl(fullPath);
      setPreviewUrl(data.publicUrl);
      uploadCallback(data.publicUrl, {
        width: targetSize.width,
        height: targetSize.height,
        shape: previewShape,
      });
      resetEditor();
    } catch (uploadError) {
      const message = uploadError instanceof Error ? uploadError.message : "Image upload failed.";
      setModalError(message);
      showAdminToast(message);
    } finally {
      setUploading(false);
    }
  }

  const editorModal = imageSrc ? (
    <div className="img-editor-overlay" role="dialog" aria-modal="true" aria-label="Edit Image">
      <div className="img-editor-card glass">
        <header className="img-editor-header">
          <div>
            <h2 className="img-editor-title">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m4 20 16-16" />
                <path d="m14.5 4.5 5 5" />
                <circle cx="7" cy="17" r="3" />
                <circle cx="17" cy="7" r="3" />
              </svg>
              Edit Image
            </h2>
            <p className="img-editor-subtitle">
              <span className="admin-upload-dim-badge">Recommended: {recommendedWidth} x {recommendedHeight} px</span>
              <span className="admin-upload-shape-badge">{shapeLabel(previewShape)}</span>
              {recommendedNote ? <span>{recommendedNote}</span> : null}
            </p>
          </div>
          <button className="icon-btn img-editor-close" type="button" aria-label="Close editor" onClick={resetEditor}>
            x
          </button>
        </header>

        <div className={`img-editor-canvas-wrap is-shape-${previewShape}`}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspect}
            cropShape={cropShape}
            showGrid
            minZoom={1}
            maxZoom={3}
            transform={`translate(${crop.x}px, ${crop.y}px) rotate(${rotation}deg) scale(${flipH ? -zoom : zoom}, ${flipV ? -zoom : zoom})`}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_croppedArea, croppedPixels) => setCroppedAreaPixels(croppedPixels)}
          />
        </div>

        <div className="img-editor-controls">
          <div className="img-editor-slider-row">
            <div className="img-editor-slider-group">
              <div className="img-editor-slider-label">
                <span>Zoom</span>
                <span>{zoom.toFixed(2)}x</span>
              </div>
              <div className="img-editor-slider-inner">
                <button className="img-editor-slider-btn" type="button" onClick={() => setZoom((value) => Math.max(1, value - 0.1))}>
                  -
                </button>
                <input
                  className="img-editor-range"
                  type="range"
                  min="1"
                  max="3"
                  step="0.05"
                  value={zoom}
                  style={rangeStyle(zoom, 1, 3)}
                  onChange={(event) => setZoom(Number(event.target.value))}
                />
                <button className="img-editor-slider-btn" type="button" onClick={() => setZoom((value) => Math.min(3, value + 0.1))}>
                  +
                </button>
              </div>
            </div>

            <div className="img-editor-slider-group">
              <div className="img-editor-slider-label">
                <span>Rotation</span>
                <span>{fineRotation.toFixed(1)} deg</span>
              </div>
              <div className="img-editor-slider-inner">
                <button className="img-editor-slider-btn" type="button" onClick={() => setFineRotation((value) => Math.max(-45, value - 2.5))}>
                  -
                </button>
                <input
                  className="img-editor-range"
                  type="range"
                  min="-45"
                  max="45"
                  step="0.5"
                  value={fineRotation}
                  style={rangeStyle(fineRotation, -45, 45)}
                  onChange={(event) => setFineRotation(Number(event.target.value))}
                />
                <button className="img-editor-slider-btn" type="button" onClick={() => setFineRotation((value) => Math.min(45, value + 2.5))}>
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="img-editor-tools">
            <button className="img-editor-tool-btn" type="button" onClick={() => setBaseRotation((value) => value - 90)}>
              Rotate Left
            </button>
            <button className="img-editor-tool-btn" type="button" onClick={() => setBaseRotation((value) => value + 90)}>
              Rotate Right
            </button>
            <button
              className={`img-editor-tool-btn ${flipH ? "is-active" : ""}`}
              type="button"
              aria-pressed={flipH}
              onClick={() => setFlipH((value) => !value)}
            >
              Flip H
            </button>
            <button
              className={`img-editor-tool-btn ${flipV ? "is-active" : ""}`}
              type="button"
              aria-pressed={flipV}
              onClick={() => setFlipV((value) => !value)}
            >
              Flip V
            </button>
          </div>

          <div className="img-editor-dim-row">
            <label>
              <span>W</span>
              <input
                className="img-editor-dim-input"
                type="number"
                min="1"
                max={MAX_OUTPUT_DIMENSION}
                value={targetSize.width}
                onChange={(event) => updateDimension("width", event.target.value)}
              />
            </label>
            <span className="img-editor-dim-unit">px</span>
            <span className="img-editor-dim-sep">x</span>
            <label>
              <span>H</span>
              <input
                className="img-editor-dim-input"
                type="number"
                min="1"
                max={MAX_OUTPUT_DIMENSION}
                value={targetSize.height}
                onChange={(event) => updateDimension("height", event.target.value)}
              />
            </label>
            <span className="img-editor-dim-unit">px</span>
            <button
              className={`img-editor-lock-btn ${lockRatio ? "is-locked" : ""}`}
              type="button"
              aria-pressed={lockRatio}
              aria-label={lockRatio ? "Unlock ratio" : "Lock ratio"}
              onClick={() => setLockRatio((value) => !value)}
            >
              {lockRatio ? (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="5" y="10" width="14" height="10" rx="2" />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="5" y="10" width="14" height="10" rx="2" />
                  <path d="M15 10V7a4 4 0 0 0-7-2.65" />
                </svg>
              )}
            </button>
            <span className="admin-upload-dim-badge">Recommended: {recommendedWidth} x {recommendedHeight} px</span>
          </div>
          {modalError ? <span className="admin-error">{modalError}</span> : null}
        </div>

        <footer className="img-editor-footer">
          <button className="btn btn-secondary" type="button" onClick={resetEditor} disabled={uploading}>
            Cancel
          </button>
          <button className="btn btn-primary img-editor-apply-btn" type="button" onClick={() => void applyAndUpload()} disabled={uploading}>
            {uploading ? (
              <>
                <span className="img-editor-spinner" aria-hidden="true" />
                Uploading...
              </>
            ) : (
              "Apply & Upload ->"
            )}
          </button>
        </footer>
      </div>
    </div>
  ) : null;

  return (
    <div className="admin-field admin-upload-field">
      <label>{props.label ?? "Upload asset"}</label>
      <div
        className={`admin-upload-area ${dragging ? "is-dragging" : ""}`}
        role="button"
        tabIndex={0}
        onClick={openFilePicker}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openFilePicker();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          handleFile(event.dataTransfer.files[0]);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={props.accept ?? "image/*"}
          onChange={(event) => handleFile(event.target.files?.[0])}
        />
        {previewUrl ? (
          <div className="admin-upload-preview-wrap">
            <img
              className={`admin-upload-preview-thumb is-shape-${previewShape} is-fit-${previewFit}`}
              src={previewUrl}
              alt=""
              style={previewThumbStyle}
            />
            <div className="admin-upload-actions" onClick={(event) => event.stopPropagation()}>
              <button className="admin-upload-replace" type="button" onClick={openFilePicker}>
                Replace image
              </button>
              <button className="admin-upload-remove" type="button" onClick={removeImage}>
                Remove
              </button>
            </div>
            <span className="admin-upload-dim-badge">Recommended: {recommendedWidth} x {recommendedHeight} px</span>
          </div>
        ) : (
          <>
            <svg className="admin-upload-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 3v11m0-11 4 4m-4-4-4 4" />
              <path d="M4 14v3a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-3" />
            </svg>
            <span className="admin-upload-label">Click to upload or drag and drop</span>
            <span className="admin-upload-sub">PNG, JPG, WebP, AVIF, GIF up to 10 MB</span>
            <span className="admin-upload-dim-badge">Recommended: {recommendedWidth} x {recommendedHeight} px</span>
            <span className="admin-upload-shape-badge">{shapeLabel(previewShape)}</span>
          </>
        )}
      </div>
      {error ? <span className="admin-error">{error}</span> : null}
      {editorModal && typeof document !== "undefined" ? createPortal(editorModal, document.body) : null}
    </div>
  );
}
