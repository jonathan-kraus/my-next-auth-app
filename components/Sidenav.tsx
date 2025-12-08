// components/Sidenav.tsx

import Link from "next/link";

export const Sidenav = () => {
  const navItems = [
    { name: "Home", href: "/", icon: "🏠" },
    { name: "Dashboard", href: "/dashboard", icon: "🏠" },
    { name: "Jtemp", href: "/jtemp", icon: "🏠" },
    { name: "Log Explorer", href: "/logs", icon: "🔍" },
    { name: "Settings", href: "/settings", icon: "⚙️" },
  ];

  return (
    <div className="w-64 bg-gray-800 text-white p-6 shadow-2xl">
      <div className="text-2xl font-extrabold mb-8 text-indigo-400">
        App Monitor
      </div>

      <nav className="space-y-3">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex items-center space-x-3 p-3 rounded-lg 
                       transition-all duration-200 
                       hover:bg-indigo-600 hover:scale-[1.03] hover:shadow-lg"
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-semibold">{item.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};
