"use client";

import { useCallback, useRef, useState } from "react";
import { uploadImage } from "@/lib/uploadImage";

type Props = {
  onUploaded: (url: string) => void;
  label?: string;
  className?: string;
  disabled?: boolean;
};

export default function ImageUploadDropzone({
  onUploaded,
  label = "Drag image here or click to browse",
  className = "",
  disabled = false,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const processFile = useCallback(
    async (file?: File | null) => {
      if (!file || disabled || isUploading) return;

      if (!file.type.startsWith("image/")) {
        alert("Please upload an image file.");
        return;
      }

      try {
        setIsUploading(true);
        const url = await uploadImage(file);
        onUploaded(url);
      } catch (error) {
        console.error("Image upload failed:", error);
        alert("Image upload failed.");
      } finally {
        setIsUploading(false);
        setIsDragging(false);
      }
    },
    [disabled, isUploading, onUploaded],
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();

      if (disabled || isUploading) return;

      setIsDragging(false);
      const file = e.dataTransfer.files?.[0] ?? null;
      await processFile(file);
    },
    [disabled, isUploading, processFile],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
    },
    [],
  );

  const handleDragEnter = useCallback(
    (e: React.DragEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();

      if (disabled || isUploading) return;
      setIsDragging(true);
    },
    [disabled, isUploading],
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    },
    [],
  );

  const handleBrowseClick = useCallback(() => {
    if (disabled || isUploading) return;
    inputRef.current?.click();
  }, [disabled, isUploading]);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null;
      await processFile(file);
      e.target.value = "";
    },
    [processFile],
  );

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/jpg"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled || isUploading}
      />

      <button
        type="button"
        onClick={handleBrowseClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        disabled={disabled || isUploading}
        className={[
          "flex h-full w-full items-center justify-center rounded-xl border-2 border-dashed px-4 text-center text-sm transition",
          disabled || isUploading
            ? "cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400"
            : isDragging
              ? "border-blue-500 bg-blue-50 text-blue-700"
              : "border-neutral-300 bg-white text-neutral-500 hover:bg-neutral-50",
          className,
        ].join(" ")}
      >
        {isUploading ? "Uploading image..." : label}
      </button>
    </>
  );
}