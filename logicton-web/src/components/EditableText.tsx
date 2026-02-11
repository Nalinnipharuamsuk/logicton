"use client";

import { useState, useRef, useEffect } from 'react';
import { Edit, Check } from 'lucide-react';
import { useEditMode } from '@/providers/EditModeProvider';

interface EditableTextProps {
  value: string;
  path: string; // Unique path for this field (e.g., 'home.hero.title')
  locale?: 'th' | 'en';
  type?: 'text' | 'heading' | 'paragraph';
  className?: string;
  onSave?: (value: string) => void;
  showEditBorder?: boolean; // Show blue border on hover in edit mode
  showEditIcon?: boolean; // Show edit icon on hover in edit mode
}

export function EditableText({
  value,
  path,
  locale = 'en',
  type = 'text',
  className = '',
  onSave,
  showEditBorder = false,
  showEditIcon = false,
}: EditableTextProps) {
  const { isEditMode, addChange, pendingChanges } = useEditMode();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [hasUnsavedChange, setHasUnsavedChange] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Update edit value when prop value changes (and not editing)
  useEffect(() => {
    if (!isEditing) {
      setEditValue(value);
    }
  }, [value, isEditing]);

  // Check if this field has pending changes
  const pendingChange = pendingChanges.get(path);
  const isChanged = pendingChange?.value !== value;

  const handleClick = () => {
    if (isEditMode) {
      setIsEditing(true);
      setTimeout(() => {
        if (type === 'paragraph' && textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(textareaRef.current.value.length, textareaRef.current.value.length);
        } else if (contentRef.current) {
          contentRef.current.focus();
        }
      }, 0);
    }
  };

  const handleSave = () => {
    if (editValue.trim() !== value) {
      addChange({ path, value: editValue.trim(), locale });
      onSave?.(editValue.trim());
    }
    setIsEditing(false);
    setHasUnsavedChange(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
    setHasUnsavedChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && type !== 'paragraph') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleBlur = () => {
    if (hasUnsavedChange) {
      handleSave();
    } else {
      setIsEditing(false);
    }
  };

  // Get tag based on type
  const getTag = () => {
    switch (type) {
      case 'heading':
        return 'h1';
      case 'paragraph':
        return 'p';
      default:
        return 'span';
    }
  };

  const Tag = getTag();

  if (!isEditMode) {
    return <Tag className={className}>{value}</Tag>;
  }

  if (isEditing) {
    return (
      <div className="relative inline-edit-wrapper">
        {type === 'paragraph' ? (
          <textarea
            ref={textareaRef}
            value={editValue}
            onChange={(e) => {
              setEditValue(e.target.value);
              setHasUnsavedChange(true);
            }}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className="w-full px-3 py-2 border-2 border-blue-500 dark:border-blue-400 rounded bg-blue-50/50 dark:bg-slate-800/50 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[100px]"
            rows={4}
            autoFocus
          />
        ) : (
          <input
            type="text"
            ref={contentRef as React.RefObject<HTMLInputElement>}
            value={editValue}
            onChange={(e) => {
              setEditValue(e.target.value);
              setHasUnsavedChange(true);
            }}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className={`w-full px-3 py-2 border-2 border-blue-500 dark:border-blue-400 rounded bg-blue-50/50 dark:bg-slate-800/50 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              type === 'heading' ? 'text-2xl font-bold' : ''
            }`}
            autoFocus
          />
        )}
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
          >
            <Check className="h-3 w-3" />
            Save
          </button>
          <button
            onClick={handleCancel}
            className="px-3 py-1 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-400 dark:hover:bg-gray-600 text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  const wrapperClass = type === 'paragraph' ? 'block' : 'inline-block';

  return (
    <span
      onClick={handleClick}
      className={`group relative ${showEditBorder || showEditIcon ? 'cursor-pointer' : ''} ${wrapperClass}`}
    >
      {showEditBorder ? (
        <span className="border-2 border-transparent group-hover:border-blue-400 group-hover:rounded p-1 -m-1 transition-all rounded inline-block">
          <Tag className={className}>{value}</Tag>
        </span>
      ) : (
        <Tag className={className}>{value}</Tag>
      )}
      {showEditIcon && (
        <span className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <span className="bg-blue-600 text-white p-1.5 rounded-full shadow-lg inline-block">
            <Edit className="h-3 w-3" />
          </span>
        </span>
      )}
    </span>
  );
}
