import { useState, useRef, useEffect } from "react";
import { Mic, Send, Bot, Loader2 } from "lucide-react";
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

const AICopilotModal = ({ contextType }: AICopilotModalProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  
  const { myTasks, selectedTask, taskUpdates, submitUpdate, updateTask } = useTaskStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!open) {
      setMessages([]);
      setQuery("");
    }
  }, [open]);

  const startRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Your browser does not support voice recognition.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      handleSend(transcript);
    };
    recognition.onerror = (e: any) => {
      console.error(e);
      toast.error("Error transcribing audio.");
      setIsRecording(false);
    };
    recognition.onend = () => setIsRecording(false);
    
    recognition.start();
  };

  const playSpeech = async (text: string) => {
    try {
      const audioBlob = await aiService.textToSpeech(text);
      const url = URL.createObjectURL(audioBlob);
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play().catch(e => console.error("Audio play blocked", e));
      }
    } catch (error) {
      console.error("TTS Error with ElevenLabs. Falling back to native browser speech synthesis:", error);
      // Fallback to native Web Speech API
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  const handleSend = async (textQuery: string = query) => {
    if (!textQuery.trim()) return;
    
    const userMsg = textQuery.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setQuery("");
    setLoading(true);

    try {
      if (contextType === "MY_TASKS") {
        const reply = await aiService.myTasksAssistant(userMsg, myTasks);
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
                statusChange: reply.suggestedStatus as TaskStatus || undefined
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
      <DialogContent className="sm:max-w-md border-violet-100 bg-gradient-to-br from-white to-violet-50/50 p-4">
        <DialogHeader className="pb-2 border-b border-violet-100">
          <DialogTitle className="flex items-center gap-2 text-violet-700 font-bold">
            <Bot size={20} />
            {contextType === "MY_TASKS" ? "My Tasks Copilot" : "Task Analyzer Copilot"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-[400px] gap-4 pt-2">
          <div className="flex-1 overflow-y-auto space-y-4 p-2 rounded-xl bg-white/50 backdrop-blur-sm shadow-inner border border-violet-50">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground text-sm mt-10 p-6">
                 Ask me about {contextType === "MY_TASKS" ? "your tasks" : "this task"}, or use voice commands to interact!
              </div>
            )}
            
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`text-sm px-4 py-3 max-w-[85%] shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-violet-600 text-white rounded-2xl rounded-br-sm' 
                    : 'bg-white border border-violet-100 text-foreground rounded-2xl rounded-bl-sm whitespace-pre-wrap'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="text-sm px-4 py-3 bg-white border border-violet-100 rounded-2xl rounded-bl-sm text-muted-foreground flex items-center gap-2">
                  <Bot size={14} className="animate-pulse text-violet-500" />
                  Thinking...
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 relative mt-auto">
            <Button
              type="button"
              variant={isRecording ? "destructive" : "outline"}
              size="icon"
              className={`rounded-full shrink-0 transition-all ${isRecording ? 'animate-pulse scale-110 shadow-red-200' : 'bg-white border-violet-200 text-violet-600 hover:bg-violet-50'}`}
              onClick={startRecording}
            >
              {isRecording ? <Loader2 className="animate-spin" size={18} /> : <Mic size={18} />}
            </Button>
            
            <Input 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type or speak a request..."
              className="rounded-full shadow-sm border-violet-200 focus-visible:ring-violet-500 pl-4 pr-12 h-11"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            
            <Button
              size="icon"
              className="absolute right-1 top-1 h-9 w-9 rounded-full bg-violet-600 hover:bg-violet-700 shadow-sm transition-all"
              onClick={() => handleSend()}
              disabled={loading || (!query && !isRecording)}
            >
              <Send size={16} />
            </Button>
          </div>
        </div>
        <audio ref={audioRef} className="hidden" />
      </DialogContent>
    </Dialog>
  );
};

export default AICopilotModal;
