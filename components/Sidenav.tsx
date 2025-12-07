// app/components/Sidenav.tsx
'use client';

import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function Sidenav() {
  const { data: session, status } = useSession();
  const loading = status === 'loading';

  return (
    <div style={{ 
        width: '200px', 
        height: '100vh', 
        padding: '20px', 
        borderRight: '1px solid #ccc',
        backgroundColor: '#f8f8f8',
        position: 'fixed' // Makes it stay on the left
      }}>
      
      <h3>App Navigation</h3>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        
        {/* JTemp Link */}
        <li style={{ marginBottom: '10px' }}>
          <Link href="/jtemp-data">JTemp API Data</Link>
        </li>
        
        {/* Authentication Section */}
        <li style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
          {loading ? (
            <div>Loading...</div>
          ) : session ? (
            <>
              <p>Signed in as <b>{session.user?.email || 'User'}</b></p>
              <button onClick={() => signOut()}>Sign Out</button>
            </>
          ) : (
            <button onClick={() => signIn('github')}>Sign In with GitHub</button>
          )}
        </li>
      </ul>
    </div>
  );
}