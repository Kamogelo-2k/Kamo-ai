import { useState } from 'react';
import { Send, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import Markdown from 'react-markdown';

export function TextTool({ title, placeholder, actionButtonText, systemPrompt, model = "gemini-1.5-flash" }: { title: string, placeholder: string, actionButtonText: string, systemPrompt: string, model?: string }) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleAction = async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    setOutput('');
    
    try {
      const res = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: input,
          model,
          systemInstruction: systemPrompt
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setOutput(data.text);
    } catch (error: any) {
      console.error(error);
      setOutput(error.message || 'An error occurred while generating the response.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-gray-950 p-4 md:p-8 max-w-4xl mx-auto w-full">
      <h2 className="text-2xl font-bold text-gray-200 mb-6">{title}</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[400px]">
        <div className="flex flex-col h-full bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden focus-within:border-indigo-500 transition-colors shadow-sm">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            className="flex-1 w-full bg-transparent p-4 resize-none outline-none text-gray-200 placeholder-gray-500 custom-scrollbar"
          />
          <div className="p-3 border-t border-gray-800 flex justify-end bg-gray-900/50">
            <button
              onClick={handleAction}
              disabled={!input.trim() || isLoading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:hover:bg-indigo-600 flex items-center gap-2 text-sm text-center"
            >
              {isLoading ? (
                 <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
              ) : (
                <Send size={16} />
              )}
              {actionButtonText}
            </button>
          </div>
        </div>

        <div className="flex flex-col h-full bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-sm relative">
          {output ? (
            <div className="flex flex-col h-full">
              <div className="flex-1 p-4 overflow-y-auto text-gray-200 text-sm custom-scrollbar">
                <div className="prose prose-invert max-w-none prose-sm sm:prose-base prose-indigo">
                  <Markdown>{output}</Markdown>
                </div>
              </div>
              <div className="p-3 border-t border-gray-800 flex justify-end bg-gray-900/50">
                <button
                  onClick={copyToClipboard}
                  className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors flex items-center gap-2 text-sm"
                >
                  {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-600 p-8 text-center">
              Output will appear here once generated.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
