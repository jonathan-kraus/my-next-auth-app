'use client';

import { useRef, useState, useEffect } from 'react';
import { appLog } from '@/utils/app-log';
import { createRequestId } from '@/lib/uuidj';
import Link from 'next/link';
import { useSession, signOut, signIn } from 'next-auth/react';
import {
  HomeIcon,
  ChartBarIcon,
  PencilSquareIcon,
  DocumentTextIcon,
  BugAntIcon,
  UserIcon,
  MagnifyingGlassIcon,
  CloudIcon,
} from '@heroicons/react/24/outline';
import versionInfo from '../version.json';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  protected?: boolean;
}

export const Sidenav = () => {
  // 🔥 Render counter
  const renderCount = useRef(0);
  const [jcount, setJcount] = useState(0);
  const requestId = createRequestId();
  useEffect(() => {
    renderCount.current++;
    setJcount(renderCount.current);
  });
  appLog({
    source: 'components/Sidenav.tsx',
    message: '---sidenav---',
    requestId: requestId,
    metadata: {
      action: 'initialize',
      timestamp: new Date().toISOString(),
    },
  });

  const { data: session } = useSession();

  const navItems: NavItem[] = [
    { name: 'Home', href: '/', icon: HomeIcon, protected: false },
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: ChartBarIcon,
      protected: false,
    },
    {
      name: 'Cloudspace',
      href: '/cloudspace',
      icon: ChartBarIcon,
      protected: false,
    },
    { name: 'Weather', href: '/weather', icon: CloudIcon, protected: false },
    {
      name: 'Astronomy',
      href: '/astronomy',
      icon: CloudIcon,
      protected: false,
    },
    { name: 'Notes', href: '/notes', icon: PencilSquareIcon, protected: true },
    {
      name: 'Jtemp',
      href: '/jtemp-data',
      icon: DocumentTextIcon,
      protected: false,
    },
    {
      name: 'Test-log',
      href: '/api/test-log',
      icon: BugAntIcon,
      protected: false,
    },
    { name: 'Test user', href: '/test', icon: UserIcon, protected: false },
    {
      name: 'Log Explorer',
      href: '/logs',
      icon: MagnifyingGlassIcon,
      protected: false,
    },
    { name: 'Log', href: '/log', icon: MagnifyingGlassIcon, protected: false },
  ];

  const displayName = session?.user?.name ?? 'Unknown User';
  const email = session?.user?.email ?? '';

  const visibleItems = navItems.filter((item) => !item.protected || !!session);

  return (
    <div className="w-64 bg-gray-800 text-white p-6 shadow-2xl">
      {/* App title */}
      <div className="text-2xl font-extrabold mb-4 text-indigo-400">
        App Monitor
      </div>

      <div className="text-sm text-gray-400 flex flex-col leading-tight">
        <span className="inline-block bg-indigo-600 text-white px-2 py-0.5 rounded-full text-xs font-semibold">
          v{versionInfo.version} Count {jcount}
        </span>
        <span className="text-gray-500">released {versionInfo.date}</span>
      </div>

      {/* Current user */}
      {session ? (
        <div className="mb-6 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold">{displayName}</p>
            <p className="text-sm text-gray-400">{email}</p>
            <button
              onClick={() => signOut()}
              className="mt-2 text-xs px-2 py-1 bg-red-500 rounded hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-6 flex flex-col gap-3">
          <p className="text-gray-400 text-sm">Not signed in</p>
          <button
            onClick={() => signIn('github')}
            className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            Sign in with GitHub
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="space-y-3">
        {visibleItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="group flex items-center space-x-3 p-3 rounded-lg 
                       transition-all duration-200 
                       hover:bg-indigo-600 hover:scale-[1.03] hover:shadow-lg
                       active:animate-bounce"
          >
            <item.icon className="h-6 w-6 text-indigo-300 group-hover:animate-wiggle" />
            <span className="font-semibold">{item.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};
