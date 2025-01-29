import { inject, Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { EMPTY, Observable } from 'rxjs';

import { SOCKET_CONFIG } from './socket-manager.constants';
import { SocketConfig } from './socket-manager.types';

@Injectable({ providedIn: 'root' })
export class SocketManagerService {
  private _initConfig = inject(SOCKET_CONFIG);

  private _sockets: Record<
    string,
    {
      socket: Socket;
      emitList: Array<string>;
      listenList: Array<string>;
    }
  > = {};

  /**
   * Constructor
   */
  constructor() {
    if (!this._initConfig) {
      throw new Error('SocketManagerService: No configuration provided!');
    }

    this._initConfig.forEach((config) => {
      if (!this._sockets[config.endpoint]) {
        this._sockets[config.endpoint] = {
          socket: this._connect(config),
          emitList: config.emitList,
          listenList: config.listenList,
        };
      }
    });
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  listen<T>(event: string): Observable<T | never> {
    const socketKey = Object.keys(this._sockets).find((key) => this._sockets[key].listenList.some((x) => x === event));

    if (!socketKey) {
      console.error(`No socket found for event: ${event}`);
      return EMPTY;
    }

    return new Observable((observer) => {
      this._sockets[socketKey].socket.on(event, (data: T) => {
        observer.next(data);
      });
    });
  }

  listenAll<T>(event: string): Observable<T | never> {
    const socketKeys = Object.keys(this._sockets).filter((key) =>
      this._sockets[key].listenList.some((x) => x === event)
    );

    if (socketKeys.length === 0) {
      console.error(`No socket found for event: ${event}`);
      return EMPTY;
    }

    return new Observable((observer) => {
      socketKeys.forEach((socketKey) => {
        this._sockets[socketKey].socket.on(event, (data: T) => {
          observer.next(data);
        });
      });
    });
  }

  connect(config: SocketConfig): void {
    if (this._sockets[config.endpoint]) {
      this._sockets[config.endpoint].socket.connect();
    } else {
      this._sockets[config.endpoint] = {
        socket: this._connect(config),
        emitList: config.emitList,
        listenList: config.listenList,
      };
    }
  }

  disconnect(key: string): void {
    if (this._sockets[key]) {
      this._sockets[key].socket.disconnect();
    }
  }

  disconnectAll(): void {
    Object.values(this._sockets).forEach((socket) => socket.socket.disconnect());
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  private _connect(config: SocketConfig): Socket {
    const socket = io(config.endpoint, {
      transports: ['websocket'],
      secure: config.secure || true,
      reconnection: config.reconnection || true,
      auth: config.auth,
    });

    // socket.on('connect_error', (err: Error) => {
    //   console.error(`Connection error: ${config.endpoint}`, err.message);
    // });

    socket.on('disconnect', () => {
      console.log(`Disconnected from ${config.endpoint}`);
    });

    return socket;
  }
}
