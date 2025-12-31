
import React from 'react';
import { LucideIcon, LayoutDashboard, Settings, ScrollText, Bluetooth, BluetoothOff } from 'lucide-react';
import { ConnectionStatus } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  status: ConnectionStatus;
  deviceName: string;
  onConnect: () => void;
  onDisconnect: () => void;
}

const NavItem: React.FC<{ 
  icon: LucideIcon; 
  label: string; 
  active: boolean; 
  onClick: () => void 
}> = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 ${
      active ? 'text-blue-500' : 'text-slate-500'
    }`}
  >
    <Icon size={20} strokeWidth={active ? 2.5 : 2} />
    <span className={`text-[9px] mt-1 font-bold tracking-widest uppercase ${active ? 'opacity-100' : 'opacity-60'}`}>
      {label}
    </span>
  </button>
);

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeTab, 
  setActiveTab, 
  status, 
  deviceName, 
  onConnect, 
  onDisconnect 
}) => {
  return (
    <div className="flex flex-col min-h-screen bg-[#0b101a]">
      {/* Header - 减小高度 */}
      <header className="sticky top-0 z-50 bg-[#0b101a]/90 backdrop-blur-md px-4 pt-safe flex items-center justify-between h-14 border-b border-white/5">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-slate-700'}`} />
          <span className="text-xs font-black text-slate-100 tracking-tight uppercase truncate max-w-[150px]">
            {status === 'connected' ? deviceName : 'System'}
          </span>
        </div>

        {status === 'connected' && (
          <button 
            onClick={onDisconnect}
            className="p-2 rounded-lg bg-rose-500/10 text-rose-500 active:scale-90 transition-transform"
          >
            <BluetoothOff size={18} strokeWidth={2.5} />
          </button>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-4 pt-3 pb-24 no-scrollbar">
        {children}
      </main>

      {/* Navigation - 减小高度 */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-[#161d2f] border-t border-white/5 flex justify-around items-center z-50 pb-safe shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <NavItem icon={LayoutDashboard} label="Data" active={activeTab === 'data'} onClick={() => setActiveTab('data')} />
        <NavItem icon={Settings} label="System" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        <NavItem icon={ScrollText} label="Logs" active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} />
      </div>
    </div>
  );
};

export default Layout;
