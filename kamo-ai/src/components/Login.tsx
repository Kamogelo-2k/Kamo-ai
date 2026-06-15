import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { BotMessageSquare } from 'lucide-react';

export function Login() {
  const { currentUser, loginWithGoogle } = useAuth();

  if (currentUser) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center shadow-2xl"
      >
        <div className="w-16 h-16 bg-indigo-600/20 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <BotMessageSquare size={32} />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent mb-2">
          Welcome to Kamo AI
        </h1>
        <p className="text-gray-400 mb-8">
          Your all-in-one modern AI workspace. Log in or sign up to get started.
        </p>
        
        <button
          onClick={loginWithGoogle}
          className="w-full bg-white text-gray-900 hover:bg-gray-100 font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-3 transition-colors"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
          Continue with Google
        </button>
      </motion.div>
    </div>
  );
}
