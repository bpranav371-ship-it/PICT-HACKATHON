import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Copy, 
  Check, 
  Globe, 
  Sparkles, 
  Loader2, 
  ArrowDown, 
  Terminal, 
  BrainCircuit, 
  Mail, 
  Linkedin, 
  MessageSquare 
} from 'lucide-react';

const Typewriter = ({ strings, delay = 40, deleteSpeed = 20 }: { 
  strings: string[], 
  delay?: number, 
  deleteSpeed?: number 
}) => {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [stringIndex, setStringIndex] = useState(0);

  useEffect(() => {
    const currentFullString = strings[stringIndex];
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (currentIndex < currentFullString.length) {
          setDisplayText(currentFullString.substring(0, currentIndex + 1));
          setCurrentIndex(prev => prev + 1);
        } else {
          setTimeout(() => setIsDeleting(true), 1500);
        }
      } else {
        if (currentIndex > 0) {
          setDisplayText(currentFullString.substring(0, currentIndex - 1));
          setCurrentIndex(prev => prev - 1);
        } else {
          setIsDeleting(false);
          setStringIndex((prev) => (prev + 1) % strings.length);
        }
      }
    }, isDeleting ? deleteSpeed : delay);
    return () => clearTimeout(timeout);
  }, [currentIndex, isDeleting, stringIndex, strings, delay, deleteSpeed]);

  return <span>{displayText}<span className="animate-pulse">|</span></span>;
};

// ==========================================
// NEW: DYNAMIC FLOATING NEURAL PATHS
// ==========================================
function FloatingNeuralPaths({ position }: { position: 'top' | 'bottom' }) {
    const isTop = position === 'top';
    
    // Generate 18 interwoven paths per section
    const paths = Array.from({ length: 18 }, (_, i) => {
        // Safe-zone math: Keeps curves strictly at the top 25% or bottom 25%
        const startY = isTop ? 5 + (i * 0.8) : 85 + (i * 0.8);
        const cp1Y   = isTop ? 25 - (i * 1.2) : 100 - (i * 1.2);
        const cp2Y   = isTop ? -5 + (i * 1.5) : 75 + (i * 1.5);
        const endY   = isTop ? 15 + (i * 0.5) : 90 + (i * 0.5);

        // Rich, elegant colors (mostly silver/grey, rare hints of emerald/amber)
        let color = `rgba(255,255,255,${0.1 + (i % 5) * 0.05})`;
        if (i % 7 === 0) color = `rgba(52, 211, 153, ${0.15 + (i % 3) * 0.05})`; // Emerald hint
        if (i % 11 === 0) color = `rgba(251, 191, 36, ${0.1 + (i % 3) * 0.05})`; // Amber hint

        return {
            id: i,
            d: `M-10 ${startY} C 30 ${cp1Y}, 70 ${cp2Y}, 110 ${endY}`,
            color: color,
            width: 0.05 + (i % 4) * 0.03, // Ultra-fine, elegant thicknesses
            duration: 15 + (i % 8) * 2,   // Pseudo-random duration for organic feel
            delay: (i % 5) * 0.8          // Pseudo-random delay
        };
    });

    return (
        <div className="absolute inset-0 pointer-events-none">
            <svg
                className="w-full h-full opacity-80"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                fill="none"
            >
                {paths.map((path) => (
                    <motion.path
                        key={path.id}
                        d={path.d}
                        stroke={path.color}
                        strokeWidth={path.width}
                        strokeLinecap="round"
                        initial={{ pathLength: 0.1, opacity: 0.2 }}
                        animate={{
                            pathLength: 1,
                            opacity: [0.2, 0.8, 0.2],
                            pathOffset: [0, 1, 0],
                        }}
                        transition={{
                            duration: path.duration,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "linear",
                            delay: path.delay,
                        }}
                    />
                ))}
            </svg>
        </div>
    );
}

const BackgroundPaths = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="fixed inset-0 z-0 pointer-events-none bg-[#050505]">
          <FloatingNeuralPaths position="top" />
          <FloatingNeuralPaths position="bottom" />
      </div>
      {children}
    </div>
  );
};
// ==========================================

