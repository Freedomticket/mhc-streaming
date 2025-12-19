import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';

interface DashboardStats {
  pendingReports: number;
  pendingDMCA: number;
  pendingAppeals: number;
  totalUsers: number;
  totalVideos: number;
  totalRevenue: number;
}

/**
 * MHC Admin Dashboard Home
 * Central control panel for moderation, DMCA, users, and analytics
 * Respects Dante realm styling (Inferno/Purgatorio/Paradiso)
 */
export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [realm, setRealm] = useState<'inferno' | 'purgatorio' | 'paradiso'>('inferno');

  useEffect(() => {
    // Fetch dashboard summary from backend
    axios.get('/api/admin/dashboard').then((res) => {
      setStats(res.data.summary);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    // Load user's realm preference
    const savedRealm = localStorage.getItem('realm') as any;
    if (savedRealm) setRealm(savedRealm);
  }, []);

  const realmClasses = {
    inferno: 'bg-black text-white border-red-600',
    purgatorio: 'bg-gray-100 text-gray-800 border-gray-400',
    paradiso: 'bg-white text-black border-yellow-500',
  };

  const headerClasses = {
    inferno: 'text-red-600',
    purgatorio: 'text-gray-600',
    paradiso: 'text-yellow-600',
  };

  return (
    <div className={`min-h-screen p-8 ${realmClasses[realm]}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-4xl font-bold mb-2 ${headerClasses[realm]}`}>
            🔥 MHC ADMIN CONTROL CENTER
          </h1>
          <p className="text-sm opacity-75">
            Moderation • Compliance • Analytics • System Integrity
          </p>
        </div>

        {/* Realm Switcher */}
        <div className="mb-8 flex gap-2">
          {(['inferno', 'purgatorio', 'paradiso'] as const).map((r) => (
            <button
              key={r}
              onClick={() => {
                setRealm(r);
                localStorage.setItem('realm', r);
              }}
              className={`px-4 py-2 rounded capitalize border-2 ${
                realm === r ? 'opacity-100 border-current' : 'opacity-50'
              }`}
            >
              {r === 'inferno' && '🔥'}
              {r === 'purgatorio' && '⚪'}
              {r === 'paradiso' && '✨'}
              {' ' + r}
            </button>
          ))}
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {/* Pending Reports */}
              <div className={`border-2 p-6 rounded ${realmClasses[realm]}`}>
                <h3 className="text-lg font-bold mb-2">🚨 Pending Reports</h3>
                <p className={`text-3xl font-bold ${headerClasses[realm]}`}>
                  {stats?.pendingReports || 0}
                </p>
                <p className="text-sm opacity-75">Content awaiting review</p>
              </div>

              {/* DMCA Requests */}
              <div className={`border-2 p-6 rounded ${realmClasses[realm]}`}>
                <h3 className="text-lg font-bold mb-2">⚖️ DMCA Requests</h3>
                <p className={`text-3xl font-bold ${headerClasses[realm]}`}>
                  {stats?.pendingDMCA || 0}
                </p>
                <p className="text-sm opacity-75">Copyright takedowns pending</p>
              </div>

              {/* Appeals */}
              <div className={`border-2 p-6 rounded ${realmClasses[realm]}`}>
                <h3 className="text-lg font-bold mb-2">📝 Appeals</h3>
                <p className={`text-3xl font-bold ${headerClasses[realm]}`}>
                  {stats?.pendingAppeals || 0}
                </p>
                <p className="text-sm opacity-75">User disputes in review</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
              {/* Total Users */}
              <div className={`border-2 p-6 rounded ${realmClasses[realm]}`}>
                <h3 className="text-lg font-bold mb-2">👥 Total Users</h3>
                <p className={`text-3xl font-bold ${headerClasses[realm]}`}>
                  {stats?.totalUsers || 0}
                </p>
                <p className="text-sm opacity-75">Active accounts</p>
              </div>

              {/* Total Videos */}
              <div className={`border-2 p-6 rounded ${realmClasses[realm]}`}>
                <h3 className="text-lg font-bold mb-2">📹 Total Videos</h3>
                <p className={`text-3xl font-bold ${headerClasses[realm]}`}>
                  {stats?.totalVideos || 0}
                </p>
                <p className="text-sm opacity-75">Content on platform</p>
              </div>

              {/* Total Revenue */}
              <div className={`border-2 p-6 rounded ${realmClasses[realm]}`}>
                <h3 className="text-lg font-bold mb-2">💰 Total Revenue</h3>
                <p className={`text-3xl font-bold ${headerClasses[realm]}`}>
                  ${stats?.totalRevenue || 0}
                </p>
                <p className="text-sm opacity-75">Platform earnings (30 days)</p>
              </div>
            </div>

            {/* Navigation Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <AdminLink href="/admin/users" title="Users" icon="👤" realm={realm} />
              <AdminLink href="/admin/videos" title="Videos" icon="📹" realm={realm} />
              <AdminLink href="/admin/reports" title="Reports" icon="🚨" realm={realm} />
              <AdminLink href="/admin/dmca" title="DMCA" icon="⚖️" realm={realm} />
              <AdminLink href="/admin/livestreams" title="Livestreams" icon="🔴" realm={realm} />
              <AdminLink href="/admin/moderation" title="Strikes & Bans" icon="⛔" realm={realm} />
              <AdminLink href="/admin/forensics" title="Forensics" icon="🔍" realm={realm} />
              <AdminLink href="/admin/revenue" title="Revenue" icon="💵" realm={realm} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Navigation card component
 */
function AdminLink({
  href,
  title,
  icon,
  realm,
}: {
  href: string;
  title: string;
  icon: string;
  realm: string;
}) {
  const borderColors = {
    inferno: 'border-red-600 hover:bg-red-900',
    purgatorio: 'border-gray-400 hover:bg-gray-300',
    paradiso: 'border-yellow-500 hover:bg-yellow-100',
  };

  return (
    <Link href={href}>
      <div
        className={`border-2 ${borderColors[realm as keyof typeof borderColors]} p-4 rounded cursor-pointer transition`}
      >
        <div className="text-3xl mb-2">{icon}</div>
        <p className="font-bold">{title}</p>
      </div>
    </Link>
  );
}
