"use client";

import { useState, useEffect } from 'react';
import { Edit, Check } from 'lucide-react';
import { useEditMode } from '@/providers/EditModeProvider';

interface EditableServiceTextProps {
  serviceId: string;
  value: string;
  field: string; // e.g., 'title', 'description', 'feature'
  locale?: 'th' | 'en';
  type?: 'text' | 'heading' | 'paragraph';
  className?: string;
  index?: number; // For features array
  onSave?: (value: string) => void;
}

export function EditableServiceText({
  serviceId,
  value,
  field,
  locale = 'en',
  type = 'text',
  className = '',
  index,
  onSave,
}: EditableServiceTextProps) {
  const { isEditMode, addChange, pendingChanges } = useEditMode();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [hasUnsavedChange, setHasUnsavedChange] = useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Update edit value when prop value changes (and not editing)
  useEffect(() => {
    if (!isEditing) {
      setEditValue(value);
    }
  }, [value, isEditing]);

  // Create unique path for this field
  const path = `services.${serviceId}.${field}${typeof index === 'number' ? `.${index}` : ''}`;

  // Check if this field has pending changes
  const pendingChange = pendingChanges.get(path);

  const handleClick = () => {
    if (isEditMode) {
      setIsEditing(true);
      setTimeout(() => {
        if (type === 'paragraph' && textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(textareaRef.current.value.length, textareaRef.current.value.length);
        } else if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 0);
    }
  };

  const handleSave = () => {
    if (editValue.trim() !== value) {
      addChange({
        path,
        value: editValue.trim(),
        locale,
        serviceId,
        field,
        index,
      } as any);
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

  if (!isEditMode) {
    // Return just the value without any wrapper tag
    return <>{value}</>;
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
            className="w-full px-3 py-2 border-2 border-blue-500 rounded bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[100px]"
            rows={4}
            autoFocus
          />
        ) : (
          <input
            type="text"
            ref={inputRef}
            value={editValue}
            onChange={(e) => {
              setEditValue(e.target.value);
              setHasUnsavedChange(true);
            }}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className={`w-full px-3 py-2 border-2 border-blue-500 rounded bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
            className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
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
      className={`group relative cursor-pointer ${wrapperClass}`}
    >
      <span className="border-2 border-transparent group-hover:border-blue-400 group-hover:rounded p-1 -m-1 transition-all rounded inline-block">
        <span className={className}>{value}</span>
      </span>
      <span className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <span className="bg-blue-600 text-white p-1.5 rounded-full shadow-lg inline-block">
          <Edit className="h-3 w-3" />
        </span>
      </span>
    </span>
  );
}

// Import React for refs
import React from 'react';