const SmoothScroll = () => {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => { document.documentElement.style.scrollBehavior = 'auto'; };
  }, []);
  return null;
};

interface ResponseData {
  response: string;
  reply_score: number;
}

interface Results {
  [channel: string]: {
    [tone: string]: ResponseData;
  };
}

export default function App() {
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
    
    let hasShownMatchInCurrentSession = false;
    
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

            if (accumulatedStream.includes("||CONTEXT:MATCH||") && !hasShownMatchInCurrentSession) {
                setContextMatch(true);
                hasShownMatchInCurrentSession = true;
                setTimeout(() => setContextMatch(false), 4000);
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
    <BackgroundPaths className="font-sans text-white min-h-screen bg-[#050505] selection:bg-amber-500/30">
      <SmoothScroll />
      
      <div className="relative z-20 flex flex-col items-center w-full">
        
        {/* KNOWLEDGE REUSE POP-UP */}
        <AnimatePresence>
          {contextMatch && (
            <motion.div 
              initial={{ opacity: 0, y: -20, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
              className="fixed top-12 left-1/2 z-[100] w-full max-w-md px-4 pointer-events-none"
            >
              <div className="bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-2xl p-5 rounded-[2rem] flex items-center gap-4 shadow-2xl shadow-emerald-500/20 pointer-events-auto">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <BrainCircuit className="text-emerald-400 w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-1">Local Pattern Match Active</h4>
                  <p className="text-xs text-neutral-300 leading-tight">Optimizing outreach using patterns from your local history. All processing remains on-device.</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HERO SECTION - SLEEK & BORDERLESS */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center min-h-screen w-full px-4 relative"
        >
          {/* Ambient Glow: Ensures text readability without a hard box */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] max-w-3xl h-[400px] bg-emerald-950/20 blur-[120px] rounded-full pointer-events-none -z-10" />

          <div className="w-full max-w-5xl flex flex-col items-center relative z-10">
            <div className="mb-6 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <Terminal className="w-8 h-8 text-emerald-400" />
            </div>

            <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40 text-center drop-shadow-2xl">
              Outreach AI
            </h1>
            
            {/* The typewriter is kept inside a sleek, dark terminal-like container */}
            <div className="max-w-2xl w-full p-8 rounded-[2rem] bg-[#0a0a0a]/80 border border-white/5 backdrop-blur-xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50" />
              <div className="text-left font-mono text-neutral-400 text-sm md:text-base min-h-[80px]">
                  <span className="text-emerald-500 mr-2">$</span>
                  <span className="text-white">initializing_engine...</span>
                  <br />
                  <span className="text-emerald-500 mr-2">{'>'}</span>
                  <span className="text-neutral-300">
                      <Typewriter
                          strings={[
                              "Generating high-conversion LinkedIn DMs...",
                              "Drafting professional cold emails...",
                              "Creating WhatsApp business messages...",
                              "Analyzing tone and sentiment...",
                              "Optimizing for maximum reply rates..."
                          ]}
                      />
                  </span>
              </div>
            </div>
          </div>

          <motion.div 
             className="absolute bottom-12 cursor-pointer z-10"
             animate={{ y: [0, 10, 0] }} 
             transition={{ repeat: Infinity, duration: 2 }}
             onClick={() => inputRef.current?.scrollIntoView({ behavior: 'smooth' })}
          >
            <ArrowDown className="text-neutral-500 w-8 h-8 hover:text-white transition-colors" />
          </motion.div>
        </motion.div>

        {/* INPUT SECTION */}
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

        {/* OUTPUT SECTION */}
        {(Object.keys(results).length > 0 || loading) && (
            <div ref={resultsRef} className="min-h-screen flex flex-col justify-center w-full max-w-7xl mx-auto px-6 py-20">
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

        <footer className="w-full py-12 border-t border-white/5 mt-auto bg-black/20 backdrop-blur-lg z-10 relative">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-600">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span>System_Status: Live</span>
                </div>
                <div>
                    XENIA • Team Name : SYNEXIS
                </div>
                <div>
                    Local_Engine: Llama 3.2
                </div>
            </div>
        </footer>

      </div>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </BackgroundPaths>
  );
}