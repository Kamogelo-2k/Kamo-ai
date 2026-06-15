import { useState } from 'react';
import { Download, Loader2, Sparkles, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateImage = async () => {
    if (!prompt.trim() || isLoading) return;
    setIsLoading(true);
    setImageUrl(null);

    try {
      const res = await fetch('/api/gemini/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setImageUrl(data.imageUrl);
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Failed to generate image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-950 p-4 md:p-8 max-w-5xl mx-auto w-full">
      <h2 className="text-2xl font-bold text-gray-200 mb-2 flex items-center gap-2">
        <Sparkles className="text-indigo-400" /> Image Generator
      </h2>
      <p className="text-sm text-gray-400 mb-8">
        Describe an image and let AI bring it to life in brilliant high-quality resolution.
      </p>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden focus-within:border-indigo-500 shadow-sm p-1">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                generateImage();
              }
            }}
            placeholder="A lush, futuristic cyberpunk city at sunset with highly detailed reflections, photorealistic..."
            className="w-full bg-transparent p-4 resize-none outline-none text-gray-200 placeholder-gray-500 custom-scrollbar h-24"
            rows={2}
          />
        </div>
        <button
          onClick={generateImage}
          disabled={!prompt.trim() || isLoading}
          className="h-24 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 gap-2 shrink-0"
        >
          {isLoading ? <Loader2 className="animate-spin" size={24} /> : <ImageIcon size={24} />}
          Generate
        </button>
      </div>

      <div className="flex-1 bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-xl flex items-center justify-center relative min-h-[400px]">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 text-indigo-400"
            >
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-t-2 border-indigo-500 animate-spin"></div>
                <div className="absolute inset-2 rounded-full border-b-2 border-purple-500 animate-[spin_2s_linear_infinite]"></div>
              </div>
              <p className="text-sm font-medium animate-pulse">Bringing your idea to life...</p>
            </motion.div>
          ) : imageUrl ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full h-full relative group flex items-center justify-center p-4"
            >
              <img 
                src={imageUrl} 
                alt="Generated output" 
                className="max-w-full max-h-[60vh] object-contain rounded-xl shadow-2xl" 
                referrerPolicy="no-referrer"
              />
              <a
                href={imageUrl}
                download="generated-image.png"
                className="absolute bottom-6 right-6 bg-gray-900/80 backdrop-blur hover:bg-gray-800 text-white p-3 rounded-full shadow-lg transition-transform hover:scale-105"
                title="Download Image"
              >
                <Download size={20} />
              </a>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-gray-600 flex flex-col items-center p-8 text-center max-w-sm"
            >
              <ImageIcon size={48} className="mb-4 opacity-50" />
              <p>Your generated image will appear here.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
