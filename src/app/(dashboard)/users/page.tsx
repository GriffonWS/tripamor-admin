import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/user';
import { Crown } from 'lucide-react';
import SearchBar from '@/components/SearchBar';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 10;

async function getUsers(search: string, page: number) {
  await connectDB();
  const query = search
    ? {
        $or: [
          { email: { $regex: search, $options: 'i' } },
          { name: { $regex: search, $options: 'i' } },
        ],
      }
    : {};
  const [users, total] = await Promise.all([
    User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean(),
    User.countDocuments(query),
  ]);
  return { users, total };
}

function formatDate(date: Date | null | undefined) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const search = params.q ?? '';
  const page = parseInt(params.page ?? '1', 10) || 1;
  const { users, total } = await getUsers(search, page);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="max-w-6xl">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Users</h1>
          <p className="text-sm text-stone-500 mt-1">
            {total.toLocaleString()} total · showing {users.length}
          </p>
        </div>
        <SearchBar placeholder="Search email or name…" defaultValue={search} />
      </header>

      <div className="bg-white rounded-2xl border border-stone-200/60 shadow-sm overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead className="bg-stone-50 border-b border-stone-200/60 text-xs font-bold uppercase tracking-wide text-stone-500">
            <tr>
              <th className="text-left px-4 py-2.5">User</th>
              <th className="text-left px-4 py-2.5">Auth</th>
              <th className="text-left px-4 py-2.5">Plan</th>
              <th className="text-left px-4 py-2.5">AI Chats</th>
              <th className="text-left px-4 py-2.5">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-sm text-stone-500">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const isPro =
                  u.isPaid &&
                  u.subscriptionExpiresAt &&
                  new Date(u.subscriptionExpiresAt) > new Date();
                return (
                  <tr key={String(u._id)} className="hover:bg-stone-50/60">
                    <td className="px-4 py-2.5">
                      <div className="font-medium text-stone-900">
                        {u.name ?? '—'}
                      </div>
                      <div className="text-xs text-stone-500">{u.email}</div>
                    </td>
                    <td className="px-4 py-2.5 text-sm text-stone-600">
                      {(u.authMethods ?? []).join(', ') || 'email'}
                    </td>
                    <td className="px-4 py-2.5">
                      {isPro ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-brand text-white text-xs font-bold px-2.5 py-1">
                          <Crown className="w-3 h-3" />
                          PRO
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-stone-100 text-stone-600 text-xs font-medium px-2.5 py-1">
                          Free
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-stone-700">
                      {u.aiChatCount ?? 0}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-stone-600">
                      {formatDate(u.createdAt)}
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
                href={`/users?${new URLSearchParams({ q: search, page: String(page - 1) })}`}
                className="rounded-lg border border-stone-300 px-3 py-1.5 hover:bg-white"
              >
                Previous
              </a>
            )}
            {page < totalPages && (
              <a
                href={`/users?${new URLSearchParams({ q: search, page: String(page + 1) })}`}
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
