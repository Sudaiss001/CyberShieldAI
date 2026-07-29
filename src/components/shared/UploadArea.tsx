"use client";

import { useState, useRef, useCallback, type DragEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { DynamicIcon } from "./DynamicIcon";

interface UploadAreaProps {
  title: string;
  subtitle: string;
  accept?: string;
  formats: string[];
  iconName?: string;
  accentColor?: string;
  multiple?: boolean;
  onFileSelected?: (file: { name: string; size: number }) => void;
  className?: string;
  ctaLabel?: string;
}

interface FakeFile {
  name: string;
  size: number;
  progress: number;
}

export function UploadArea({
  title,
  subtitle,
  formats,
  iconName = "UploadCloud",
  accentColor = "#00d4ff",
  multiple = false,
  onFileSelected,
  className,
  ctaLabel = "Browse Files",
}: UploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<FakeFile[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFakeFile = useCallback(
    (name: string) => {
      const fakeSize = Math.floor(Math.random() * 5_000_000) + 200_000;
      const newFile: FakeFile = { name, size: fakeSize, progress: 0 };
      setFiles((prev) => (multiple ? [...prev, newFile] : [newFile]));
      onFileSelected?.({ name, size: fakeSize });

      // Simulate upload progress
      const interval = setInterval(() => {
        setFiles((prev) =>
          prev.map((f) =>
            f.name === newFile.name
              ? { ...f, progress: Math.min(100, f.progress + Math.random() * 18) }
              : f
          )
        );
      }, 250);
      setTimeout(() => clearInterval(interval), 3500);
    },
    [multiple, onFileSelected]
  );

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = Array.from(e.dataTransfer.files);
    if (dropped.length > 0) {
      dropped.slice(0, multiple ? 10 : 1).forEach((f) => addFakeFile(f.name));
    } else {
      // Fallback for the demo
      addFakeFile(`dropped-sample-${Date.now()}.bin`);
    }
  };

  const handleBrowse = () => inputRef.current?.click();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    if (selected.length > 0) {
      selected.forEach((f) => addFakeFile(f.name));
    } else {
      addFakeFile(`uploaded-sample-${Date.now()}.bin`);
    }
    e.target.value = "";
  };

  const removeFile = (name: string) => {
    setFiles((prev) => prev.filter((f) => f.name !== name));
  };

  return (
    <div className={cn("w-full", className)}>
      <motion.div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={handleBrowse}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleBrowse()}
        className={cn(
          "relative cursor-pointer rounded-2xl border-2 border-dashed transition-all p-8 sm:p-12 text-center",
          isDragging ? "scale-[1.01]" : "hover:scale-[1.005]"
        )}
        style={{
          borderColor: isDragging ? accentColor : "rgba(255,255,255,0.12)",
          background: isDragging
            ? `linear-gradient(135deg, ${accentColor}10, ${accentColor}05)`
            : "rgba(255,255,255,0.02)",
        }}
        animate={{ boxShadow: isDragging ? `0 0 40px ${accentColor}30` : "0 0 0 transparent" }}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          multiple={multiple}
          onChange={handleInputChange}
        />

        {/* Scan line animation when dragging */}
        {isDragging && (
          <motion.div
            className="absolute inset-x-0 h-1 pointer-events-none"
            style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }}
            initial={{ top: 0 }}
            animate={{ top: ["0%", "100%", "0%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        )}

        <motion.div
          animate={isDragging ? { scale: 1.15 } : { scale: 1 }}
          className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mb-5"
          style={{
            background: `linear-gradient(135deg, ${accentColor}25, ${accentColor}10)`,
            border: `1px solid ${accentColor}40`,
          }}
        >
          <DynamicIcon name={iconName} size={32} strokeWidth={1.8} style={{ color: accentColor }} />
        </motion.div>

        <h3 className="text-lg sm:text-xl font-semibold mb-1.5">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto mb-5">{subtitle}</p>

        <div className="flex flex-wrap justify-center gap-2 mb-5">
          {formats.map((fmt) => (
            <span
              key={fmt}
              className="text-[10px] uppercase tracking-wider font-medium px-2 py-1 rounded-md border"
              style={{
                color: accentColor,
                borderColor: `${accentColor}30`,
                background: `${accentColor}0a`,
              }}
            >
              {fmt}
            </span>
          ))}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleBrowse();
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all"
          style={{
            background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
            color: "#0a0e1a",
            boxShadow: `0 4px 20px ${accentColor}40`,
          }}
        >
          <UploadCloud size={16} strokeWidth={2.4} />
          {ctaLabel}
        </button>
        <p className="mt-3 text-xs text-muted-foreground">or drag & drop here</p>
      </motion.div>

      {/* File list */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-2"
          >
            {files.map((file) => (
              <FilePreview key={file.name} file={file} accentColor={accentColor} onRemove={() => removeFile(file.name)} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilePreview({
  file,
  accentColor,
  onRemove,
}: {
  file: FakeFile;
  accentColor: string;
  onRemove: () => void;
}) {
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1_048_576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1_048_576).toFixed(2)} MB`;
  };

  const isComplete = file.progress >= 100;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="glass rounded-xl p-3 flex items-center gap-3"
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: `${accentColor}15`, border: `1px solid ${accentColor}30` }}
      >
        <FileText size={18} style={{ color: accentColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium truncate">{file.name}</p>
          <button
            onClick={onRemove}
            className="text-muted-foreground hover:text-red-400 transition-colors shrink-0"
            aria-label="Remove file"
          >
            <X size={15} />
          </button>
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}99)` }}
              animate={{ width: `${file.progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span className="text-[10px] tabular-nums text-muted-foreground w-9 text-right">
            {Math.round(file.progress)}%
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">
          {formatSize(file.size)} {isComplete && "• Ready to scan"}
        </p>
      </div>
    </motion.div>
  );
}
