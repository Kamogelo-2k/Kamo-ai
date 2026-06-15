import { useState, useRef, useEffect } from 'react';
import { Send, FileImage, Paperclip, Mic, StopCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Markdown from 'react-markdown';

export function Chatbot() {
  const [messages, setMessages] = useState<{role: 'user' | 'ai', content: string, image?: string}[]>([]);
  const [input, setInput] = useState('');
  const [interimResult, setInterimResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imagePayload, setImagePayload] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Speech recognition
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setInput(prev => (prev + ' ' + finalTranscript).trim());
        }
        setInterimResult(interimTranscript);
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
        setInterimResult('');
        if (event.error === 'network') {
          setSpeechError('Speech recognition requires an internet connection to the speech service. Voice typing may not be supported in this browser.');
        } else if (event.error === 'not-allowed') {
          setSpeechError('Microphone access was denied. Please allow microphone access to use voice typing.');
        } else {
          setSpeechError(`Speech recognition error: ${event.error}`);
        }
        setTimeout(() => setSpeechError(''), 5000);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
        setInterimResult('');
      };
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      setInterimResult('');
      recognitionRef.current?.start();
    }
    setIsRecording(!isRecording);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePayload(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const sendMessage = async () => {
    const combinedInput = (input + ' ' + interimResult).trim();
    if ((!combinedInput && !imagePayload) || isLoading) return;
    
    const userMsg = combinedInput;
    const payloadImage = imagePayload;
    
    setMessages(prev => [...prev, { role: 'user', content: userMsg, image: payloadImage || undefined }]);
    setInput('');
    setInterimResult('');
    setImagePayload(null);
    setIsLoading(true);

    try {
      // In a real progressive stream, we'd use Server-Sent Events or WebSockets.
      // For simplicity, we just do a fetch to our shared /api/gemini/generate.
      const res = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: userMsg || "Please describe this image.",
          imageBase64: payloadImage,
          model: 'gemini-1.5-flash',
          systemInstruction: "You are Kamo AI, a highly capable, helpful, and modern AI assistant created by Kamogelo Mokgata. Always provide fast, accurate, and concise responses."
        })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setMessages(prev => [...prev, { role: 'ai', content: data.text }]);
    } catch (error: any) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'ai', content: error.message || 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-950">
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 max-w-2xl mx-auto">
            <h2 className="text-3xl font-semibold mb-4 text-gray-200">How can I help you today?</h2>
            <p className="text-gray-500 mb-8">Send a message, upload an image, or use voice typing to get started with Kamo AI.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              {["Write an email to a client", "Help me understand quantum physics", "Summarize an article for me", "Translate English to French"].map((suggestion, i) => (
                <button 
                  key={i} 
                  onClick={() => setInput(suggestion)}
                  className="bg-gray-900 border border-gray-800 p-4 rounded-xl text-left hover:bg-gray-800 transition-colors text-sm text-gray-300"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto w-full space-y-6 pb-20">
            {messages.map((msg, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={idx} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-none' 
                    : 'bg-gray-900 border border-gray-800 text-gray-200 rounded-bl-none'
                }`}>
                  {msg.image && (
                    <img src={msg.image} alt="User upload" className="max-w-full rounded-lg mb-3 object-contain max-h-60" />
                  )}
                  <div className="prose prose-invert max-w-none prose-sm md:prose-base leading-relaxed">
                    <Markdown>{msg.content}</Markdown>
                  </div>
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl p-4 bg-gray-900 border border-gray-800 rounded-bl-none flex items-center space-x-3 text-gray-400">
                  <div className="flex space-x-1">
                    <motion.div
                      className="w-2 h-2 bg-indigo-500 rounded-full"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-indigo-500 rounded-full"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-indigo-500 rounded-full"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                    />
                  </div>
                  <span className="text-sm font-medium">Kamo AI is thinking...</span>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="p-4 bg-gray-950 border-t border-gray-800">
        <div className="max-w-3xl mx-auto flex flex-col items-center">
          {imagePayload && (
            <div className="w-full mb-3 flex items-center">
              <div className="relative inline-block">
                <img src={imagePayload} alt="Preview" className="h-16 w-16 object-cover rounded-lg border border-gray-700" />
                <button 
                  onClick={() => setImagePayload(null)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow"
                >
                  &times;
                </button>
              </div>
            </div>
          )}
          <div className="relative w-full bg-gray-900 rounded-2xl border border-gray-800 shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all flex items-end p-2 pl-4">
            <textarea
              value={(input + (interimResult ? ' ' + interimResult : '')).trimStart()}
              onChange={(e) => {
                setInput(e.target.value);
                setInterimResult('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Message Kamo AI..."
              className="flex-1 max-h-32 min-h-[44px] bg-transparent resize-none outline-none py-3 text-gray-200 placeholder-gray-500 custom-scrollbar"
              rows={1}
            />
            <div className="flex items-center space-x-1 pb-1">
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-gray-800 rounded-xl transition-colors"
                title="Attach Image"
              >
                <FileImage size={20} />
              </button>
              <button 
                onClick={toggleRecording}
                className={`p-2 rounded-xl transition-colors ${isRecording ? 'text-red-400 bg-red-400/10' : 'text-gray-400 hover:text-indigo-400 hover:bg-gray-800'}`}
                title="Voice Input"
              >
                {isRecording ? <StopCircle size={20} className="animate-pulse" /> : <Mic size={20} />}
              </button>
              <button 
                onClick={sendMessage}
                disabled={(!(input + interimResult).trim() && !imagePayload) || isLoading}
                className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors ml-2"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
          {speechError && (
             <div className="text-xs text-red-400 mt-2 text-center">
               {speechError}
             </div>
          )}
          <div className="text-xs text-gray-600 mt-2 text-center">
            Kamo AI can make mistakes. Consider verifying important information.
          </div>
        </div>
      </div>
    </div>
  );
}
