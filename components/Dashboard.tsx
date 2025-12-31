
import React from 'react';
import { SensorData } from '../types';
import { 
  Battery, 
  Signal, 
  Ruler,
  Car,
  Activity,
  Bluetooth,
  Gauge,
  Zap,
  Clock,
  Compass
} from 'lucide-react';

interface DashboardProps {
  data: SensorData;
  onRefresh: () => void;
  onCalibrate: () => void;
  onConnect: () => void;
  disabled: boolean;
}

const MetricCard: React.FC<{ 
  title: string, 
  icon: any, 
  items: { label: string, value: string | number, unit?: string }[] 
  className?: string
}> = ({ title, icon: Icon, items, className = "" }) => (
  <div className={`dark-card p-3 flex flex-col space-y-2 shadow-lg shadow-black/20 ${className}`}>
    <div className="flex items-center space-x-2 text-slate-400">
      <Icon size={12} className="text-blue-500" strokeWidth={2.5} />
      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{title}</span>
    </div>
    <div className={`grid ${items.length > 2 ? 'grid-cols-3' : 'grid-cols-2'} gap-x-2 gap-y-2`}>
      {items.map((item, idx) => (
        <div key={idx} className="flex flex-col">
          <span className="text-[7px] font-bold text-slate-500 uppercase tracking-widest mb-0.5 truncate">{item.label}</span>
          <div className="flex items-baseline space-x-0.5">
            <span className="text-base font-black text-white leading-none tracking-tight">
              {item.value ?? '--'}
            </span>
            {item.unit && <span className="text-[8px] text-slate-500 font-bold ml-0.5">{item.unit}</span>}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ data, onRefresh, onCalibrate, onConnect, disabled }) => {
  if (disabled) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[75vh] px-8 text-center animate-in fade-in duration-1000">
        <div className="relative mb-8">
          <div className="w-32 h-32 bg-blue-600/10 rounded-full flex items-center justify-center relative">
             <div className="absolute inset-0 rounded-full border border-blue-500/20 animate-ping opacity-20" />
             <Bluetooth size={64} className="text-blue-500 relative z-10" strokeWidth={1.2} />
          </div>
          <div className="absolute -inset-6 bg-blue-500/5 blur-3xl rounded-full -z-10" />
        </div>

        <div className="space-y-3 mb-12">
          <h1 className="text-3xl font-black text-white tracking-tighter">Parking Sensor Monitor</h1>
          <p className="text-slate-400 text-xs font-medium leading-relaxed max-w-[260px] mx-auto opacity-80">
            Connect to your parking sensor via bluetooth
          </p>
        </div>

        <button 
          onClick={onConnect} 
          className="w-full max-w-xs bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-full shadow-2xl shadow-blue-600/30 active:scale-95 transition-all flex items-center justify-center space-x-3 group"
        >
          <Bluetooth size={20} strokeWidth={2.5} />
          <span className="text-sm font-black tracking-tight">Connect Device</span>
        </button>

        <div className="mt-12 opacity-30">
          <p className="text-[8px] text-slate-500 font-bold leading-relaxed uppercase tracking-widest">
            Note: Ensure you are using Chrome on Android or a<br/>browser that supports Web Bluetooth.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-in fade-in duration-500 pb-4">
      {/* 核心状态显示 */}
      <div className={`dark-card p-4 overflow-hidden relative transition-colors duration-500 ${data.isParked ? 'bg-rose-500/5 border-rose-500/20' : 'bg-emerald-500/5 border-emerald-500/20'}`}>
        <div className="absolute top-0 right-0 p-2 opacity-5">
           <Car size={60} strokeWidth={1} />
        </div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${data.isParked ? 'bg-rose-500' : 'bg-emerald-500'} animate-pulse`} />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Live Detection</span>
            </div>
            <h2 className={`text-3xl font-black tracking-tighter ${data.isParked ? 'text-rose-500' : 'text-emerald-500'}`}>
              {data.isParked ? 'OCCUPIED' : 'VACANT'}
            </h2>
            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">
              {data.eventType === 1 ? 'Entering' : data.eventType === 2 ? 'Leaving' : 'System Ready'}
            </p>
          </div>
          <div className={`p-3 rounded-lg bg-white/5 border border-white/10 ${data.isParked ? 'text-rose-500' : 'text-emerald-500'}`}>
            <Car size={24} />
          </div>
        </div>
      </div>

      {/* 数据网格 - 2列布局 */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard 
          title="Battery" 
          icon={Battery} 
          items={[
            { label: 'SoC', value: data.batterySoc, unit: '%' },
            { label: 'Temp', value: data.temperature, unit: '°C' }
          ]}
        />
        <MetricCard 
          title="Signal" 
          icon={Signal} 
          items={[
            { label: 'RSSI', value: data.rssi, unit: 'dBm' },
            { label: 'Link', value: data.isRssiLow ? 'Weak' : 'Good' }
          ]}
        />
        <MetricCard 
          title="Radar" 
          icon={Ruler} 
          items={[
            { label: 'Dist', value: data.distance, unit: 'cm' },
            { label: 'Cover', value: data.coverStrength }
          ]}
        />
        <MetricCard 
          title="Magnet" 
          icon={Gauge} 
          items={[
            { label: 'Total', value: data.magneticStrength, unit: 'mG' },
            { label: 'Valid', value: data.isValid ? 'Yes' : 'No' }
          ]}
        />
        
        {/* 新增：磁力计三轴显示 */}
        <MetricCard 
          title="Mag Axis (mG)" 
          icon={Compass} 
          className="col-span-2"
          items={[
            { label: 'X-Axis', value: data.magX },
            { label: 'Y-Axis', value: data.magY },
            { label: 'Z-Axis', value: data.magZ }
          ]}
        />

        {/* 新增：统计信息 */}
        <MetricCard 
          title="Statistics" 
          icon={Clock} 
          className="col-span-2"
          items={[
            { label: '24H Parkings', value: data.parkingCount },
            { label: 'Current Hour', value: data.timerCount, unit: 'hr' }
          ]}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 pt-1">
        <button onClick={onRefresh} className="bg-[#161d2f] border border-white/5 text-slate-300 font-black py-3 rounded-xl text-[10px] uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center space-x-2">
          <Activity size={14} />
          <span>Refresh</span>
        </button>
        <button onClick={onCalibrate} className="bg-blue-600 text-white font-black py-3 rounded-xl text-[10px] uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-blue-900/20">
          <Zap size={14} fill="currentColor" />
          <span>Calibrate</span>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
