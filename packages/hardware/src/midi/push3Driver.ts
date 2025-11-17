/**
 * Ableton Push 3 Driver (Stub)
 * Currently uses same implementation as Push 2
 * TODO: Add standalone mode support
 */

import { Push2Driver } from './push2Driver';
import { HardwareDeviceType } from '../types';

export class Push3Driver extends Push2Driver {
  override deviceType: HardwareDeviceType = 'push3';
  override name = 'Ableton Push 3';

  /**
   * Push 3 standalone mode stub
   * When implemented, this will enable direct control without computer
   */
  async enableStandaloneMode(): Promise<void> {
    // TODO: Implement Push 3 standalone mode
    // This requires different SysEx messages and communication protocol
    throw new Error('Push 3 standalone mode not yet implemented');
  }
}
