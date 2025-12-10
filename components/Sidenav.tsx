"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  HomeIcon,
  ChartBarIcon,
  PencilSquareIcon,
  DocumentTextIcon,
  BugAntIcon,
  UserIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

export const Sidenav = () => {
  const { data: session } = useSession();

  const navItems = [
    { name: "Home", href: "/", icon: HomeIcon },
    { name: "Dashboard", href: "/dashboard", icon: ChartBarIcon },
    { name: "Notes", href: "/notes", icon: PencilSquareIcon },
    { name: "Jtemp", href: "/jtemp-data", icon: DocumentTextIcon },
    { name: "Test-log", href: "/api/test-log", icon: BugAntIcon },
    { name: "Test user", href: "/test", icon: UserIcon },
    { name: "Log Explorer", href: "/logs", icon: MagnifyingGlassIcon },
    { name: "Log", href: "/log", icon: MagnifyingGlassIcon },
  ];

  const displayName = session?.user?.name ?? "Unknown User";
  const email = session?.user?.email ?? "";

  return (
    <div className="w-64 bg-gray-800 text-white p-6 shadow-2xl">
      {/* App title */}
      <div className="text-2xl font-extrabold mb-4 text-indigo-400">
        App Monitor
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
              className="mt-2 text-xs px-2 py-1 bg-red-500 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-6 text-gray-400">Not signed in</div>
      )}

      {/* Navigation */}
      <nav className="space-y-3">
        {navItems.map((item) => (
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
