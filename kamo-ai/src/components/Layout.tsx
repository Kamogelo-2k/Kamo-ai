import { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sidebar } from './Sidebar';
import { Menu, X } from 'lucide-react';

export function Layout() {
  const { currentUser, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 font-sans overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar Wrapper */}
      <div className={`fixed inset-y-0 left-0 z-50 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 flex`}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      <main className="flex-1 overflow-hidden relative flex flex-col w-full h-full">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center p-4 border-b border-gray-800 bg-gray-900">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>
          <span className="ml-4 font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
            Kamo AI
          </span>
        </header>

        <div className="flex-1 overflow-y-auto relative custom-scrollbar">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
