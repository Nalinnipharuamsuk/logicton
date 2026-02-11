"use client";

import { useState, useRef } from 'react';
import { Edit, X, Upload, Link as LinkIcon, Check } from 'lucide-react';
import Image from 'next/image';
import { useEditMode } from '@/providers/EditModeProvider';

interface EditableImageProps {
  src: string;
  alt: string;
  path: string; // Unique path for this field (e.g., 'home.hero.image')
  locale?: 'th' | 'en';
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  style?: React.CSSProperties;
  unoptimized?: boolean;
  onSave?: (value: string) => void;
  inlineContent?: Record<string, string>; // Access to saved inline content
  contentLoaded?: boolean; // Whether inline content has been loaded
}

export function EditableImage({
  src,
  alt,
  path,
  locale = 'en',
  width,
  height,
  fill = false,
  className = '',
  style = {},
  unoptimized = false,
  onSave,
  inlineContent = {},
  contentLoaded = true,
}: EditableImageProps) {
  const { isEditMode, addChange, pendingChanges } = useEditMode();
  const [isEditing, setIsEditing] = useState(false);
  const [editMode, setEditMode] = useState<'upload' | 'url' | null>(null);
  const [urlValue, setUrlValue] = useState(src);
  const [previewUrl, setPreviewUrl] = useState(src);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pendingChange = pendingChanges.get(path);

  // Priority: pendingChange > inlineContent (saved) > original src
  const savedValue = inlineContent[path];
  const baseSrc = savedValue || src;
  const displaySrc = pendingChange?.value || baseSrc;

  const handleClick = () => {
    if (isEditMode) {
      setIsEditing(true);
      setUrlValue(displaySrc);
      setPreviewUrl(displaySrc);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to server
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', path);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success && data.url) {
        setPreviewUrl(data.url);
        setUrlValue(data.url);
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
    }
  };

  const handleSave = () => {
    if (previewUrl !== baseSrc) {
      addChange({ path, value: previewUrl, locale });
      onSave?.(previewUrl);
    }
    closeEdit();
  };

  const handleCancel = () => {
    closeEdit();
  };

  const closeEdit = () => {
    setIsEditing(false);
    setEditMode(null);
    setUrlValue(baseSrc);
    setPreviewUrl(baseSrc);
  };

  const handleUrlSave = () => {
    if (urlValue && urlValue !== baseSrc) {
      setPreviewUrl(urlValue);
    }
    setEditMode(null);
  };

  // Show skeleton while content is loading (prevents flicker)
  if (!contentLoaded) {
    return (
      <div className={`${fill ? 'absolute inset-0 ' : ''}${className}`} style={style}>
        <div className="w-full h-full bg-muted animate-pulse rounded"></div>
      </div>
    );
  }

  if (!isEditMode) {
    return (
      <Image
        src={displaySrc}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        className={`${fill ? 'absolute inset-0 ' : ''}${className}`}
        style={style}
        unoptimized={unoptimized}
      />
    );
  }

  const hasPendingChange = pendingChange?.value && pendingChange.value !== baseSrc;

  return (
    <div className={`relative group ${hasPendingChange ? 'ring-2 ring-yellow-500 ring-offset-2 rounded' : ''}`}>
      {/* Edit overlay on click */}
      <div
        onClick={handleClick}
        className="relative cursor-pointer"
      >
        <Image
          src={displaySrc}
          alt={alt}
          width={width}
          height={height}
          fill={fill}
          className={`${fill ? 'absolute inset-0 ' : ''}${className}`}
          style={style}
          unoptimized={unoptimized}
        />
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Edit Image</h3>
              <button
                onClick={handleCancel}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Preview */}
            <div className="mb-4 bg-gray-100 rounded-lg p-4 flex items-center justify-center min-h-[300px] max-h-[400px]">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full max-h-[350px] object-contain rounded"
                />
              ) : (
                <p className="text-gray-500">No image selected</p>
              )}
            </div>

            {/* Edit mode selection */}
            {!editMode ? (
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setEditMode('upload');
                    fileInputRef.current?.click();
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Upload className="h-5 w-5" />
                  Upload Image
                </button>
                <button
                  onClick={() => setEditMode('url')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <LinkIcon className="h-5 w-5" />
                  Use URL
                </button>
              </div>
            ) : editMode === 'url' ? (
              <div className="space-y-4">
                <input
                  type="url"
                  value={urlValue}
                  onChange={(e) => setUrlValue(e.target.value)}
                  placeholder="Enter image URL"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleUrlSave}
                    className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Check className="h-4 w-4" />
                    Set URL
                  </button>
                  <button
                    onClick={() => setEditMode(null)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : null}

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Action buttons */}
            <div className="flex gap-2 mt-4 pt-4 border-t">
              <button
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Check className="h-4 w-4" />
                Save Changes
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
