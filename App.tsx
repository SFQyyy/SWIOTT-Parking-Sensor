
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import Logs from './components/Logs';
import { 
  SensorData, ConnectionStatus, LogEntry, SettingsState, ParkingType 
} from './types';
import { ble } from './services/bluetoothService';

const INITIAL_DATA: SensorData = {
  temperature: 0,
  batterySoc: 0,
  statusRaw: '00',
  parkingCount: 0,
  timerCount: 0,
  magneticStrength: 0,
  magX: 0,
  magY: 0,
  magZ: 0,
  rssi: 0,
  coverStrength: 0,
  distance: 0,
  isParked: false,
  isValid: false,
  eventType: 0,
  errCode: 1,
  isMagnetHigh: false,
  isBatteryLow: false,
  isCoverOpen: false,
  isRssiLow: false,
};

const INITIAL_SETTINGS: SettingsState = {
  commType: 'LoRaWAN',
  parkingType: ParkingType.Horizontal,
  targetTh: 150,
  coverTh: 4000,
  isRadarEnabled: true,
  deveui: '', appeui: '', devaddr: '', appskey: '', nwkskey: '', region: 'CN470',
  frequency: 470000000, spreadFactor: 7, bandwidth: 125,
  nbApn: '', nbMqttHost: '', nbMqttPort: '1883', nbMqttUser: '', nbMqttPass: '',
  nbMqttClean: 0, nbMqttKeepAlive: 120, nbStatus: 0,
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('data');
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [deviceName, setDeviceName] = useState('');
  const [data, setData] = useState<SensorData>(INITIAL_DATA);
  const [settings, setSettings] = useState<SettingsState>(INITIAL_SETTINGS);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const pollingIntervalRef = useRef<number | null>(null);
  const lastQueriedNBMode = useRef<string | null>(null);

  const addLog = useCallback((type: 'send' | 'receive', content: string) => {
    const time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [...prev.slice(-199), { timestamp: time, type, content }]);
  }, []);

  const sendCommand = useCallback(async (cmd: string) => {
    try {
      addLog('send', cmd);
      await ble.sendCommand(cmd);
    } catch (err) {
      addLog('send', `Err: ${(err as Error).message}`);
    }
  }, [addLog]);

  const handleLine = useCallback((line: string) => {
    addLog('receive', line);
    const parsed = ble.parseLine(line);
    if (parsed) {
      if ('nbApn' in parsed || 'nbMqttHost' in parsed) {
        setSettings(prev => ({ ...prev, ...parsed }));
      } else {
        setData(prev => ({ ...prev, ...parsed as Partial<SensorData> }));
      }
    }
  }, [addLog]);

  useEffect(() => {
    ble.onLineReceived = handleLine;
    ble.onDisconnected = () => {
      setStatus('disconnected');
      setDeviceName('');
      setData(INITIAL_DATA);
      lastQueriedNBMode.current = null;
      addLog('receive', 'GATT Disconnected');
    };
    return () => {
      ble.onLineReceived = null;
      ble.onDisconnected = null;
    };
  }, [handleLine, addLog]);

  // 当切换到设置页面且为 NB-IoT 模式时，自动读取参数
  useEffect(() => {
    if (status === 'connected' && activeTab === 'settings' && settings.commType === 'NB-IoT') {
      const queryId = `${activeTab}-${settings.commType}`;
      if (lastQueriedNBMode.current !== queryId) {
        lastQueriedNBMode.current = queryId;
        const fetchConfig = async () => {
          await sendCommand('AT+NBAPN?');
          await sleep(500); // 间隔至少 300ms
          await sendCommand('AT+NBMQTT?');
        };
        fetchConfig();
      }
    } else if (activeTab !== 'settings') {
      lastQueriedNBMode.current = null;
    }
  }, [status, activeTab, settings.commType, sendCommand]);

  useEffect(() => {
    if (status === 'connected') {
      pollingIntervalRef.current = window.setInterval(async () => {
        await sendCommand('AT+SWQUERY?');
        await sleep(500);
        await sendCommand('AT+SWRDSTATUS?');
      }, 10000);
    } else {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [status, sendCommand]);

  const handleConnect = async () => {
    try {
      setStatus('searching');
      const name = await ble.requestDevice();
      setDeviceName(name);
      setStatus('connecting');
      await ble.connect();
      setStatus('connected');
      addLog('receive', `Handshake OK: ${name}`);
      await sendCommand('AT+SWRDINIT');
      await sleep(300);
      await sendCommand('AT+SWQUERY?');
      await sleep(500);
      await sendCommand('AT+SWRDSTATUS?');
    } catch (err) {
      console.error(err);
      setStatus('disconnected');
      addLog('receive', 'BLE Connection Failed');
    }
  };

  const handleSetThresholds = async () => {
    await sendCommand(`AT+SWRDTARTH=${settings.targetTh}`);
    await sleep(300);
    await sendCommand(`AT+SWRDAVGTH=${settings.coverTh}`);
    addLog('send', 'Thresholds update requested.');
  };

  const handleSetParkType = async (type: number) => {
    setSettings(p => ({...p, parkingType: type}));
    await sendCommand(`AT+SWRDPARKTYPE=${type}`);
  };

  const handleSaveConfig = async () => {
    if (settings.commType === 'NB-IoT') {
      // 1. 发送 AT+NBAPN
      await sendCommand(`AT+NBAPN=${settings.nbApn}`);
      
      // 2. 间隔至少 500ms
      await sleep(500);
      
      // 3. 发送 AT+NBMQTT
      // 参数顺序: <host>,<port>,<username>,<password>,<clean>,<keepalive>
      const mqttParams = [
        settings.nbMqttHost,
        settings.nbMqttPort,
        settings.nbMqttUser || '', 
        settings.nbMqttPass || '',
        settings.nbMqttClean,
        settings.nbMqttKeepAlive
      ].join(',');
      await sendCommand(`AT+NBMQTT=${mqttParams}`);
      
      addLog('send', 'NB-IoT Configuration synced successfully.');
    } else {
      // LoRaWAN 配置路径
      await sendCommand(`AT+DEVEUI=${settings.deveui}`);
      await sleep(500);
      await sendCommand(`AT+APPKEY=${settings.appskey}`);
      await sleep(500);
      await sendCommand(`AT+REGION=${settings.region}`);
      addLog('send', 'LoRaWAN Configuration synced successfully.');
    }
    // 已移除 AT+SAVE 指令，因为该设备文档中并未提供此指令
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      status={status} 
      deviceName={deviceName}
      onConnect={handleConnect}
      onDisconnect={() => ble.disconnect()}
    >
      {activeTab === 'data' && (
        <Dashboard 
          data={data} 
          onRefresh={() => sendCommand('AT+SWRDSTATUS?')} 
          onCalibrate={() => sendCommand('AT+SWRDCALI')}
          onConnect={handleConnect}
          disabled={status !== 'connected'} 
        />
      )}
      
      {activeTab === 'settings' && (
        <Settings 
          settings={settings} 
          onUpdate={(f, v) => setSettings(p => ({...p, [f]: v}))}
          onSave={handleSaveConfig}
          onReboot={() => sendCommand('AT+SWREBOOT')}
          onToggleRadar={() => {
            const next = !settings.isRadarEnabled;
            setSettings(p => ({...p, isRadarEnabled: next}));
            sendCommand(`AT+SWRDENABLE=${next ? 1 : 0}`);
          }}
          onSetParkType={handleSetParkType}
          onSetThresholds={handleSetThresholds}
          disabled={status !== 'connected'} 
        />
      )}
      {activeTab === 'logs' && (
        <Logs logs={logs} onClear={() => setLogs([])} onSend={sendCommand} disabled={status !== 'connected'} />
      )}
    </Layout>
  );
};

export default App;
