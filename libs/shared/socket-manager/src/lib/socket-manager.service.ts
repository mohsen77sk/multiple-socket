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

  /**
   * Emits an event to the connected socket with the provided data.
   *
   * @param event - The name of the event to emit.
   * @param data - The data to send with the event.
   *
   * @returns {void}
   *
   * @remarks
   * This function finds the first connected socket that is configured to emit the given event.
   * If no such socket is found, it logs an error message to the console and returns early.
   * Otherwise, it emits the event with the provided data to the selected socket.
   */
  emit(event: string, data: unknown): void {
    const socketKey = Object.keys(this._sockets).find(
      (key) => this._sockets[key].emitList.some((x) => x === event) && this._sockets[key].socket.connected
    );

    if (!socketKey) {
      console.error(`No active socket found for emit event: ${event}`);
      return;
    }

    this._sockets[socketKey].socket.emit(event, data);
  }

  /**
   * Listens for a specific event on the connected socket and returns an Observable.
   *
   * @template T - The type of data expected to be received from the socket event.
   * @param {string} event - The name of the event to listen for.
   * @returns {Observable<T | never>} An Observable that emits data of type T when the event occurs,
   *                                  or never emits if no active socket is found for the event.
   *
   * @description
   * This function searches for an active socket that is configured to listen for the specified event.
   * If found, it sets up a listener on that socket and returns an Observable that emits the received data.
   * If no active socket is found for the event, it logs an error and returns an empty Observable.
   */
  listen<T>(event: string): Observable<T | never> {
    const socketKey = Object.keys(this._sockets).find(
      (key) => this._sockets[key].listenList.some((x) => x === event) && this._sockets[key].socket.connected
    );

    if (!socketKey) {
      console.error(`No active socket found for listen event: ${event}`);
      return EMPTY;
    }

    return new Observable((observer) => {
      this._sockets[socketKey].socket.on(event, (data: T) => {
        observer.next(data);
      });
    });
  }

  /**
   * Listens for a specific event on all connected sockets that are configured to listen for it.
   *
   * @template T - The type of data expected to be received from the socket event.
   * @param {string} event - The name of the event to listen for across all applicable sockets.
   * @returns {Observable<T | never>} An Observable that emits data of type T when the event occurs on any of the listening sockets,
   *                                  or never emits if no sockets are found for the event.
   *
   * @description
   * This function searches for all sockets that are configured to listen for the specified event.
   * It sets up listeners on all matching sockets and returns an Observable that emits the received data from any of these sockets.
   * If no sockets are found for the event, it logs an error and returns an empty Observable.
   */
  listenAll<T>(event: string): Observable<T | never> {
    const socketKeys = Object.keys(this._sockets).filter((key) =>
      this._sockets[key].listenList.some((x) => x === event)
    );

    if (socketKeys.length === 0) {
      console.error(`No socket found for listen event: ${event}`);
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

  /**
   * Establishes a connection to a socket or creates a new socket connection based on the provided configuration.
   *
   * @param {SocketConfig} config - The configuration object for the socket connection.
   *
   * @returns {void}
   *
   * @description
   * If a socket for the given endpoint already exists, it reconnects to that socket.
   * If no socket exists for the endpoint, it creates a new socket connection using the provided configuration.
   */
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

  /**
   * Disconnects a specific socket connection.
   *
   * @param {string} key - The unique identifier for the socket connection to be disconnected.
   *                       This should match a key in the internal `_sockets` object.
   *
   * @returns {void}
   *
   * @description
   * This method attempts to disconnect a specific socket connection identified by the provided key.
   * If a socket with the given key exists in the internal `_sockets` object, it calls the `disconnect`
   * method on that socket. If no socket is found for the given key, this method does nothing.
   */
  disconnect(key: string): void {
    if (this._sockets[key]) {
      this._sockets[key].socket.disconnect();
    }
  }

  /**
   * Disconnects all active socket connections managed by this service.
   *
   * @description
   * This method iterates through all socket connections stored in the internal `_sockets` object
   * and calls the `disconnect` method on each socket. This effectively closes all open
   * WebSocket connections that were established and managed by this SocketManagerService.
   *
   * @returns {void} This method does not return a value.
   */
  disconnectAll(): void {
    Object.values(this._sockets).forEach((socket) => socket.socket.disconnect());
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Establishes a new socket connection based on the provided configuration.
   *
   * @param {SocketConfig} config - The configuration object for the socket connection.
   *
   * @returns {Socket} A new Socket instance connected to the specified endpoint.
   */
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
