'use client';

import React, { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, X, AlertCircle, RefreshCw } from 'lucide-react';

interface PhotoUploadProps {
  photo?: string;
  onPhotoChange: (photoDataUrl?: string) => void;
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB limit
const ACCEPTED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

export function PhotoUploadControl({ photo, onPhotoChange }: PhotoUploadProps) {
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
      setError('Invalid file type. Please upload a JPEG, PNG, or WebP photo.');
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(`File exceeds 5MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please choose a smaller photo.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      onPhotoChange(dataUrl);
    };
    reader.onerror = () => {
      setError('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    onPhotoChange(undefined);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
          <Camera className="w-4 h-4 text-cyan-400" />
          <span>Incident Photo Evidence (Optional)</span>
        </label>
        <span className="text-[10px] font-mono text-slate-500">
          JPEG, PNG, WebP &bull; Max 5MB
        </span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelected}
        className="hidden"
        id="waste-photo-upload"
      />

      {photo ? (
        /* Photo Preview Card */
        <div className="relative rounded-xl overflow-hidden border border-command-border bg-command-card p-2 flex items-center gap-4">
          <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-700 shrink-0 bg-slate-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo}
              alt="Incident preview"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 space-y-1 text-xs">
            <div className="font-semibold text-slate-200">Evidence Photo Attached</div>
            <p className="text-slate-400 text-[11px]">
              Retained in local component state for submission.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-300"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Replace</span>
              </button>
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="flex items-center gap-1 text-[11px] font-mono text-rose-400 hover:text-rose-300 ml-2"
              >
                <X className="w-3 h-3" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty Upload Dropzone */
        <div
          onClick={() => fileInputRef.current?.click()}
          className="rounded-xl border border-dashed border-command-border hover:border-cyan-500/50 bg-command-surface/40 hover:bg-command-surface/70 p-4 transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 text-center"
        >
          <div className="p-2 rounded-full bg-command-card border border-command-border text-cyan-400">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div className="text-xs text-slate-300 font-medium">
            Click to attach an incident photo
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            Client-side preview only &bull; Stored in local session state
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-rose-400 font-mono pt-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
