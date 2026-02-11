import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { BackgroundPaths } from './components/ui/background-paths'; // Fixed relative path
import SmoothScroll from './components/SmoothScroll'; // Fixed relative path & folder location
import { Send, Linkedin, MessageCircle, Copy, Check } from 'lucide-react';

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
  const appRef = useRef<HTMLDivElement>(null);

  const generateOutreach = async () => {
    if (!profileText.trim()) {
      alert("Please paste profile details");
      return;
    }
    
    setLoading(true);
    const channels = ['email', 'linkedin', 'whatsapp'];
    const tones = ['Formal', 'Casual'];
    let tempResults: Results = {};

    try {
      const promises = channels.flatMap(channel => 
        tones.map(async tone => {
          try {
            // Ensure your backend is running on port 8000
            const res = await axios.post('http://127.0.0.1:8000/generate', {
                profile_text: profileText,
                channel,
                tone,
                language
            });
            return { channel, tone, data: res.data };
          } catch (e) {
            console.error(e);
            return { channel, tone, data: { response: "Error generating.", reply_score: 0 }};
          }
        })
      );

      const responses = await Promise.all(promises);
      
      responses.forEach(({ channel, tone, data }) => {
        if (!tempResults[channel]) tempResults[channel] = {};
        tempResults[channel][tone] = data;
      });

      setResults(tempResults);
      
      setTimeout(() => {
        appRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 500);

    } catch (error) {
      console.error("Backend Error", error);
      alert("Failed to connect to backend.");
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
    <BackgroundPaths className="font-sans selection:bg-white/20 text-white">
      {/* SmoothScroll is now correctly placed inside the wrapper */}
      <SmoothScroll />
      
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-full max-w-4xl mx-auto py-20 relative z-20">
          <motion.div
            className="backdrop-blur-xl bg-black/40 border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-white/5 pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative z-10 text-center"
            >
                <div className="inline-block px-4 py-1.5 mb-6 rounded-full border border-white/10 bg-white/5 text-sm text-neutral-400 font-mono">
                  v1.0 • Offline Only
                </div>
                
                <h1 className="text-5xl md:text-8xl font-bold tracking-tighter mb-6 text-white">
                  Outreach AI
                </h1>
                
                <p className="text-xl text-neutral-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                  Generate highly personalized messages for Email, LinkedIn, and WhatsApp. 
                  <span className="text-white font-medium"> Zero data leaves your device.</span>
                </p>

                <div className="flex flex-wrap justify-center gap-4 mb-12">
                  {[
                    { icon: Send, label: 'Email' },
                    { icon: Linkedin, label: 'LinkedIn' },
                    { icon: MessageCircle, label: 'WhatsApp' }
                  ].map((item, idx) => (
                    <motion.div
                      key={idx}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 border border-white/5 text-neutral-300"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + idx * 0.1 }}
                    >
                      <item.icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </motion.div>
                  ))}
                </div>

                <a
                  href="#app"
                  className="group relative inline-flex items-center justify-center px-8 py-4 font-semibold text-black transition-all duration-200 bg-white font-lg rounded-xl hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white focus:ring-offset-black"
                >
                  Start Generating
                  <div className="absolute inset-0 rounded-xl ring-2 ring-white/20 group-hover:ring-white/40 transition-all" />
                </a>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <section id="app" ref={appRef} className="py-24 px-4 border-t border-white/10 backdrop-blur-sm bg-black/30">
        <div className="max-w-7xl mx-auto relative z-10">
          
          <div className="grid lg:grid-cols-2 gap-8">
            
            <motion.div
              className="bg-neutral-900/50 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-sm"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 text-sm">1</span>
                Input Details
              </h3>
              
              <textarea
                className="w-full h-80 p-5 bg-black border border-white/10 rounded-xl text-neutral-300 focus:border-white/30 focus:ring-1 focus:ring-white/30 outline-none resize-none placeholder-neutral-600 transition-all font-mono text-sm leading-relaxed"
                placeholder="// Paste LinkedIn Bio, Resume, or Job Description here..."
                value={profileText}
                onChange={(e) => setProfileText(e.target.value)}
              />

              <div className="mt-6 flex items-center justify-between gap-4">
                <div className="flex-1">
                   <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Language</label>
                   <select 
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-white/30 outline-none appearance-none"
                   >
                      <option>English</option>
                      <option>Hindi</option>
                      <option>Hinglish</option>
                   </select>
                </div>
                
                <button
                  onClick={generateOutreach}
                  disabled={loading}
                  className="flex-1 mt-6 h-[46px] bg-white text-black font-bold rounded-lg hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {loading ? 'Processing...' : 'Generate Messages'}
                </button>
              </div>
            </motion.div>

            <motion.div
              className="bg-neutral-900/50 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-sm flex flex-col h-[600px]"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 text-sm">2</span>
                Results
              </h3>

              {Object.keys(results).length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-neutral-600 border border-dashed border-white/10 rounded-xl bg-black/50">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <Send className="w-6 h-6 text-neutral-500" />
                  </div>
                  <p className="font-mono text-sm">Waiting for input...</p>
                </div>
              ) : (
                <div className="flex flex-col h-full">
                  <div className="flex p-1 bg-black border border-white/10 rounded-lg mb-6">
                    {['email', 'linkedin', 'whatsapp'].map((channel) => (
                      <button
                        key={channel}
                        onClick={() => setActiveChannel(channel)}
                        className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                          activeChannel === channel
                            ? 'bg-neutral-800 text-white shadow-sm'
                            : 'text-neutral-500 hover:text-neutral-300'
                        }`}
                      >
                          {channel.charAt(0).toUpperCase() + channel.slice(1)}
                      </button>
                    ))}
                  </div>

                  <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                      {results[activeChannel] && Object.entries(results[activeChannel]).map(([tone, data]) => (
                        <div key={tone} className="group relative bg-black border border-white/10 p-6 rounded-xl hover:border-white/20 transition-all">
                           <div className="flex justify-between items-center mb-4">
                              <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">{tone}</span>
                              <div className="flex items-center gap-2 px-2 py-1 bg-white/5 rounded">
                                 <div className={`w-1.5 h-1.5 rounded-full ${data.reply_score > 70 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                 <span className="text-xs font-mono text-neutral-400">{data.reply_score}% prob</span>
                              </div>
                           </div>
                           
                           <p className="text-neutral-300 text-sm leading-7 whitespace-pre-wrap font-sans">{data.response}</p>
                           
                           <button 
                             onClick={() => handleCopy(data.response)}
                             className="absolute top-4 right-4 p-2 text-neutral-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                             title="Copy to clipboard"
                           >
                             {copied === data.response ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                           </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 py-8 text-center text-neutral-600 text-sm font-mono backdrop-blur-md bg-black/80">
        <p>OFFLINE SYSTEM • DO NOT DISTRIBUTE</p>
      </footer>
    </BackgroundPaths>
  );
};

export default App;