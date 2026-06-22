'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Plane,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/users', label: 'Users', icon: Users },
  { href: '/trips', label: 'Trips', icon: Plane },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Close the drawer whenever the route changes (mobile nav UX).
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' });
    router.replace('/login');
    router.refresh();
  }

  return (
    <>
      {/* Mobile top bar — only visible below lg */}
      <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-stone-200/60 flex items-center justify-between px-4 h-14">
        <div>
          <h1 className="text-base font-bold text-brand-dark leading-tight">
            Trip Amor
          </h1>
          <p className="text-[10px] text-stone-500">Admin Dashboard</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="p-2 rounded-lg hover:bg-stone-100"
        >
          <Menu className="w-5 h-5 text-stone-700" />
        </button>
      </div>

      {/* Backdrop — only shown when drawer is open on mobile */}
      {open && (
        <button
          onClick={() => setOpen(false)}
          aria-label="Close menu"
          className="lg:hidden fixed inset-0 z-40 bg-black/40"
        />
      )}

      {/* Sidebar — desktop is sticky column, mobile is slide-in drawer */}
      <aside
        className={`
          z-50 w-60 shrink-0 bg-white border-r border-stone-200/60
          flex flex-col
          lg:sticky lg:top-0 lg:h-screen lg:translate-x-0
          fixed top-0 left-0 h-screen transition-transform duration-200
          ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="px-5 py-6 border-b border-stone-200/60 flex items-start justify-between">
          <div>
            <h1 className="text-lg font-bold text-brand-dark">Trip Amor</h1>
            <p className="text-xs text-stone-500">Admin Dashboard</p>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="lg:hidden p-1 -mr-1 rounded hover:bg-stone-100"
          >
            <X className="w-5 h-5 text-stone-500" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active =
              href === '/' ? pathname === '/' : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  active
                    ? 'bg-brand/10 text-brand'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="m-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-3 transition"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </aside>
    </>
  );
}