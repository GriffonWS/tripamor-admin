import { connectDB } from '@/lib/mongodb';
import { Trip } from '@/models/trip';
import { User } from '@/models/user';
import SearchBar from '@/components/SearchBar';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 10;

async function getTrips(search: string, page: number) {
  await connectDB();
  const query = search
    ? { destination: { $regex: search, $options: 'i' } }
    : {};
  const [trips, total] = await Promise.all([
    Trip.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .populate({ path: 'user', model: User, select: 'email name' })
      .lean(),
    Trip.countDocuments(query),
  ]);
  return { trips, total };
}

function formatDateRange(start: Date, end: Date) {
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${new Date(start).toLocaleDateString(undefined, opts)} – ${new Date(
    end,
  ).toLocaleDateString(undefined, { ...opts, year: 'numeric' })}`;
}

function activityCount(days: TripRowDays) {
  return days.reduce((sum, d) => sum + (d.activities?.length ?? 0), 0);
}

function aiCount(days: TripRowDays) {
  return days.reduce(
    (sum, d) =>
      sum + (d.activities ?? []).filter((a) => a.source === 'ai').length,
    0,
  );
}

type TripRowDays = Array<{
  dayNumber: number;
  activities?: Array<{ source?: string }>;
}>;

const STATUS_STYLES: Record<string, string> = {
  planning: 'bg-stone-100 text-stone-700',
  upcoming: 'bg-blue-100 text-blue-700',
  ongoing: 'bg-green-100 text-green-700',
  completed: 'bg-stone-200 text-stone-700',
};

export default async function TripsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const search = params.q ?? '';
  const page = parseInt(params.page ?? '1', 10) || 1;
  const { trips, total } = await getTrips(search, page);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="max-w-6xl">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Trips</h1>
          <p className="text-sm text-stone-500 mt-1">
            {total.toLocaleString()} total · showing {trips.length}
          </p>
        </div>
        <SearchBar placeholder="Search destination…" defaultValue={search} />
      </header>

      <div className="bg-white rounded-2xl border border-stone-200/60 shadow-sm overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead className="bg-stone-50 border-b border-stone-200/60 text-xs font-bold uppercase tracking-wide text-stone-500">
            <tr>
              <th className="text-left px-4 py-2.5">Destination</th>
              <th className="text-left px-4 py-2.5">Owner</th>
              <th className="text-left px-4 py-2.5">Dates</th>
              <th className="text-left px-4 py-2.5">Status</th>
              <th className="text-left px-4 py-2.5">Activities</th>
              <th className="text-left px-4 py-2.5">AI %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {trips.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-sm text-stone-500">
                  No trips found.
                </td>
              </tr>
            ) : (
              trips.map((t) => {
                const owner = t.user as unknown as
                  | { email?: string; name?: string }
                  | null;
                const days = (t.days ?? []) as TripRowDays;
                const total = activityCount(days);
                const ai = aiCount(days);
                const aiPct = total > 0 ? Math.round((ai / total) * 100) : 0;
                return (
                  <tr key={String(t._id)} className="hover:bg-stone-50/60">
                    <td className="px-4 py-2.5">
                      <div className="font-medium text-stone-900">
                        {t.destination}
                      </div>
                      <div className="text-xs text-stone-500">
                        {t.travelers} traveler{t.travelers === 1 ? '' : 's'}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-sm">
                      <div className="text-stone-700">{owner?.name ?? '—'}</div>
                      <div className="text-xs text-stone-500">
                        {owner?.email ?? ''}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-sm text-stone-600">
                      {formatDateRange(t.startDate, t.endDate)}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`inline-flex rounded-full text-xs font-medium px-2.5 py-1 capitalize ${
                          STATUS_STYLES[t.status] ?? 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-sm text-stone-700">
                      {total} <span className="text-stone-400 text-xs">in {days.length}d</span>
                    </td>
                    <td className="px-4 py-2.5 text-sm text-stone-700">
                      {aiPct}%
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-stone-600">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <a
                href={`/trips?${new URLSearchParams({ q: search, page: String(page - 1) })}`}
                className="rounded-lg border border-stone-300 px-3 py-1.5 hover:bg-white"
              >
                Previous
              </a>
            )}
            {page < totalPages && (
              <a
                href={`/trips?${new URLSearchParams({ q: search, page: String(page + 1) })}`}
                className="rounded-lg border border-stone-300 px-3 py-1.5 hover:bg-white"
              >
                Next
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
