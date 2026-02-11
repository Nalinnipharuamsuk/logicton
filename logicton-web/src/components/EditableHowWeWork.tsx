"use client";

import { useState } from 'react';
import { Edit, Check, X } from 'lucide-react';
import { useEditMode } from '@/providers/EditModeProvider';

interface Step {
  title: string;
  description: string;
}

interface EditableHowWeWorkProps {
  serviceId: string;
  steps: Step[];
  locale?: 'th' | 'en';
  onSave?: (steps: Step[]) => void;
}

export function EditableHowWeWork({
  serviceId,
  steps,
  locale = 'en',
  onSave,
}: EditableHowWeWorkProps) {
  const { isEditMode, addChange, pendingChanges } = useEditMode();
  const [editingStep, setEditingStep] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const path = `services.${serviceId}.howWeWork.${locale}`;

  const pendingChange = pendingChanges.get(`${path}.${editingStep}`);
  const isChanged = editingStep !== null;

  const handleEdit = (index: number) => {
    if (isEditMode) {
      setEditingStep(index);
      setEditTitle(steps[index]?.title || '');
      setEditDescription(steps[index]?.description || '');
    }
  };

  const handleSave = (index: number) => {
    const newSteps = [...steps];
    newSteps[index] = {
      title: editTitle.trim(),
      description: editDescription.trim(),
    };
    addChange({
      path: `${path}.${index}`,
      value: { title: editTitle.trim(), description: editDescription.trim() },
      locale,
      serviceId,
      field: 'howWeWork',
      index,
    } as any);
    onSave?.(newSteps);
    setEditingStep(null);
  };

  const handleCancel = () => {
    setEditingStep(null);
    setEditTitle('');
    setEditDescription('');
  };

  return (
    <div className="space-y-4">
      {steps.map((step, index) => {
        const isEditingThis = editingStep === index;

        return (
          <div
            key={index}
            className={`flex gap-4 rounded-xl p-6 transition-colors editable-how-we-work-card ${
              isEditMode && !isEditingThis ? 'cursor-pointer' : ''
            }`}
            onClick={() => !isEditingThis && handleEdit(index)}
          >
            <div className="shrink-0 w-10 h-10 rounded-full editable-how-we-work-number flex items-center justify-center font-bold text-lg">
              {index + 1}
            </div>
            <div className="flex-1">
              {isEditingThis ? (
                <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 border-2 rounded-lg editable-how-we-work-input focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                    placeholder="Step title"
                    autoFocus
                  />
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full px-3 py-2 border-2 rounded-lg editable-how-we-work-input focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[80px]"
                    placeholder="Step description"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSave(index)}
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
              ) : (
                <>
                  <h3 className="font-semibold editable-how-we-work-title mb-2 group relative">
                    {step.title}
                    {isEditMode && (
                      <span className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 ml-2">
                        <span className="bg-blue-600 text-white p-1 rounded-full shadow-lg inline-block">
                          <Edit className="h-3 w-3" />
                        </span>
                      </span>
                    )}
                  </h3>
                  <p className="editable-how-we-work-desc">{step.description}</p>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
