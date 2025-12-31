
import React from 'react';
import { SettingsState, CommType, ParkingType } from '../types';
import { 
  RefreshCw, 
  Power, 
  Cpu, 
  Save, 
  ChevronRight,
  Lock,
  Wifi,
  Globe,
  Eye,
  EyeOff
} from 'lucide-react';

interface SettingsProps {
  settings: SettingsState;
  onUpdate: (field: keyof SettingsState, value: any) => void;
  onSave: () => void;
  onReboot: () => void;
  onToggleRadar: () => void;
  onSetParkType: (type: number) => void;
  onSetThresholds: () => void;
  disabled: boolean;
}

const LORAWAN_REGIONS = ['EU868', 'US915', 'CN470', 'AS923', 'AU915'];

const Settings: React.FC<SettingsProps> = ({ settings, onUpdate, onSave, onReboot, onToggleRadar, onSetParkType, onSetThresholds, disabled }) => {
  const [showPassword, setShowPassword] = React.useState(false);

  const DarkInput = ({ label, value, onChange, type = "text", placeholder = "" }) => (
    <div className="space-y-1">
      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">{label}</label>
      <input 
        type={type} 
        value={value} 
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)} 
        className="w-full bg-[#0b101a] border border-white/10 rounded-lg px-3 py-2 text-xs font-bold text-slate-100 outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-700" 
      />
    </div>
  );

  return (
    <div className="relative pb-6 space-y-3">
      {disabled && (
        <div className="absolute inset-0 z-40 bg-[#0b101a]/60 backdrop-blur-[2px] flex items-center justify-center rounded-xl">
          <div className="bg-[#161d2f] p-6 rounded-2xl border border-white/5 flex flex-col items-center space-y-3 shadow-2xl">
            <Lock size={24} className="text-slate-600" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Connection Required</p>
          </div>
        </div>
      )}

      {/* 快速动作 - 更紧凑 */}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={onReboot} className="dark-card p-3 flex items-center justify-center space-x-2 active:bg-slate-800 transition-colors">
          <RefreshCw size={14} className="text-blue-500" />
          <span className="text-[9px] font-black uppercase tracking-widest">Reboot</span>
        </button>
        <button 
          onClick={onToggleRadar} 
          className={`dark-card p-3 flex items-center justify-center space-x-2 active:bg-slate-800 transition-colors ${
            settings.isRadarEnabled ? 'text-blue-400' : 'text-slate-500'
          }`}
        >
          <Power size={14} />
          <span className="text-[9px] font-black uppercase tracking-widest">{settings.isRadarEnabled ? 'Radar ON' : 'Radar OFF'}</span>
        </button>
      </div>

      {/* 雷达配置 - 减小内边距 */}
      <div className="dark-card p-4 space-y-3">
        <div className="flex items-center space-x-2 text-slate-400 border-b border-white/5 pb-2">
          <Cpu size={14} strokeWidth={2.5} className="text-blue-500" />
          <span className="text-[9px] font-black uppercase tracking-widest">Radar Logic</span>
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex bg-[#0b101a] p-1 rounded-lg border border-white/5">
              {[
                { label: 'Horizontal', value: ParkingType.Horizontal },
                { label: 'Vertical', value: ParkingType.Vertical }
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => onSetParkType(opt.value)}
                  className={`flex-1 py-1.5 text-[9px] font-bold uppercase rounded-md transition-all ${
                    settings.parkingType === opt.value ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <DarkInput label="Target TH" type="number" value={settings.targetTh} onChange={(v) => onUpdate('targetTh', parseInt(v))} />
            <DarkInput label="Cover TH" type="number" value={settings.coverTh} onChange={(v) => onUpdate('coverTh', parseInt(v))} />
          </div>
          
          <button onClick={onSetThresholds} className="w-full py-2 bg-slate-800 text-slate-300 text-[9px] font-black rounded-lg border border-white/5 uppercase tracking-widest active:bg-slate-700 transition-all">
            Apply Thresholds
          </button>
        </div>
      </div>

      {/* 通信配置 - 极致压缩高度 */}
      <div className="dark-card p-4 space-y-3">
        <div className="flex bg-[#0b101a] p-1 rounded-lg border border-white/5">
          {(['LoRaWAN', 'NB-IoT'] as CommType[]).map((type) => (
            <button
              key={type}
              onClick={() => onUpdate('commType', type)}
              className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-md transition-all ${
                settings.commType === type ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {settings.commType === 'LoRaWAN' ? (
            <div className="space-y-2">
              <DarkInput label="Device EUI" value={settings.deveui} onChange={(v) => onUpdate('deveui', v)} />
              <DarkInput label="App Key" value={settings.appskey} onChange={(v) => onUpdate('appskey', v)} />
              <div className="relative">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-0.5 block">Region</label>
                <select 
                  value={settings.region} 
                  onChange={(e) => onUpdate('region', e.target.value)} 
                  className="w-full bg-[#0b101a] border border-white/10 rounded-lg px-3 py-2 text-xs font-bold text-slate-100 uppercase appearance-none outline-none focus:border-blue-500/50"
                >
                  {LORAWAN_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <ChevronRight size={12} className="absolute right-3 bottom-2.5 rotate-90 text-slate-500 pointer-events-none" />
              </div>
            </div>
          ) : (
            <div className="space-y-2 animate-in fade-in duration-300">
              <DarkInput label="SIM APN" value={settings.nbApn} onChange={(v) => onUpdate('nbApn', v)} placeholder="e.g. 3GNET" />
              <DarkInput label="MQTT Broker" value={settings.nbMqttHost} onChange={(v) => onUpdate('nbMqttHost', v)} placeholder="IP or Host" />
              <div className="grid grid-cols-2 gap-3">
                <DarkInput label="Port" value={settings.nbMqttPort} onChange={(v) => onUpdate('nbMqttPort', v)} placeholder="1883" />
                <DarkInput label="KeepAlive" type="number" value={settings.nbMqttKeepAlive} onChange={(v) => onUpdate('nbMqttKeepAlive', parseInt(v))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <DarkInput label="Username" value={settings.nbMqttUser} onChange={(v) => onUpdate('nbMqttUser', v)} placeholder="Optional" />
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={settings.nbMqttPass} 
                      placeholder="Optional"
                      onChange={(e) => onUpdate('nbMqttPass', e.target.value)} 
                      className="w-full bg-[#0b101a] border border-white/10 rounded-lg pl-3 pr-10 py-2 text-xs font-bold text-slate-100 outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-700" 
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <button onClick={onSave} className="w-full bg-blue-600 text-white font-black py-4 rounded-xl shadow-xl shadow-blue-900/20 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 uppercase text-[11px] tracking-widest">
        <Save size={16} />
        <span>Save & Sync</span>
      </button>
    </div>
  );
};

export default Settings;
