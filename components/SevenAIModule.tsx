import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { Send, Mic, Bot, Sparkles, Loader2, StopCircle, User, Volume2, Waves } from 'lucide-react';
import { ChatMessage } from '../types';
import { SEVEN_AI_SYSTEM_INSTRUCTION } from '../constants';
import { decodeAudioData, resampleTo16kHZ } from '../services/audioUtils';

// Helper for Base64 encoding
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

const SevenAIModule: React.FC = () => {
  const [mode, setMode] = useState<'text' | 'live'>('text');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Refs for Live API & Audio
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const scheduledSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const chatSessionRef = useRef<any>(null);

  // Refs for Visualizer
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Text Chat
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 'init',
        role: 'model',
        text: 'السلام عليكم ورحمة الله وبركاته. أنا معلمك sevenAI. كيف يمكنني مساعدتك اليوم في رحلتك التعليمية؟',
        timestamp: new Date()
      }]);
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnectLiveSession();
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  // --- Visualizer Logic ---
  const startVisualizer = (ctx: AudioContext, source: AudioNode) => {
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 64; // Fewer bars for cleaner look
    source.connect(analyser);
    analyserRef.current = analyser;

    const draw = () => {
      if (!canvasRef.current || !analyserRef.current) return;
      const canvas = canvasRef.current;
      const canvasCtx = canvas.getContext('2d');
      if (!canvasCtx) return;

      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserRef.current.getByteFrequencyData(dataArray);

      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 1.5;
      let x = (canvas.width - (barWidth * bufferLength)) / 2; // Center it

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.8;
        
        // Gradient color
        const gradient = canvasCtx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
        gradient.addColorStop(0, '#10b981'); // Emerald 500
        gradient.addColorStop(1, '#34d399'); // Emerald 400

        canvasCtx.fillStyle = gradient;
        
        // Rounded pills
        const radius = barWidth / 2;
        canvasCtx.beginPath();
        canvasCtx.roundRect(x, (canvas.height - barHeight) / 2, barWidth - 2, barHeight || 4, radius);
        canvasCtx.fill();

        x += barWidth;
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };
    draw();
  };

  // --- Live API Handlers ---
  const startLiveSession = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContext({ sampleRate: 24000 });
      
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }
      
      audioContextRef.current = audioCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const source = audioCtx.createMediaStreamSource(stream);
      sourceNodeRef.current = source;

      startVisualizer(audioCtx, source);

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: SEVEN_AI_SYSTEM_INSTRUCTION,
        },
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            setIsProcessing(false);
            
            const processor = audioCtx.createScriptProcessor(4096, 1, 1);
            processor.onaudioprocess = async (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcm16 = await resampleTo16kHZ(inputData, e.inputBuffer.sampleRate);
              const base64 = arrayBufferToBase64(pcm16.buffer);
              
              sessionPromise.then(session => {
                session.sendRealtimeInput({
                  media: {
                    mimeType: 'audio/pcm;rate=16000',
                    data: base64
                  }
                });
              });
            };
            
            source.connect(processor);
            processor.connect(audioCtx.destination);
            processorRef.current = processor;
          },
          onmessage: async (msg: LiveServerMessage) => {
            const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData) {
              const binary = atob(audioData);
              const bytes = new Uint8Array(binary.length);
              for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
              
              const buffer = await decodeAudioData(bytes, audioCtx, 24000, 1);
              
              const audioSource = audioCtx.createBufferSource();
              audioSource.buffer = buffer;
              audioSource.connect(audioCtx.destination);
              
              const startTime = Math.max(audioCtx.currentTime, nextStartTimeRef.current);
              audioSource.start(startTime);
              nextStartTimeRef.current = startTime + buffer.duration;
              
              scheduledSourcesRef.current.push(audioSource);
              audioSource.onended = () => {
                 const idx = scheduledSourcesRef.current.indexOf(audioSource);
                 if(idx > -1) scheduledSourcesRef.current.splice(idx, 1);
              };
            }

            if (msg.serverContent?.interrupted) {
              scheduledSourcesRef.current.forEach(s => s.stop());
              scheduledSourcesRef.current = [];
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => {
            setIsConnected(false);
            disconnectLiveSession();
          },
          onerror: (e) => {
            console.error(e);
            setError("حدث خطأ في الاتصال");
            disconnectLiveSession();
          }
        }
      });
      sessionPromiseRef.current = sessionPromise;

    } catch (err) {
      console.error(err);
      setError("تعذر الوصول للميكروفون");
      setIsProcessing(false);
    }
  };

  const disconnectLiveSession = () => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current.onaudioprocess = null;
    }
    if (sourceNodeRef.current) sourceNodeRef.current.disconnect();
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    if (audioContextRef.current) audioContextRef.current.close();
    
    setIsConnected(false);
    setIsProcessing(false);
    cancelAnimationFrame(animationFrameRef.current);
  };

  // --- Text Chat Logic ---
  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsProcessing(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      if (!chatSessionRef.current) {
         chatSessionRef.current = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: { systemInstruction: SEVEN_AI_SYSTEM_INSTRUCTION }
         });
      }

      const result = await chatSessionRef.current.sendMessage({ message: userMsg.text });
      
      const modelMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: result.text,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, modelMsg]);
    } catch (e) {
      setError("حدث خطأ أثناء المعالجة");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white/50 backdrop-blur-sm relative overflow-hidden rounded-xl border border-white/40 shadow-sm">
       {/* Header / Mode Switcher */}
       <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white/80 backdrop-blur-md z-10 sticky top-0">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                <Bot size={28} />
             </div>
             <div>
                <h2 className="font-bold text-gray-800 text-lg">SevenAI المعلم</h2>
                <div className="flex items-center gap-1.5">
                   <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-red-500 animate-ping' : 'bg-emerald-500'}`}></span>
                   <span className="text-xs text-gray-500 font-medium">{isConnected ? 'مباشر (Live)' : 'جاهز للمساعدة'}</span>
                </div>
             </div>
          </div>
          
          <div className="bg-gray-100 p-1.5 rounded-xl flex items-center">
             <button 
               onClick={() => { disconnectLiveSession(); setMode('text'); }}
               className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'text' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
             >
               محادثة
             </button>
             <button 
               onClick={() => { setMode('live'); }}
               className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${mode === 'live' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
             >
               <Mic size={16} />
               صوت
             </button>
          </div>
       </div>

       {/* Main Content Area */}
       <div className="flex-1 overflow-hidden relative">
          
          {/* Text Mode View */}
          {mode === 'text' && (
             <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8 scrollbar-thin">
                   {messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-4 fade-in duration-500`}>
                         <div className={`flex gap-4 max-w-[85%] lg:max-w-[70%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm ${msg.role === 'user' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                               {msg.role === 'user' ? <User size={20} /> : <Sparkles size={20} />}
                            </div>
                            <div className={`p-5 rounded-2xl shadow-sm relative ${
                               msg.role === 'user' 
                               ? 'bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-tr-sm' 
                               : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm'
                            }`}>
                               <p className="whitespace-pre-wrap leading-relaxed text-base">{msg.text}</p>
                               <span className={`text-[10px] mt-2 block opacity-70 text-right ${msg.role === 'user' ? 'text-emerald-100' : 'text-gray-400'}`}>
                                  {msg.timestamp.toLocaleTimeString('ar-SA', { hour: '2-digit', minute:'2-digit' })}
                               </span>
                            </div>
                         </div>
                      </div>
                   ))}
                   <div ref={messagesEndRef} />
                </div>
                
                {/* Input Area */}
                <div className="p-4 bg-white border-t border-gray-100">
                   <div className="flex gap-3 max-w-4xl mx-auto">
                      <div className="flex-1 relative">
                        <input 
                          type="text" 
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                          placeholder="اكتب سؤالك هنا..."
                          disabled={isProcessing}
                          className="w-full bg-gray-50 border-gray-200 border rounded-2xl pl-4 pr-6 py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition disabled:opacity-50 text-base"
                        />
                      </div>
                      <button 
                        onClick={handleSendMessage}
                        disabled={isProcessing || !inputText.trim()}
                        className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white rounded-2xl w-14 flex items-center justify-center transition-all shadow-lg shadow-emerald-200"
                      >
                         {isProcessing ? <Loader2 className="animate-spin" /> : <Send size={22} className="ml-1" />}
                      </button>
                   </div>
                </div>
             </div>
          )}

          {/* Live Mode View */}
          {mode === 'live' && (
             <div className="h-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-gray-50/50 to-white/50">
                
                {/* Visualizer Container */}
                <div className="relative w-full max-w-md aspect-video bg-white rounded-[40px] mb-8 overflow-hidden flex items-center justify-center border border-gray-100 shadow-2xl shadow-emerald-100/50 ring-8 ring-white">
                   {isConnected ? (
                      <canvas ref={canvasRef} width="600" height="300" className="w-full h-full opacity-80" />
                   ) : (
                      <div className="text-gray-300 flex flex-col items-center">
                         <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4 animate-pulse">
                            <Waves size={40} />
                         </div>
                         <p className="font-bold">المؤثرات الصوتية ستظهر هنا</p>
                      </div>
                   )}
                   
                   {/* Status Badge */}
                   <div className={`absolute top-6 left-6 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm border border-gray-100 flex items-center gap-2 transition-all ${isConnected ? 'bg-red-50 text-red-500 border-red-100' : 'bg-gray-50 text-gray-500'}`}>
                      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}></div>
                      {isConnected ? 'متصل بالخوادم' : 'غير متصل'}
                   </div>
                </div>

                {/* Main Controls */}
                <div className="text-center space-y-8 relative z-10">
                   <div>
                     <h3 className="text-3xl font-bold text-gray-800 mb-2">
                        {isConnected ? 'أنا أستمع إليك...' : 'اضغط للبدء'}
                     </h3>
                     <p className="text-gray-500 max-w-xs mx-auto text-sm">
                        تحدث بحرية تامة، سأقوم بالرد عليك صوتياً مباشرة.
                     </p>
                   </div>

                   <div className="relative inline-block">
                     {isConnected && (
                       <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-20"></span>
                     )}
                     <button
                       onClick={isConnected ? disconnectLiveSession : startLiveSession}
                       disabled={isProcessing && !isConnected}
                       className={`w-24 h-24 rounded-full flex items-center justify-center shadow-xl transition-all duration-500 transform hover:scale-105 active:scale-95 ${
                          isConnected 
                          ? 'bg-red-500 hover:bg-red-600 text-white ring-8 ring-red-50' 
                          : 'bg-gradient-to-br from-emerald-500 to-teal-600 hover:shadow-emerald-300 text-white ring-8 ring-emerald-50'
                       }`}
                     >
                        {isProcessing && !isConnected ? (
                           <Loader2 className="animate-spin" size={40} />
                        ) : isConnected ? (
                           <StopCircle size={40} fill="currentColor" />
                        ) : (
                           <Mic size={40} />
                        )}
                     </button>
                   </div>
                   
                   {error && (
                      <div className="absolute left-1/2 -translate-x-1/2 -bottom-16 w-max text-red-500 text-sm bg-red-50 px-4 py-2 rounded-xl border border-red-100 animate-in fade-in slide-in-from-bottom-2">
                         {error}
                      </div>
                   )}
                </div>
             </div>
          )}

       </div>
    </div>
  );
};

export default SevenAIModule;