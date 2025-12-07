// src/components/Sidenav.tsx (Example)

import Link from 'next/link';
// ... other imports

export function Sidenav() {
  return (
    <nav className="p-4 bg-gray-800 text-white h-full w-64 fixed">
      <ul className="space-y-2">
        
        {/* 🎯 NEW: HOME LINK */}
        <li>
          <Link href="/" className="block py-2 px-3 rounded hover:bg-gray-700 transition duration-150">
            🏠 Home
          </Link>
        </li>
        
        {/* Existing Link */}
        <li>
          <Link href="/jtemp-data" className="block py-2 px-3 rounded hover:bg-gray-700 transition duration-150">
            📊 JTemp Data
          </Link>
        </li>
        <li></li>
        {/* The Sign In/Out Component */}
        {/* ... (Your AuthButton component) */}
        
      </ul>
    </nav>
  );
}