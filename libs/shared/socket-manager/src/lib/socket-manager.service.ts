import { inject, Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

import { SOCKET_CONFIG } from './socket-manager.constants';
import { SocketConfig } from './socket-manager.types';

@Injectable({ providedIn: 'root' })
export class SocketManagerService {
  private _appSocketConfig = inject(SOCKET_CONFIG);

  private _sockets: { [key: string]: Socket } = {};

  /**
   * Constructor
   */
  constructor() {
    if (!this._appSocketConfig) {
      throw new Error('SocketManagerService: No configuration provided!');
    }

    if (Array.isArray(this._appSocketConfig)) {
      this._appSocketConfig.forEach((config) => this._connect(config));
    } else {
      this._connect(this._appSocketConfig);
    }
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  private _connect(config: SocketConfig): Socket {
    if (!this._sockets[config.endpoint]) {
      this._sockets[config.endpoint] = io(config.endpoint, {
        transports: ['websocket'],
        reconnectionAttempts: 3,
        reconnectionDelay: 1000,
        secure: true,
        rejectUnauthorized: false,
        auth: config.auth,
      });

      this._sockets[config.endpoint].on('connect_error', (err: Error) => {
        console.error(`Connection error: ${config.endpoint}`, err.message);
      });

      this._sockets[config.endpoint].on('disconnect', () => {
        console.log(`Disconnected from ${config.endpoint}`);
      });
    }
    return this._sockets[config.endpoint];
  }

  private _disconnect(config: SocketConfig): void {
    if (this._sockets[config.endpoint]) {
      this._sockets[config.endpoint].disconnect();
      delete this._sockets[config.endpoint];
    }
  }

  private _disconnectAll(): void {
    Object.values(this._sockets).forEach((socket) => socket.disconnect());
    this._sockets = {};
  }
}
