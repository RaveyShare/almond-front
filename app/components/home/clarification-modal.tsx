'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Almond } from '../../types';

interface ClarificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  almonds: Almond[];
  onSubmit: (id: number, content: string) => void;
}

export function ClarificationModal({ isOpen, onClose, almonds, onSubmit }: ClarificationModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reply, setReply] = useState('');

  // 确保索引在有效范围内
  const safeIndex = Math.min(currentIndex, Math.max(0, almonds.length - 1));
  const currentAlmond = almonds.length > 0 ? almonds[safeIndex] : null;

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setReply('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAlmond) return;
    
    onSubmit(currentAlmond.id, reply);
    setReply('');
    
    // 如果还有下一个，继续；否则关闭
    if (safeIndex < almonds.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onClose();
    }
  };

  if (!isOpen || !currentAlmond) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50 px-4"
          >
            <div className="bg-[#1a1f2e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-white/10 flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">小杏仁想问问你</h2>
                  <p className="text-white/60 text-sm">
                    有 {almonds.length} 个想法需要补充 
                    {almonds.length > 1 && ` (${safeIndex + 1}/${almonds.length})`}
                  </p>
                </div>
                <button 
                  onClick={onClose}
                  className="text-white/40 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                <div>
                  <label className="text-sm text-white/40 mb-2 block">你的想法</label>
                  <div className="text-white text-lg font-medium">
                    {currentAlmond.content || currentAlmond.description || "..."}
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">🤔</span>
                    <div className="text-blue-200 text-sm leading-relaxed pt-1">
                      {currentAlmond.clarifiedContent || "我不太确定你说的是哪件事，方便补充一下吗？ 😊"}
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="flex space-x-2">
                  <Input 
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="补充一下..."
                    className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/20"
                    autoFocus
                  />
                  <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white w-12 h-10 p-0 shrink-0 flex items-center justify-center">
                    <Check className="w-5 h-5" />
                  </Button>
                </form>
              </div>
              
              <div className="px-6 pb-6">
                 <button onClick={onClose} className="text-xs text-white/30 hover:text-white/50 transition-colors">
                    暂时不管它
                 </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
