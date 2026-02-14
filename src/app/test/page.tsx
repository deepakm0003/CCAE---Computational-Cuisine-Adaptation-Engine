'use client';

import { useAuth } from '@/context/AuthContext';

export default function TestPage() {
  try {
    const { user, isLoading } = useAuth();
    
    return (
      <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Auth Test Page</h1>
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <div>
              <p className="text-blue-600">✅ Auth Context Working!</p>
              <p>User: {user ? user.name : 'Not logged in'}</p>
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-blue-600 mb-4">Auth Context Error</h1>
          <p className="text-blue-600">{error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      </div>
    );
  }
}
