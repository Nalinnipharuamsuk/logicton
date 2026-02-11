"use client";

import { useEditMode } from '@/providers/EditModeProvider';
import { useSession } from 'next-auth/react';
import { Edit, X, Home } from 'lucide-react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

/**
 * Floating toggle button for edit mode.
 * Only visible when user is logged in as admin.
 */
export function EditModeToggle() {
  const { data: session } = useSession();
  const { isEditMode, setEditMode, pendingChanges } = useEditMode();
  const locale = useLocale();
  const [mounted, setMounted] = useState(false);

  // Wait for client-side mount to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const isAdmin = session?.user?.email === 'admin@logicton.com' || session?.user?.email === 'admin';

  // Don't render anything until mounted on client
  if (!mounted || !isAdmin) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 100, opacity: 0 }}
        className="fixed bottom-24 right-6 z-50 flex flex-col gap-3"
      >
        {/* Edit mode status badge */}
        {isEditMode && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium"
          >
            Edit Mode Active
            {pendingChanges.size > 0 && (
              <span className="ml-2 bg-white text-blue-600 px-2 py-0.5 rounded-full text-xs">
                {pendingChanges.size} change{pendingChanges.size !== 1 ? 's' : ''}
              </span>
            )}
          </motion.div>
        )}

        {/* Admin action buttons */}
        <div className="flex flex-col gap-2">
          {/* Dashboard link */}
          <Link
            href={`/${locale}/admin/dashboard`}
            className="w-12 h-12 bg-gray-700 hover:bg-gray-800 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
            title="Go to Dashboard"
          >
            <Home className="h-5 w-5" />
          </Link>

          {/* Edit mode toggle */}
          <button
            onClick={() => setEditMode(!isEditMode)}
            className={`w-14 h-14 ${
              isEditMode
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white rounded-full shadow-lg flex items-center justify-center transition-colors`}
            title={isEditMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
          >
            {isEditMode ? <X className="h-6 w-6" /> : <Edit className="h-6 w-6" />}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
