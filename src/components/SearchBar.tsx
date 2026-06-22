'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

interface SearchBarProps {
  placeholder?: string;
  defaultValue?: string;
}

export default function SearchBar({
  placeholder = 'Search…',
  defaultValue = '',
}: SearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(defaultValue);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep input in sync if the URL ?q= changes from elsewhere.
  useEffect(() => {
    setValue(searchParams.get('q') ?? '');
  }, [searchParams]);

  function pushQuery(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (next) params.set('q', next);
    else params.delete('q');
    // Reset to page 1 whenever the query changes.
    params.delete('page');
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.value;
    setValue(next);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    // Clearing the field → update immediately so all rows show again.
    if (next === '') {
      pushQuery('');
      return;
    }

    // Otherwise debounce so we don't hammer the server on every keystroke.
    debounceRef.current = setTimeout(() => pushQuery(next), 300);
  }

  return (
    <input
      type="text"
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 w-full sm:w-64"
    />
  );
}