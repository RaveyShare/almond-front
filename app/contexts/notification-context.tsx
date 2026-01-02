'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../lib/api-config';
import { Almond } from '../types';
import { NotificationBar } from '../components/home/notification-bar';
import { ClarificationModal } from '../components/home/clarification-modal';

interface NotificationContextType {
  confirmationList: Almond[];
  pendingIds: number[];
  isModalOpen: boolean;
  addPendingId: (id: number) => void;
  openModal: () => void;
  closeModal: () => void;
  resolveConfirmation: (id: number, reply: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [pendingIds, setPendingIds] = useState<number[]>([]);
  const [confirmationList, setConfirmationList] = useState<Almond[]>([
    {
      id: 999,
      userId: 1,
      title: 'Mock Almond',
      content: '那个事情记得处理',
      description: '那个事情记得处理',
      clarifiedContent: '我不太确定你说的“那个事情”具体是指哪一件？是今天讨论的项目进度，还是之前提到的文档整理？方便补充一下吗？ 😊',
      almondStatus: 'new',
      aiClassification: 'unknown',
      needConfirm: true
    }
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Polling for pending almonds
  useEffect(() => {
    if (pendingIds.length === 0) return;

    const poll = async () => {
      try {
        const results = await Promise.allSettled(pendingIds.map(id => api.almonds.get(id)));
        
        const nextPendingIds: number[] = [];

        results.forEach((res, index) => {
            const id = pendingIds[index];
            if (res.status === 'fulfilled') {
                const almond = res.value;
                
                // Check if needs confirmation (Status is NEW and has AI Classification)
                const needsConfirm = (almond.almondStatus === 'new' && !!almond.aiClassification) || almond.needConfirm;

                if (needsConfirm) {
                    setConfirmationList(prev => {
                        if (prev.find(a => a.id === almond.id)) return prev;
                        return [...prev, almond];
                    });
                } else if (almond.almondStatus && almond.almondStatus !== 'new') {
                    // Already converted/processed, remove from pending
                } else {
                    // Still processing
                    nextPendingIds.push(id);
                }
            } else {
                // Error, keep pending to retry
                nextPendingIds.push(id);
            }
        });

        if (nextPendingIds.length !== pendingIds.length) {
            setPendingIds(nextPendingIds);
        }
      } catch (error) {
        console.error("Polling error", error);
      }
    };

    const timer = setInterval(poll, 3000);
    return () => clearInterval(timer);
  }, [pendingIds]);

  const addPendingId = (id: number) => {
    setPendingIds(prev => [...prev, id]);
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const resolveConfirmation = (id: number, reply: string) => {
    console.log(`Clarifying almond ${id} with: ${reply}`);
    setConfirmationList(prev => prev.filter(a => a.id !== id));
    // In real backend integration, we would call an API here.
  };

  return (
    <NotificationContext.Provider value={{
      confirmationList,
      pendingIds,
      isModalOpen,
      addPendingId,
      openModal,
      closeModal,
      resolveConfirmation
    }}>
      {children}
      
      {/* Global Notification Components */}
      <NotificationBar 
          count={confirmationList.length} 
          onClick={openModal}
      />
      
      <ClarificationModal 
          isOpen={isModalOpen} 
          onClose={closeModal}
          almonds={confirmationList}
          onSubmit={resolveConfirmation}
      />
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
