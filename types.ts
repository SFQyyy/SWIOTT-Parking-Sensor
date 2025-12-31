
export interface SensorData {
  temperature: number;
  batterySoc: number;
  statusRaw: string;
  parkingCount: number; // 24小时计数
  timerCount: number;   // N小时计数
  magneticStrength: number;
  magX: number;
  magY: number;
  magZ: number;
  rssi: number;
  coverStrength: number;
  distance: number;
  isParked: boolean;
  isValid: boolean;
  eventType: number; // 0-无, 1-进入, 2-离开, 3-运动
  errCode: number;
  isMagnetHigh: boolean;
  isBatteryLow: boolean;
  isCoverOpen: boolean;
  isRssiLow: boolean;
}

export enum ParkingType {
  Horizontal = 0,
  Vertical = 1
}

export type CommType = 'LoRaWAN' | 'NB-IoT';

export interface SettingsState {
  commType: CommType;
  parkingType: ParkingType;
  targetTh: number;
  coverTh: number;
  isRadarEnabled: boolean;
  deveui: string;
  appeui: string;
  devaddr: string;
  appskey: string;
  nwkskey: string;
  region: string;
  frequency: number;
  spreadFactor: number;
  bandwidth: number;
  nbApn: string;
  nbMqttHost: string;
  nbMqttPort: string;
  nbMqttUser: string;
  nbMqttPass: string;
  nbMqttClean: number;
  nbMqttKeepAlive: number;
  nbStatus: number;
}

export interface LogEntry {
  timestamp: string;
  type: 'send' | 'receive';
  content: string;
}

export type ConnectionStatus = 'disconnected' | 'searching' | 'connecting' | 'connected';
