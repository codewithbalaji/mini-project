import { useState, useEffect } from "react";
import { Mic, Send, Bot, MessageSquare, MicOff, Volume2, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTaskStore } from "@/store/taskStore";
import aiService from "@/services/aiService";
import { toast } from "sonner";
import type { TaskStatus } from "@/types/task.types";

interface AICopilotModalProps {
  contextType: "MY_TASKS" | "TASK_DETAIL";
}

type InputMode = "text" | "voice";

const AICopilotModal = ({ contextType }: AICopilotModalProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [inputMode, setInputMode] = useState<InputMode>("text");
  const [recognition, setRecognition] = useState<any>(null);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>("");
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);
  
  const { myTasks, selectedTask, taskUpdates, submitUpdate, updateTask, fetchMyTasks } = useTaskStore();

  // Load voices when component mounts
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        // Filter to only English voices for cleaner list
        const englishVoices = voices.filter(voice => voice.lang.startsWith('en'));
        setAvailableVoices(englishVoices.length > 0 ? englishVoices : voices);
        
        // Priority order for voice selection
        const preferredVoice = voices.find(voice => 
          voice.name.includes('Google US English') || 
          voice.name.includes('Google UK English Female')
        ) || voices.find(voice => 
          voice.name.includes('Microsoft Zira') || 
          voice.name.includes('Microsoft David')
        ) || voices.find(voice => 
          voice.lang === 'en-US' && voice.localService === false
        ) || voices.find(voice => 
          voice.lang.startsWith('en-US')
        ) || voices.find(voice => 
          voice.lang.startsWith('en')
        );
        
        const voiceToSelect = preferredVoice || voices[0];
        setSelectedVoice(voiceToSelect);
        setSelectedVoiceName(voiceToSelect.name);
        console.log('Selected voice:', voiceToSelect.name);
      }
    };

    // Load voices immediately
    loadVoices();
    
    // Also listen for voiceschanged event (some browsers load voices asynchronously)
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!open) {
      setMessages([]);
      setQuery("");
      stopListening();
    } else {
      // Reload voices when modal opens to ensure they're available
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0 && !selectedVoiceName) {
        const preferredVoice = voices.find(voice => 
          voice.name.includes('Google US English')
        ) || voices.find(voice => 
          voice.name.includes('Microsoft David')
        ) || voices[0];
        
        setSelectedVoice(preferredVoice);
        setSelectedVoiceName(preferredVoice.name);
        console.log('Voice set on modal open:', preferredVoice.name);
      }
      
      // Fetch latest tasks when modal opens for MY_TASKS context
      if (contextType === "MY_TASKS") {
        console.log('Fetching latest tasks...');
        console.log('Current myTasks before fetch:', myTasks.length);
        fetchMyTasks().then(() => {
          console.log('Tasks fetched successfully');
          // Note: myTasks won't be updated here due to closure, check in handleSend
        });
      }
    }
  }, [open, contextType]);

  useEffect(() => {
    // Initialize speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        handleSend(transcript.trim());
      };
      
      recognitionInstance.onerror = (e: any) => {
        console.error("Speech recognition error:", e);
        if (e.error !== 'no-speech') {
          toast.error("Voice recognition error. Please try again.");
        }
      };
      
      recognitionInstance.onend = () => {
        // Auto-restart if in voice mode and modal is open
        if (inputMode === "voice" && open && isListening) {
          recognitionInstance.start();
        }
      };
      
      setRecognition(recognitionInstance);
    }
    
    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, []);

  const startListening = () => {
    if (!recognition) {
      toast.error("Your browser does not support voice recognition.");
      return;
    }
    
    try {
      recognition.start();
      setIsListening(true);
    } catch (error) {
      console.error("Error starting recognition:", error);
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const toggleVoiceMode = () => {
    if (inputMode === "voice") {
      stopListening();
      setInputMode("text");
    } else {
      setInputMode("voice");
      startListening();
    }
  };

  const playSpeech = (text: string, voiceName?: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Get fresh voices list and find the voice by name
      const voices = window.speechSynthesis.getVoices();
      const targetVoiceName = voiceName || selectedVoiceName;
      
      console.log('Looking for voice:', targetVoiceName);
      
      // If no voice name is set, use the first available voice
      let voiceToUse = voices.find(v => v.name === targetVoiceName);
      
      if (!voiceToUse && voices.length > 0) {
        // Fallback: try to find a good default voice
        voiceToUse = voices.find(v => v.name.includes('Google US English')) ||
                     voices.find(v => v.name.includes('Google UK English Male')) ||
                     voices.find(v => v.name.includes('Microsoft David')) ||
                     voices.find(v => v.lang.startsWith('en-US')) ||
                     voices[0];
        
        if (voiceToUse) {
          console.log('Using fallback voice:', voiceToUse.name);
          // Update the selected voice name for future use
          setSelectedVoiceName(voiceToUse.name);
        }
      }
      
      if (voiceToUse) {
        utterance.voice = voiceToUse;
        console.log('Using voice:', voiceToUse.name, voiceToUse.lang);
      } else {
        console.warn('No voice found, using browser default');
      }
      
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      utterance.lang = voiceToUse?.lang || 'en-US';
      
      // Add event listeners for debugging
      utterance.onstart = () => {
        console.log('Speech started with voice:', utterance.voice?.name || 'default');
      };
      
      utterance.onerror = (event) => {
        console.error('Speech error:', event);
      };
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const testVoice = (voice: SpeechSynthesisVoice) => {
    console.log('Testing voice:', voice.name);
    playSpeech("Hello! This is how I sound. I'm your AI assistant ready to help you.", voice.name);
  };

  const handleSend = async (textQuery: string = query) => {
    if (!textQuery.trim()) return;
    
    const userMsg = textQuery.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setQuery("");
    setLoading(true);

    try {
      if (contextType === "MY_TASKS") {
        // Get fresh tasks from store
        const currentTasks = useTaskStore.getState().myTasks;
        console.log('Sending tasks to AI:', currentTasks.length, 'tasks');
        console.log('Tasks data:', currentTasks);
        
        if (currentTasks.length === 0) {
          const noTasksMessage = "You don't have any tasks assigned to you at the moment. Would you like me to help you with something else?";
          setMessages(prev => [...prev, { role: 'assistant', content: noTasksMessage }]);
          playSpeech(noTasksMessage);
          setLoading(false);
          return;
        }
        
        const reply = await aiService.myTasksAssistant(userMsg, currentTasks);
        setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
        playSpeech(reply);
      } else if (contextType === "TASK_DETAIL" && selectedTask) {
        const context = {
          task: selectedTask,
          updates: taskUpdates
        };
        const reply = await aiService.taskDetailAssistant(userMsg, context);
        
        const assistantContent = reply.speechText;
        setMessages(prev => [...prev, { role: 'assistant', content: assistantContent }]);
        playSpeech(assistantContent);

        if (reply.suggestedStatus || reply.suggestedUpdateText) {
           if (reply.suggestedStatus && reply.suggestedStatus !== selectedTask.status) {
              await updateTask(selectedTask._id, { status: reply.suggestedStatus as TaskStatus });
              toast.success(`Task status updated to ${reply.suggestedStatus.replace('_', ' ')}`);
           }
           if (reply.suggestedUpdateText) {
              await submitUpdate({
                taskId: selectedTask._id,
                updateText: reply.suggestedUpdateText,
                hoursLogged: 0,
                statusChange: reply.suggestedStatus as TaskStatus || undefined,
                isAIGenerated: true
              });
              toast.success("Task update added from AI suggestions.");
           }
        }
      }
    } catch (error: any) {
      toast.error("AI failed to respond.");
      console.error("AI Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 shrink-0 shadow-lg bg-violet-600 hover:bg-violet-700 text-white rounded-full px-6 transition-all duration-300 transform hover:scale-105">
          <Bot size={18} />
          AI Copilot
        </Button>
      </DialogTrigger>
      <DialogContent 
        className="sm:max-w-2xl border-none bg-white p-0 gap-0"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-violet-600 font-bold text-lg">
              <Bot size={24} />
              {contextType === "MY_TASKS" ? "My Tasks Copilot" : "Task Analyzer Copilot"}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowVoiceSelector(!showVoiceSelector)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-gray-500 hover:text-violet-600 hover:bg-violet-50"
                title="Voice Settings"
              >
                <Volume2 size={16} />
              </button>
              <button
                onClick={() => {
                  if (inputMode === "voice") {
                    stopListening();
                  }
                  setInputMode("text");
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  inputMode === "text" 
                    ? "bg-violet-100 text-violet-600 font-medium" 
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <MessageSquare size={16} />
                <span className="text-sm">Text</span>
              </button>
              <button
                onClick={toggleVoiceMode}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  inputMode === "voice" 
                    ? "bg-violet-100 text-violet-600 font-medium" 
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <Mic size={16} />
                <span className="text-sm">Voice</span>
              </button>
            </div>
          </div>
          
          {/* Voice Selector Dropdown */}
          {showVoiceSelector && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Select Voice</h4>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {availableVoices.map((voice, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                      selectedVoiceName === voice.name
                        ? "bg-violet-100 border-violet-300"
                        : "bg-white border-gray-200 hover:border-violet-200"
                    }`}
                    onClick={() => {
                      setSelectedVoice(voice);
                      setSelectedVoiceName(voice.name);
                      console.log('Voice selected:', voice.name);
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {voice.name}
                        </p>
                        {selectedVoiceName === voice.name && (
                          <Check size={16} className="text-violet-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {voice.lang} • {voice.localService ? "Local" : "Online"}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="shrink-0 ml-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        testVoice(voice);
                      }}
                    >
                      <Volume2 size={14} className="mr-1" />
                      Test
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogHeader>

        <div className="flex flex-col h-[500px]">
          {inputMode === "voice" && messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-white to-violet-50/30">
              <div className="relative mb-8">
                <div className={`w-40 h-40 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-2xl transition-all duration-300 ${
                  isListening ? 'scale-110 shadow-violet-300' : ''
                }`}>
                  {isListening ? (
                    <Mic size={64} className="text-white animate-pulse" />
                  ) : (
                    <MicOff size={64} className="text-white" />
                  )}
                </div>
                {isListening && (
                  <div className="absolute inset-0 rounded-full bg-violet-400 animate-ping opacity-20"></div>
                )}
              </div>
              
              <h3 className="text-2xl font-bold text-violet-600 mb-2">Voice Mode Active</h3>
              <p className="text-gray-500 text-center max-w-md">
                {isListening 
                  ? "Listening... Start speaking to interact with AI" 
                  : "Click the microphone to start voice conversation"}
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
              {messages.length === 0 && (
                <div className="text-center text-gray-400 text-sm mt-20">
                  <Bot size={48} className="mx-auto mb-4 text-violet-300" />
                  <p>Ask me about {contextType === "MY_TASKS" ? "your tasks" : "this task"}!</p>
                </div>
              )}
              
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] ${msg.role === 'user' ? '' : 'space-y-1'}`}>
                    {msg.role === 'assistant' && (
                      <div className="text-xs font-medium text-gray-500 px-4">AI</div>
                    )}
                    {msg.role === 'user' && (
                      <div className="text-xs font-medium text-violet-600 px-4 text-right">You</div>
                    )}
                    <div className={`px-4 py-3 rounded-2xl ${
                      msg.role === 'user' 
                        ? 'bg-violet-100 text-violet-900' 
                        : 'bg-white text-gray-800 shadow-sm border border-gray-100'
                    }`}>
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-gray-500 px-4">AI</div>
                    <div className="px-4 py-3 bg-white rounded-2xl shadow-sm border border-gray-100">
                      <div className="flex items-center gap-2 text-gray-400">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {inputMode === "text" && (
            <div className="p-4 border-t border-gray-100 bg-white">
              <div className="flex items-center gap-2 relative">
                <Input 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type your message..."
                  className="rounded-full shadow-sm border-gray-200 focus-visible:ring-violet-500 pl-4 pr-12 h-11 bg-gray-50"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  disabled={loading}
                />
                
                <Button
                  size="icon"
                  className="absolute right-1 top-1 h-9 w-9 rounded-full bg-violet-600 hover:bg-violet-700 shadow-sm transition-all"
                  onClick={() => handleSend()}
                  disabled={loading || !query.trim()}
                >
                  <Send size={16} />
                </Button>
              </div>
            </div>
          )}
          
          {inputMode === "voice" && messages.length > 0 && (
            <div className="p-4 border-t border-gray-100 bg-white flex justify-center">
              <Button
                onClick={isListening ? stopListening : startListening}
                className={`rounded-full px-8 py-6 text-base font-medium transition-all ${
                  isListening 
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                    : 'bg-violet-600 hover:bg-violet-700'
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff size={20} className="mr-2" />
                    Stop Listening
                  </>
                ) : (
                  <>
                    <Mic size={20} className="mr-2" />
                    Start Listening
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AICopilotModal;
