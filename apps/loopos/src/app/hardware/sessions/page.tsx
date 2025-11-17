'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface HardwareSession {
  id: string;
  device_type: string;
  started_at: string;
  ended_at: string | null;
  total_actions: number;
  duration_ms: number | null;
  flow_mode_duration_ms: number | null;
}

export default function SessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<HardwareSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/hardware/sessions?limit=20');
      const data = await response.json();

      if (data.success) {
        setSessions(data.sessions);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (ms: number | null) => {
    if (!ms) return 'N/A';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
          <h1 className="text-4xl font-bold mb-2">Session History</h1>
          <p className="text-gray-400">View your hardware control session statistics</p>
        </div>

        {/* Sessions List */}
        {isLoading ? (
          <div className="text-centre text-gray-400 py-12">Loading sessions...</div>
        ) : sessions.length === 0 ? (
          <div className="text-centre py-12">
            <p className="text-gray-400 mb-4">No sessions yet</p>
            <p className="text-sm text-gray-500">
              Connect a device and start a session to see it here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="p-6 rounded-lg border border-gray-800 bg-black/20"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-1">
                      {session.device_type.toUpperCase()}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {formatDate(session.started_at)}
                    </p>
                  </div>
                  {!session.ended_at && (
                    <span className="px-3 py-1 rounded-full bg-[#3AA9BE]/20 text-[#3AA9BE] text-sm">
                      Active
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Duration</p>
                    <p className="text-lg font-semibold">
                      {formatDuration(session.duration_ms)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Actions</p>
                    <p className="text-lg font-semibold">{session.total_actions}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Flow Mode</p>
                    <p className="text-lg font-semibold">
                      {formatDuration(session.flow_mode_duration_ms)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Status</p>
                    <p className="text-lg font-semibold">
                      {session.ended_at ? 'Completed' : 'Active'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Statistics Summary */}
        {sessions.length > 0 && (
          <div className="mt-8 p-6 rounded-lg border border-gray-800 bg-black/10">
            <h2 className="text-2xl font-semibold mb-4">Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Sessions</p>
                <p className="text-3xl font-bold text-[#3AA9BE]">{sessions.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Actions</p>
                <p className="text-3xl font-bold text-[#3AA9BE]">
                  {sessions.reduce((sum, s) => sum + s.total_actions, 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Time</p>
                <p className="text-3xl font-bold text-[#3AA9BE]">
                  {formatDuration(
                    sessions.reduce((sum, s) => sum + (s.duration_ms || 0), 0)
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Flow Mode Time</p>
                <p className="text-3xl font-bold text-[#3AA9BE]">
                  {formatDuration(
                    sessions.reduce((sum, s) => sum + (s.flow_mode_duration_ms || 0), 0)
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
