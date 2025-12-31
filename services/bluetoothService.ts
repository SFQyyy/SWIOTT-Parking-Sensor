
import { SensorData, SettingsState } from '../types';

const SERVICE_UUID = 0xfff0;
const WRITE_CHAR_UUID = 0xfff2;
const NOTIFY_CHAR_UUID = 0xfff1;

export class BluetoothService {
  private device: any = null;
  private server: any = null;
  private writeChar: any = null;
  private notifyChar: any = null;
  private dataBuffer: string = '';

  public onLineReceived: ((line: string) => void) | null = null;
  public onDisconnected: (() => void) | null = null;

  async requestDevice(): Promise<string> {
    const device = await (navigator as any).bluetooth.requestDevice({
      filters: [{ namePrefix: "3" }],
      optionalServices: [SERVICE_UUID],
    });
    this.device = device;
    this.device.addEventListener('gattserverdisconnected', () => {
      this.dataBuffer = '';
      if (this.onDisconnected) this.onDisconnected();
    });
    return device.name || 'Unknown Device';
  }

  async connect(): Promise<void> {
    if (!this.device) throw new Error('No device selected');
    this.server = await this.device.gatt?.connect() || null;
    const service = await this.server.getPrimaryService(SERVICE_UUID);
    this.writeChar = await service.getCharacteristic(WRITE_CHAR_UUID);
    this.notifyChar = await service.getCharacteristic(NOTIFY_CHAR_UUID);

    await this.notifyChar.startNotifications();
    this.notifyChar.addEventListener('characteristicvaluechanged', (event: any) => {
      const value = event.target.value;
      const decoder = new TextDecoder();
      const str = decoder.decode(value);
      this.dataBuffer += str;

      const lines = this.dataBuffer.split(/\r\n|\r|\n/);
      this.dataBuffer = lines.pop() || '';

      for (let line of lines) {
        line = line.trim();
        if (!line) continue;

        const segments = line.split(/(?=\+SWQUERY:|\+MRSTATUS:|\+SWRDSTATUS:|\+SWRSSI:|\+NBAPN:|\+NBMQTT:)/);
        for (const segment of segments) {
          const finalLine = segment.trim();
          if (finalLine && this.onLineReceived) {
            this.onLineReceived(finalLine);
          }
        }
      }
    });

    await this.writeString('SWIOTT', false);
  }

  async disconnect(): Promise<void> {
    if (this.device?.gatt?.connected) {
      this.device.gatt.disconnect();
    }
    this.dataBuffer = '';
  }

  async writeString(str: string, isHex: boolean = false): Promise<void> {
    if (!this.writeChar) throw new Error('Not connected');
    let buffer: ArrayBuffer;
    if (isHex) {
      const hex = str.replace(/\s+/g, '');
      buffer = new ArrayBuffer(hex.length / 2);
      const view = new Uint8Array(buffer);
      for (let i = 0; i < view.length; i++) {
        view[i] = parseInt(hex.substr(2 * i, 2), 16);
      }
    } else {
      const encoder = new TextEncoder();
      buffer = encoder.encode(str).buffer;
    }
    await this.writeChar.writeValueWithoutResponse(buffer);
  }

  async sendCommand(cmd: string): Promise<void> {
    const fullCmd = cmd.endsWith('\r\n') ? cmd : `${cmd}\r\n`;
    await this.writeString(fullCmd, false);
  }

  parseLine(line: string): Partial<SensorData> | Partial<SettingsState> | null {
    if (line.startsWith('+MRSTATUS:') || line.startsWith('+SWRDSTATUS:')) return this.parseMrStatus(line);
    if (line.startsWith('+SWQUERY:')) return this.parseHexQuery(line);
    if (line.startsWith('+SWRSSI:')) return { rssi: parseInt(line.split(':')[1]) };
    if (line.startsWith('+NBAPN:')) return { nbApn: line.split(':')[1]?.trim() };
    if (line.startsWith('+NBMQTT:')) return this.parseNbMqtt(line);
    return null;
  }

  private parseNbMqtt(line: string): Partial<SettingsState> | null {
    const content = line.split(':')[1];
    if (!content) return null;
    const v = content.split(',');
    if (v.length < 6) return null;
    return {
      nbMqttHost: v[0].trim(),
      nbMqttPort: v[1].trim(),
      nbMqttUser: v[2].trim(),
      nbMqttPass: v[3].trim(),
      nbMqttClean: parseInt(v[4].trim()),
      nbMqttKeepAlive: parseInt(v[5].trim())
    };
  }

  private parseMrStatus(line: string): Partial<SensorData> | null {
    const content = line.split(':')[1];
    if (!content) return null;
    const v = content.split(',').map(s => parseInt(s.trim()));
    if (v.length < 11) return null;

    const eventType = v[0];   // 0-No, 1-Entry, 2-Exit, 3-Movement
    const parkStatus = v[1];  // 0-Empty, 1-Occupied

    // 核心逻辑：根据用户要求，严格基于 event_type 和 park_status
    let isParked = parkStatus === 1;
    if (eventType === 1) isParked = true;
    else if (eventType === 2) isParked = false;

    return {
      eventType: eventType,
      isParked: isParked,
      magX: v[2],
      magY: v[3],
      magZ: v[4],
      magneticStrength: v[5],
      rssi: v[6],
      coverStrength: v[7],
      distance: v[8],
      isValid: v[9] === 1,
      errCode: v[10]
    };
  }

  private parseHexQuery(line: string): Partial<SensorData> | null {
    const hex = line.split(':')[1]?.trim();
    if (!hex || hex.length < 26) return null;

    try {
      const bytes = new Uint8Array(hex.match(/.{1,2}/g)!.map(b => parseInt(b, 16)));
      const readUInt16LE = (offset: number) => bytes[offset] | (bytes[offset + 1] << 8);
      const statusByte = bytes[2];

      // 注意：此处移除了 isParked 判定，防止其覆盖基于雷达状态计算的准确值
      return {
        temperature: bytes[0],
        batterySoc: bytes[1],
        statusRaw: statusByte.toString(16).toUpperCase().padStart(2, '0'),
        parkingCount: bytes[3],
        timerCount: bytes[4],
        magneticStrength: readUInt16LE(5),
        rssi: readUInt16LE(7),
        coverStrength: readUInt16LE(9),
        distance: readUInt16LE(11),
        // 依然保留告警位判定，但不触碰 isParked 核心业务逻辑
        isMagnetHigh: !!(statusByte & 0x02),
        isBatteryLow: !!(statusByte & 0x04),
        isCoverOpen: !!(statusByte & 0x08),
        isRssiLow: !!(statusByte & 0x80)
      };
    } catch (e) {
      console.error('Hex parse error:', e);
      return null;
    }
  }
}

export const ble = new BluetoothService();
