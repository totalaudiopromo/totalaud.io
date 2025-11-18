/**
 * OperatorOS Settings Page
 * Central console for per-user OperatorOS configuration
 * Phase 3 - Desktop Experience Layer
 */

'use client';

import { useState } from 'react';
import { LayoutPreferencesSection } from './components/LayoutPreferencesSection';
import { AppPreferencesSection } from './components/AppPreferencesSection';

export default function OperatorSettingsPage() {
  const [activeTab, setActiveTab] = useState<'layouts' | 'apps'>('layouts');

  // TODO: Get user/workspace IDs from auth context
  const userId = 'temp-user-id';
  const workspaceId = 'temp-workspace-id';

  return (
    <div className="min-h-screen bg-[#05070A] text-white">
      {/* Header */}
      <div className="border-b border-white/6 bg-[#0A0D12]">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-semibold mb-2">OperatorOS Settings</h1>
          <p className="text-gray-400">Configure your desktop environment and app preferences</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/6 bg-[#0A0D12]/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('layouts')}
              className={`px-4 py-3 border-b-2 transition-colors ${
                activeTab === 'layouts'
                  ? 'border-[#3AA9BE] text-white'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              Layout Preferences
            </button>
            <button
              onClick={() => setActiveTab('apps')}
              className={`px-4 py-3 border-b-2 transition-colors ${
                activeTab === 'apps'
                  ? 'border-[#3AA9BE] text-white'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              App Preferences
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'layouts' && (
          <LayoutPreferencesSection userId={userId} workspaceId={workspaceId} />
        )}
        {activeTab === 'apps' && (
          <AppPreferencesSection userId={userId} workspaceId={workspaceId} />
        )}
      </div>
    </div>
  );
}
