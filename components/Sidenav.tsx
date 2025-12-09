"use client";

import Link from "next/link";
import { useUser } from "@stackframe/stack";
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
  const user = useUser();

  const navItems = [
    { name: "Home", href: "/", icon: HomeIcon },
    { name: "Dashboard", href: "/dashboard", icon: ChartBarIcon },
    { name: "Notes", href: "/notes", icon: PencilSquareIcon },
    { name: "Jtemp", href: "/jtemp-data", icon: DocumentTextIcon },
    { name: "Test-log", href: "/api/test-log", icon: BugAntIcon },
    { name: "Test user", href: "/test", icon: UserIcon },
    { name: "Log Explorer", href: "/logs", icon: MagnifyingGlassIcon },
  ];

  return (
    <div className="w-64 bg-gray-800 text-white p-6 shadow-2xl">
      {/* App title */}
      <div className="text-2xl font-extrabold mb-4 text-indigo-400">
        App Monitor
      </div>

      {/* Current user */}
      {user && (
        <div className="mb-6 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white">
            {user.displayName?.charAt(0).toUpperCase() ?? "U"}
          </div>
          <div>
            <p className="font-semibold">{user.displayName ?? "Unknown User"}</p>
            <p className="text-sm text-gray-400">{user.primaryEmail ?? ""}</p>
          </div>
        </div>
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
