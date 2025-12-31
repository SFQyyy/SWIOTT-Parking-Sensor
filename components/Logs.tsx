
import React, { useRef, useEffect } from 'react';
import { LogEntry } from '../types';
import { Send, Trash2, Terminal } from 'lucide-react';

interface LogsProps {
  logs: LogEntry[];
  onClear: () => void;
  onSend: (cmd: string) => void;
  disabled: boolean;
}

const Logs: React.FC<LogsProps> = ({ logs, onClear, onSend, disabled }) => {
  const [input, setInput] = React.useState('');
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input);
    setInput('');
  };

  return (
    <div className={`flex flex-col h-[calc(100vh-145px)] -mt-1 ${disabled ? 'opacity-30 pointer-events-none' : ''}`}>
      {/* 日志显示区域：使用 flex-1 占据所有剩余空间 */}
      <div className="flex-1 bg-black/40 rounded-xl p-3 font-mono text-[10px] overflow-y-auto no-scrollbar border border-white/5 flex flex-col">
        <div className="flex items-center justify-between mb-2 border-b border-white/5 pb-2 sticky top-0 bg-[#0b101a]/40 backdrop-blur-sm z-10">
          <div className="flex items-center space-x-2">
            <Terminal size={12} className="text-blue-500" />
            <span className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Serial Output</span>
          </div>
          <button onClick={onClear} className="text-slate-600 hover:text-rose-400 transition-colors">
            <Trash2 size={13} />
          </button>
        </div>
        
        <div className="space-y-1 flex-1">
          {logs.map((log, i) => (
            <div key={i} className="flex space-x-1.5 leading-relaxed">
              <span className="text-slate-600 shrink-0 text-[8px]">[{log.timestamp}]</span>
              <span className={log.type === 'send' ? 'text-blue-400' : 'text-emerald-400'}>
                {log.type === 'send' ? '>>' : '<<'}
              </span>
              <span className="text-slate-300 break-all">{log.content}</span>
            </div>
          ))}
          <div ref={logEndRef} />
        </div>
      </div>

      {/* 命令输入框：移到最下方 */}
      <div className="mt-3 bg-[#161d2f] p-1 rounded-lg border border-white/5 flex items-center space-x-2 focus-within:border-blue-500/50 shadow-lg">
        <input 
          type="text" 
          value={input}
          placeholder="COMMAND..."
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 bg-transparent outline-none px-3 py-2.5 text-xs font-mono text-slate-200 uppercase"
        />
        <button 
          onClick={handleSend}
          className="bg-blue-600 text-white p-2.5 rounded-md active:scale-95 transition-transform"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
};

export default Logs;
