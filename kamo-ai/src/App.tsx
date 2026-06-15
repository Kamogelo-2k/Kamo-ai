/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { Login } from './components/Login';
import { Chatbot } from './components/Chatbot';
import { ImageGenerator } from './components/ImageGenerator';
import { TextTool } from './components/TextTool';

const Paraphraser = () => <TextTool title="AI Paraphraser" placeholder="Paste text here to paraphrase..." actionButtonText="Paraphrase" systemPrompt="You are an expert editor. Rewrite the following text to improve its flow, clarity, and tone while retaining its original meaning. Provide ONLY the rewritten text without conversational filler." />;
const StudentHelper = () => <TextTool title="Student Helper" placeholder="Ask a question or paste your assignment here..." actionButtonText="Analyze & Help" systemPrompt="You are a brilliant, patient tutor. Provide step-by-step guidance, explanations, and insightful feedback to help the student learn. Do NOT just give the final answer." />;
const Translator = () => <TextTool title="Translator" placeholder="Paste text and specify the target language (e.g., 'Translate to French: Hello')..." actionButtonText="Translate" systemPrompt="You are a professional translator. Translate the provided text accurately to the target language requested. Return ONLY the translated text, preserving formatting where possible." />;
const Summarizer = () => <TextTool title="Summarizer" placeholder="Paste a long article or document here to summarize it..." actionButtonText="Summarize" systemPrompt="You are an expert summarizer. Extract the key points, main arguments, and conclusions from the text. Format the output with clear bullet points for easy reading." />;
const GrammarChecker = () => <TextTool title="Grammar Checker" placeholder="Paste your text here to check for grammar, spelling, and punctuation errors..." actionButtonText="Check Grammar" systemPrompt="You are an expert proofreader. Correct any grammar, spelling, and punctuation errors in the provided text. Explain briefly at the bottom what changes were made. Be extremely precise." />;
const DeepResearch = () => <TextTool title="Deep Research" placeholder="What complex topic would you like to research deeply?" actionButtonText="Research" systemPrompt="You are a world-class researcher. Provide a comprehensive, long-form, highly detailed answer to the prompt. Include historical context, multiple perspectives, and reliable citations/references styled cleanly in markdown." model="gemini-1.5-flash" />;

const PlaceholderView = ({ title }: { title: string }) => (
  <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-950 text-gray-400">
    <h2 className="text-2xl font-bold mb-2 text-gray-200">{title}</h2>
    <p>This section is under construction.</p>
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/chat" replace />} />
            <Route path="/chat" element={<Chatbot />} />
            <Route path="/image-generator" element={<ImageGenerator />} />
            <Route path="/ai-paraphraser" element={<Paraphraser />} />
            <Route path="/student-helper" element={<StudentHelper />} />
            <Route path="/translator" element={<Translator />} />
            <Route path="/summarizer" element={<Summarizer />} />
            <Route path="/grammar-checker" element={<GrammarChecker />} />
            <Route path="/deep-research" element={<DeepResearch />} />
            <Route path="/plans" element={<PlaceholderView title="Plans & Pricing" />} />
            <Route path="/help" element={<PlaceholderView title="Help Center" />} />
            <Route path="/settings" element={<PlaceholderView title="Settings" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
