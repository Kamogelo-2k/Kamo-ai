import { Link, useLocation } from 'react-router-dom';
import { 
  MessageSquare, Image, PenTool, GraduationCap, Languages, 
  FileText, CheckSquare, Search, CreditCard, 
  HelpCircle, Settings, LogOut, Plus, X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import { useState } from 'react';

const MENU_ITEMS = [
  { path: '/chat', icon: MessageSquare, label: 'Chatbot' },
  { path: '/image-generator', icon: Image, label: 'Image Generator' },
  { path: '/ai-paraphraser', icon: PenTool, label: 'AI Paraphraser' },
  { path: '/student-helper', icon: GraduationCap, label: 'Student Helper' },
  { path: '/translator', icon: Languages, label: 'Translator' },
  { path: '/summarizer', icon: FileText, label: 'Summarizer' },
  { path: '/grammar-checker', icon: CheckSquare, label: 'Grammar Checker' },
  { path: '/deep-research', icon: Search, label: 'Deep Research' },
];

const BOTTOM_ITEMS = [
  { path: '/plans', icon: CreditCard, label: 'Plans & Pricing' },
  { path: '/help', icon: HelpCircle, label: 'Help Center' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const location = useLocation();
  const { logout, currentUser } = useAuth();
  
  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-full flex-shrink-0 relative">
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
            Kamo AI
          </h1>
          {onClose && (
            <button onClick={onClose} className="md:hidden p-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg">
              <X size={20} />
            </button>
          )}
        </div>
        <Link 
          to="/chat" 
          onClick={onClose}
          className="flex items-center gap-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-lg transition-colors font-medium text-sm"
        >
          <Plus size={18} />
          New Chat
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1 custom-scrollbar">
        {MENU_ITEMS.map((item) => {
          const isActive = location.pathname === item.path || (location.pathname === '/' && item.path === '/chat');
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                isActive 
                  ? "bg-gray-800 text-indigo-400 font-medium" 
                  : "text-gray-400 hover:bg-gray-800/80 hover:text-gray-200"
              )}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="p-2 border-t border-gray-800 space-y-1">
        {BOTTOM_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                isActive 
                  ? "bg-gray-800 text-indigo-400 font-medium" 
                  : "text-gray-400 hover:bg-gray-800/80 hover:text-gray-200"
              )}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm w-full text-left text-gray-400 hover:bg-gray-800/80 hover:text-red-400 transition-colors"
        >
          <LogOut size={18} />
          Sign Out
        </button>
        
        <div className="mt-4 px-3 py-2 flex items-center gap-3">
          {currentUser?.photoURL ? (
            <img src={currentUser.photoURL} alt="Profile" className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
              {currentUser?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-medium truncate text-gray-200">{currentUser?.displayName || 'User'}</span>
            <span className="text-xs text-gray-500 truncate">{currentUser?.email}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
