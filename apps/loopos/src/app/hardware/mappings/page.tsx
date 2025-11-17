'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface HardwareMapping {
  id: string;
  input_id: string;
  input_type: string;
  action: string;
  param: Record<string, unknown>;
  feedback: string | null;
  enabled: boolean;
}

export default function MappingsPage() {
  const router = useRouter();
  const [mappings, setMappings] = useState<HardwareMapping[]>([]);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/hardware/profiles');
      const data = await response.json();

      if (data.success && data.profiles.length > 0) {
        const profile = data.profiles[0];
        setProfileId(profile.id);
        await fetchMappings(profile.id);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMappings = async (profId: string) => {
    try {
      const response = await fetch(`/api/hardware/mappings?profileId=${profId}`);
      const data = await response.json();

      if (data.success) {
        setMappings(data.mappings);
      }
    } catch (error) {
      console.error('Error fetching mappings:', error);
    }
  };

  const toggleMapping = async (mappingId: string, currentEnabled: boolean) => {
    try {
      const response = await fetch('/api/hardware/mappings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: mappingId,
          enabled: !currentEnabled,
        }),
      });

      if (response.ok && profileId) {
        await fetchMappings(profileId);
      }
    } catch (error) {
      console.error('Error toggling mapping:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1113] text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/hardware')}
            className="text-gray-400 hover:text-white mb-4 flex items-centre gap-2"
          >
            ← Back
          </button>
          <h1 className="text-4xl font-bold mb-2">Hardware Mappings</h1>
          <p className="text-gray-400">Configure hardware inputs to TotalAud.io actions</p>
        </div>

        {/* Mappings List */}
        {isLoading ? (
          <div className="text-centre text-gray-400 py-12">Loading mappings...</div>
        ) : mappings.length === 0 ? (
          <div className="text-centre py-12">
            <p className="text-gray-400 mb-4">No mappings configured yet</p>
            <p className="text-sm text-gray-500">
              Create mappings by connecting a device and using Learn Mode
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {mappings.map((mapping) => (
              <div
                key={mapping.id}
                className="p-4 rounded-lg border border-gray-800 bg-black/20 flex items-centre justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-centre gap-3 mb-2">
                    <span className="px-2 py-1 rounded text-xs font-mono bg-gray-800 text-[#3AA9BE]">
                      {mapping.input_type}
                    </span>
                    <span className="text-white font-medium">{mapping.input_id}</span>
                    <span className="text-gray-600">→</span>
                    <span className="text-gray-300">{mapping.action}</span>
                  </div>
                  {mapping.feedback && (
                    <div className="text-sm text-gray-500">
                      Feedback: <span className="text-gray-400">{mapping.feedback}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => toggleMapping(mapping.id, mapping.enabled)}
                  className={`px-4 py-2 rounded text-sm font-medium transition-colours ${
                    mapping.enabled
                      ? 'bg-[#3AA9BE] text-black'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {mapping.enabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Learn Mode (Placeholder) */}
        <div className="mt-8 p-6 rounded-lg border border-gray-800 bg-black/10">
          <h2 className="text-xl font-semibold mb-2">Learn Mode</h2>
          <p className="text-gray-400 mb-4">
            Press any hardware control to map it to a TotalAud.io action
          </p>
          <button className="px-6 py-3 rounded-lg bg-[#3AA9BE] text-black font-semibold hover:bg-[#3AA9BE]/90 transition-colours opacity-50 cursor-not-allowed">
            Start Learn Mode (Coming Soon)
          </button>
        </div>
      </div>
    </div>
  );
}
