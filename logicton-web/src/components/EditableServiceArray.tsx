"use client";

import { useState, useEffect } from 'react';
import { Edit, Check, X, Plus } from 'lucide-react';
import { useEditMode } from '@/providers/EditModeProvider';

interface EditableServiceArrayProps {
  serviceId: string;
  items: string[];
  field: string; // 'technologies'
  locale?: 'th' | 'en';
  onSave?: (items: string[]) => void;
}

export function EditableServiceArray({
  serviceId,
  items,
  field,
  locale = 'en',
  onSave,
}: EditableServiceArrayProps) {
  const { isEditMode, addChange, pendingChanges } = useEditMode();
  const [isEditing, setIsEditing] = useState(false);
  const [editItems, setEditItems] = useState(items);
  const [hasUnsavedChange, setHasUnsavedChange] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      setEditItems(items);
    }
  }, [items, isEditing]);

  const path = `services.${serviceId}.${field}.${locale}`;

  const pendingChange = pendingChanges.get(path);
  const isChanged = JSON.stringify(editItems) !== JSON.stringify(items);

  const handleClick = () => {
    if (isEditMode) {
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    const cleanedItems = editItems.map(item => item.trim()).filter(Boolean);
    addChange({
      path,
      value: cleanedItems,
      locale,
      serviceId,
      field,
    } as any);
    onSave?.(cleanedItems);
    setIsEditing(false);
    setHasUnsavedChange(false);
  };

  const handleCancel = () => {
    setEditItems(items);
    setIsEditing(false);
    setHasUnsavedChange(false);
  };

  const addItem = () => {
    setEditItems([...editItems, '']);
    setHasUnsavedChange(true);
  };

  const removeItem = (index: number) => {
    setEditItems(editItems.filter((_, i) => i !== index));
    setHasUnsavedChange(true);
  };

  const updateItem = (index: number, value: string) => {
    const newItems = [...editItems];
    newItems[index] = value;
    setEditItems(newItems);
    setHasUnsavedChange(true);
  };

  if (!isEditMode) {
    return (
      <div className="flex flex-wrap gap-3">
        {items.map((item, index) => (
          <span
            key={index}
            className="px-6 py-3 editable-service-tag rounded-full font-semibold border hover:shadow-md transition-all transform hover:scale-105 cursor-default"
          >
            {item}
          </span>
        ))}
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {editItems.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={item}
                onChange={(e) => updateItem(index, e.target.value)}
                className="px-4 py-2 border-2 border-blue-500 rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Technology name"
              />
              <button
                onClick={() => removeItem(index)}
                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            onClick={addItem}
            className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
          >
            <Check className="h-4 w-4" />
            Save
          </button>
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 text-sm font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className="group relative cursor-pointer inline-block"
    >
      <div className="flex flex-wrap gap-3">
        {items.map((item, index) => (
          <span
            key={index}
            className={`px-6 py-3 rounded-full font-semibold border transition-all editable-service-tag ${
              isChanged ? 'editable-service-tag-changed' : ''
            } group-hover:shadow-md`}
          >
            {item}
          </span>
        ))}
      </div>
      <span className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <span className="bg-blue-600 text-white p-1.5 rounded-full shadow-lg inline-block">
          <Edit className="h-3 w-3" />
        </span>
      </span>
    </div>
  );
}
