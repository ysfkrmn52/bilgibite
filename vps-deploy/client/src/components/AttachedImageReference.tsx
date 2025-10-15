// Reference component using the attached screenshot for UI inspiration
import React from 'react';
import { motion } from 'framer-motion';
import attachedScreenshot from '@assets/Ekran görüntüsü 2025-08-11 232625_1754944007472.png';

interface AttachedImageReferenceProps {
  showReference?: boolean;
}

export default function AttachedImageReference({ showReference = false }: AttachedImageReferenceProps) {
  if (!showReference) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-w-sm"
    >
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
          UI Reference
        </h3>
        <img 
          src={attachedScreenshot} 
          alt="UI Reference Screenshot" 
          className="w-full h-auto rounded border"
        />
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Attached screenshot for design reference
        </p>
      </div>
    </motion.div>
  );
}