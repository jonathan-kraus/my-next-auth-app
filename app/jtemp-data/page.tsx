// app/jtemp-data/page.tsx
'use client';

import { useState, useEffect } from 'react';

// Define the expected structure of the jtemp record
interface JTempData {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export default function JTempDataPage() {
  const [data, setData] = useState<JTempData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/jtemp');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        setData(result.data);
      } catch (err) {
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div>
      <h2>JTemp API Data Display</h2>
      
      {loading && <p>Loading data...</p>}
      
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      
      {data && data.length > 0 ? (
        <table border={1} cellPadding={10} style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>{item.email}</td>
                <td>{new Date(item.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : !loading && <p>No JTemp data found.</p>}
    </div>
  );
}