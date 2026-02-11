import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BackgroundPaths } from './components/ui/background-paths';
import SmoothScroll from './components/SmoothScroll';
import Typewriter from 'typewriter-effect';
import { Copy, Check, Globe, Sparkles, Loader2, ArrowDown, Terminal, BrainCircuit } from 'lucide-react';

interface ResponseData {
  response: string;
  reply_score: number;
}

interface Results {
  [channel: string]: {
    [tone: string]: ResponseData;
  };
}

const App: React.FC = () => {
  const [profileText, setProfileText] = useState('');
  const [language, setLanguage] = useState('English');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Results>({});
  const [activeChannel, setActiveChannel] = useState('email');
  const [copied, setCopied] = useState<string | null>(null);
  const [contextMatch, setContextMatch] = useState(false);
  
  const inputRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const generateOutreach = async () => {
    if (!profileText.trim()) return;
    
    setLoading(true);
    setResults({}); 
    setContextMatch(false);
    
    setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);

    const channels = ['email', 'linkedin', 'whatsapp'];
    const tones = ['Formal', 'Casual'];

    try {
      for (const channel of channels) {
        for (const tone of tones) {
          const response = await fetch('http://127.0.0.1:8000/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ profile_text: profileText, channel, tone, language }),
          });

          const reader = response.body?.getReader();
          const decoder = new TextDecoder();
          let accumulatedStream = "";

          if (!reader) continue;

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            accumulatedStream += chunk;

            if (accumulatedStream.includes("||CONTEXT:MATCH||")) {
                setContextMatch(true);
            }

            const parts = accumulatedStream.split("||SCORE:");
            let cleanText = parts[0].replace("||CONTEXT:MATCH||", ""); 
            
            let extractedScore = 0;
            if (parts.length > 1) {
                extractedScore = parseInt(parts[1].replace("||", "")) || 0;
            }

            setResults(prev => ({
              ...prev,
              [channel]: {
                ...prev[channel],
                [tone]: { 
                    response: cleanText, 
                    reply_score: extractedScore 
                } 
              }
            }));
          }
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <BackgroundPaths className="font-sans text-white min-h-screen selection:bg-amber-500/30">
      <SmoothScroll />
      
      <div className="relative z-20 flex flex-col items-center w-full">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center min-h-screen text-center px-4 relative"
        >
          <div className="mb-8 p-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-md animate-pulse">
            <Terminal className="w-6 h-6 text-emerald-400" />
          </div>

          <h1 className="text-7xl md:text-9xl font-bold tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40">
            Outreach AI
          </h1>
          
          <div className="max-w-2xl w-full mt-8 p-8 rounded-3xl bg-black/40 border border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50" />
            <div className="text-left font-mono text-neutral-400 text-sm md:text-base min-h-[80px]">
                <span className="text-emerald-500 mr-2">$</span>
                <span className="text-white">initializing_engine...</span>
                <br />
                <span className="text-emerald-500 mr-2">{'>'}</span>
                <span className="text-neutral-300">
                    <Typewriter
                        options={{
                            strings: [
                                "Generating high-conversion LinkedIn DMs...",
                                "Drafting professional cold emails...",
                                "Creating WhatsApp business messages...",
                                "Analyzing tone and sentiment...",
                                "Optimizing for maximum reply rates..."
                            ],
                            autoStart: true,
                            loop: true,
                            delay: 40,
                            deleteSpeed: 20,
                        }}
                    />
                </span>
            </div>
          </div>

          <motion.div 
             className="absolute bottom-12 cursor-pointer"
             animate={{ y: [0, 10, 0] }} 
             transition={{ repeat: Infinity, duration: 2 }}
             onClick={() => inputRef.current?.scrollIntoView({ behavior: 'smooth' })}
          >
            <ArrowDown className="text-neutral-500 w-8 h-8 hover:text-white transition-colors" />
          </motion.div>
        </motion.div>

        <div ref={inputRef} className="min-h-screen flex items-center justify-center w-full p-4">
            <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, amount: 0.3 }}
            className="w-full max-w-5xl"
            >
            <div className="backdrop-blur-3xl bg-neutral-900/40 border border-white/10 rounded-[3rem] p-8 md:p-14 shadow-2xl relative">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl" />

                <h2 className="text-4xl font-bold mb-10 flex items-center gap-5 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center text-lg font-black shadow-lg">01</div>
                <span className="tracking-tight">Input Intelligence</span>
                </h2>

                <div className="bg-black/50 p-8 rounded-[2rem] border border-white/5 mb-8 relative z-10 hover:border-white/10 transition-colors">
                <textarea
                    className="w-full h-64 bg-transparent text-neutral-200 outline-none resize-none placeholder-neutral-700 font-mono text-base leading-relaxed scrollbar-hide"
                    placeholder="// Paste LinkedIn Bio, Resume, or Job Description here to begin scan..."
                    value={profileText}
                    onChange={(e) => setProfileText(e.target.value)}
                />
                <div className="flex flex-col md:flex-row items-center justify-between mt-6 pt-6 border-t border-white/5 gap-4">
                    <div className="flex items-center gap-4">
                    <Globe className="w-5 h-5 text-neutral-600" />
                    <div className="flex bg-neutral-900 p-1.5 rounded-xl border border-white/10">
                        {['English', 'Hindi', 'Hinglish'].map((lang) => (
                        <button
                            key={lang}
                            onClick={() => setLanguage(lang)}
                            className={`px-6 py-2 rounded-lg text-[11px] font-black uppercase tracking-[0.15em] transition-all ${
                            language === lang ? 'bg-white text-black shadow-lg' : 'text-neutral-600 hover:text-white'
                            }`}
                        >
                            {lang}
                        </button>
                        ))}
                    </div>
                    </div>
                    <div className="text-[10px] font-mono text-neutral-600 tracking-widest uppercase">
                        Model: Llama 3.2 (3B) • Local
                    </div>
                </div>
                </div>

                <button
                onClick={generateOutreach}
                disabled={loading}
                className="relative z-10 w-full py-6 bg-white text-black font-black rounded-2xl transition-all flex items-center justify-center gap-4 text-xl uppercase tracking-[0.2em] hover:bg-neutral-200 hover:scale-[1.01] active:scale-[0.99]"
                >
                {loading ? <Loader2 className="animate-spin w-6 h-6" /> : "🚀 Initialize Generation"}
                </button>
            </div>
            </motion.div>
        </div>

        {(Object.keys(results).length > 0 || loading) && (
            <div ref={resultsRef} className="min-h-screen flex flex-col justify-center w-full max-w-7xl mx-auto px-6 py-20">
            <AnimatePresence>
                {contextMatch && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4"
                    >
                        <div className="bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-xl p-4 rounded-2xl flex items-center gap-4 shadow-2xl shadow-emerald-500/10">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                <BrainCircuit className="text-emerald-400 w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1">Local Pattern Match Active</h4>
                                <p className="text-xs text-neutral-300 leading-tight">Optimizing outreach using patterns from your local history. All processing remains on-device.</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.1 }}
                    className="w-full"
                >
                    <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8 border-b border-white/10 pb-8">
                    <h2 className="text-5xl font-bold flex items-center gap-5">
                        <Sparkles className="text-amber-400 w-12 h-12" /> 
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-500">
                            Neural Output
                        </span>
                    </h2>
                    
                    <div className="flex p-2 bg-black/50 border border-white/10 rounded-2xl backdrop-blur-md">
                        {['email', 'linkedin', 'whatsapp'].map((channel) => (
                        <button
                            key={channel}
                            onClick={() => setActiveChannel(channel)}
                            className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                            activeChannel === channel ? 'bg-white text-black shadow-xl' : 'text-neutral-500 hover:text-white'
                            }`}
                        >
                            {channel}
                        </button>
                        ))}
                    </div>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-10">
                    {['Formal', 'Casual'].map((tone) => {
                        const data = results[activeChannel]?.[tone];
                        const showCard = data || loading;
                        if (!showCard) return null;

                        return (
                        <motion.div 
                            key={tone} 
                            initial={{ opacity: 0, x: tone === 'Formal' ? -30 : 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: false }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="bg-neutral-900/60 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 relative overflow-hidden group"
                        >
                            <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${tone === 'Formal' ? 'bg-blue-400' : 'bg-purple-400'}`} />
                                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-neutral-400">{tone} Layer</span>
                            </div>
                            
                            <div className={`px-4 py-1.5 rounded-full border flex items-center gap-3 transition-all ${
                                data?.reply_score ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 border-white/5'
                            }`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${data?.reply_score ? 'bg-emerald-500' : 'bg-neutral-500 animate-pulse'}`} />
                                <span className={`text-[10px] font-mono ${data?.reply_score ? 'text-emerald-400' : 'text-neutral-500'}`}>
                                    {data?.reply_score ? `PROBABILITY: ${data.reply_score}%` : 'CALCULATING...'}
                                </span>
                            </div>
                            </div>

                            <div className="min-h-[300px] text-neutral-200 text-lg leading-loose font-sans whitespace-pre-wrap">
                            {data?.response ? (
                                data.response
                            ) : (
                                <div className="flex flex-col gap-4 mt-12 opacity-50">
                                    <div className="h-4 bg-white/10 rounded w-3/4 animate-pulse" />
                                    <div className="h-4 bg-white/10 rounded w-full animate-pulse delay-75" />
                                    <div className="h-4 bg-white/10 rounded w-5/6 animate-pulse delay-150" />
                                </div>
                            )}
                            </div>

                            {data?.response && (
                            <button 
                                onClick={() => handleCopy(data.response)}
                                className="mt-8 w-full py-4 flex items-center justify-center gap-3 text-[10px] font-black tracking-[0.3em] text-neutral-400 hover:text-white hover:bg-white/5 transition-all rounded-xl border border-white/5 hover:border-white/20"
                            >
                                {copied === data.response ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                {copied === data.response ? 'COPIED_TO_CLIPBOARD' : 'COPY_OUTPUT'}
                            </button>
                            )}
                        </motion.div>
                        );
                    })}
                    </div>
                </motion.div>
            </AnimatePresence>
            </div>
        )}

        <footer className="w-full py-12 border-t border-white/5 mt-auto bg-black/20 backdrop-blur-lg">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-600">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span>System_Status: Live</span>
                </div>
                <div>
                    PICT Revelation 2K26 • Team Name: Synexis
                </div>
                <div>
                    Local_Engine: Llama 3.2
                </div>
            </div>
        </footer>

      </div>
    </BackgroundPaths>
  );
};

export default App;