import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/user';
import { Trip } from '@/models/trip';
import { Users, Plane, Crown, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getStats() {
  await connectDB();
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    paidUsers,
    newUsers7d,
    activeUsers30d,
    totalTrips,
    upcomingTrips,
    ongoingTrips,
    completedTrips,
    aiTrips,
  ] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({
      isPaid: true,
      subscriptionExpiresAt: { $gt: now },
    }),
    User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    User.countDocuments({ lastAiChatAt: { $gte: thirtyDaysAgo } }),
    Trip.countDocuments({}),
    Trip.countDocuments({ status: 'upcoming' }),
    Trip.countDocuments({ status: 'ongoing' }),
    Trip.countDocuments({ status: 'completed' }),
    Trip.countDocuments({ 'days.activities.source': 'ai' }),
  ]);

  const freeUsers = totalUsers - paidUsers;
  const proPercent = totalUsers > 0 ? Math.round((paidUsers / totalUsers) * 100) : 0;

  return {
    totalUsers,
    paidUsers,
    freeUsers,
    proPercent,
    newUsers7d,
    activeUsers30d,
    totalTrips,
    upcomingTrips,
    ongoingTrips,
    completedTrips,
    aiTrips,
  };
}

async function getRecentDestinations() {
  await connectDB();
  const result = await Trip.aggregate([
    { $group: { _id: '$destination', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ]);
  return result as { _id: string; count: number }[];
}

export default async function DashboardPage() {
  const stats = await getStats();
  const topDestinations = await getRecentDestinations();

  return (
    <div className="max-w-6xl">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900">Overview</h1>
        <p className="text-sm text-stone-500 mt-1">
          Real-time insights into users, trips, and subscriptions
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<Users className="w-5 h-5" />}
          label="Total Users"
          value={stats.totalUsers}
          sub={`${stats.newUsers7d} new this week`}
        />
        <StatCard
          icon={<Crown className="w-5 h-5" />}
          label="Pro Subscribers"
          value={stats.paidUsers}
          sub={`${stats.proPercent}% of users`}
          accent
        />
        <StatCard
          icon={<Plane className="w-5 h-5" />}
          label="Total Trips"
          value={stats.totalTrips}
          sub={`${stats.aiTrips} have AI activities`}
        />
        <StatCard
          icon={<Sparkles className="w-5 h-5" />}
          label="Active (30d)"
          value={stats.activeUsers30d}
          sub="Used AI in last 30 days"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Trip Status">
          <Row label="Planning" value={
            stats.totalTrips - stats.upcomingTrips - stats.ongoingTrips - stats.completedTrips
          } />
          <Row label="Upcoming" value={stats.upcomingTrips} />
          <Row label="Ongoing" value={stats.ongoingTrips} />
          <Row label="Completed" value={stats.completedTrips} />
        </Card>

        <Card title="Top Destinations">
          {topDestinations.length === 0 ? (
            <p className="text-sm text-stone-500 py-4">No trips yet</p>
          ) : (
            topDestinations.map((d) => (
              <Row key={d._id} label={d._id} value={d.count} />
            ))
          )}
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  sub: string;
  accent?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-stone-200/60 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div
          className={`w-9 h-9 rounded-lg grid place-items-center ${
            accent ? 'bg-brand text-white' : 'bg-stone-100 text-stone-600'
          }`}
        >
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-stone-900">
        {value.toLocaleString()}
      </div>
      <div className="text-xs font-semibold uppercase tracking-wide text-stone-500 mt-1">
        {label}
      </div>
      <div className="text-xs text-stone-400 mt-2">{sub}</div>
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-stone-200/60 shadow-sm">
      <h2 className="text-sm font-bold text-stone-900 mb-3 uppercase tracking-wide">
        {title}
      </h2>
      <div className="divide-y divide-stone-100">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-sm text-stone-700">{label}</span>
      <span className="text-sm font-bold text-stone-900">
        {value.toLocaleString()}
      </span>
    </div>
  );
}
