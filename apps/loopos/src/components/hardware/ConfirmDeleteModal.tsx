'use client';

import { useState } from 'react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  itemName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDeleteModal({ isOpen, itemName, onConfirm, onCancel }: ConfirmDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-centre justify-centre bg-black/80">
      <div className="bg-[#111418] border border-[#2A2C30] rounded-2xl p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-semibold text-white mb-2">Confirm Delete</h3>
        <p className="text-gray-400 mb-6">
          Are you sure you want to delete <span className="text-white font-mono">{itemName}</span>? This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-[#1A1C20] text-white hover:bg-[#2A2C30] transition-colours"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colours"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
