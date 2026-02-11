"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Save, Edit3 } from 'lucide-react';
import { useEditMode } from '@/providers/EditModeProvider';
import { useState } from 'react';

export function EditModeBar() {
  const { isEditMode, hasChanges, pendingChanges, saveChanges, cancelChanges } = useEditMode();
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    const success = await saveChanges();
    setIsSaving(false);

    if (success) {
      setShowSuccess(true);
      // Reload page after showing success message
      setTimeout(() => {
        window.location.href = window.location.href;
      }, 500);
    }
  };

  return (
    <AnimatePresence>
      {isEditMode && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center gap-6">
              {/* Edit Mode Indicator */}
              <div className="flex items-center gap-2">
                <div className="bg-blue-600 p-2 rounded-full">
                  <Edit3 className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Edit Mode</p>
                  <p className="text-xs text-muted-foreground">
                    {pendingChanges.size} change{pendingChanges.size !== 1 ? 's' : ''} pending
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="h-8 w-px bg-gray-300 dark:bg-gray-600" />

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSave}
                  disabled={isSaving || !hasChanges}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    hasChanges
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isSaving ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save
                    </>
                  )}
                </button>
                <button
                  onClick={cancelChanges}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
              </div>
            </div>
          </div>

          {/* Success Toast */}
          {showSuccess && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="absolute -top-16 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              Changes saved successfully!
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
