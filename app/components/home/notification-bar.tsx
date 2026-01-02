'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';

interface NotificationBarProps {
  count: number;
  onClick: () => void;
}

export function NotificationBar({ count, onClick }: NotificationBarProps) {
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-8 right-8 z-50 cursor-pointer"
          onClick={onClick}
        >
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full px-6 py-4 shadow-lg flex items-center space-x-3 hover:scale-105 transition-transform border border-white/20">
            <Bell className="w-5 h-5 text-white" />
            <span className="text-white font-medium">小杏仁想问你 {count} 个问题</span>
            <div className="bg-white/20 rounded-full w-6 h-6 flex items-center justify-center text-xs text-white font-bold">
              {count}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
