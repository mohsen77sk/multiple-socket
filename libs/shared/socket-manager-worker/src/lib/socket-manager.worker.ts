import { io, Socket } from 'socket.io-client';
import { SocketConfig } from './socket-manager.types';

const _sockets: Record<
  string,
  {
    socket: Socket;
    emitList: Array<string>;
    listenList: Array<string>;
  }
> = {};

self.addEventListener('message', (event) => {
  if (event.data.type === 'init') {
    const _initConfig = event.data.config as SocketConfig[];
    _initConfig.forEach((config) => {
      if (!_sockets[config.endpoint]) {
        _sockets[config.endpoint] = {
          socket: _connect(config),
          emitList: config.emitList,
          listenList: config.listenList,
        };
      }
    });
    //
  } else if (event.data.type === 'connect') {
    const config = event.data.data as SocketConfig;
    if (_sockets[config.endpoint]) {
      _sockets[config.endpoint].socket.connect();
    } else {
      _sockets[config.endpoint] = {
        socket: _connect(config),
        emitList: config.emitList,
        listenList: config.listenList,
      };
    }
  }
  //
  else if (event.data.type === 'disconnect') {
    _sockets[event.data.server].socket.disconnect();
    if (_sockets[event.data.data]) {
      _sockets[event.data.data].socket.disconnect();
    }
  }
  //
  else if (event.data.type === 'disconnectAll') {
    Object.values(_sockets).forEach((socket) => {
      socket.socket.disconnect();
    });
  }
  //
  else if (event.data.type === 'send') {
    const sockets = Object.values(_sockets).filter((socket) => socket.emitList.some((x) => x === event.data.event));
    sockets.find((s) => s.socket.connected)?.socket.emit(event.data.event, event.data.data);
  }
});

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
function _connect(config: SocketConfig): Socket {
  const socket = io(config.endpoint, {
    transports: ['websocket'],
    secure: config.secure || true,
    reconnection: config.reconnection || true,
    auth: config.auth,
  });

  socket.on('connect', () => {
    console.log(`Connect to ${config.endpoint}`);
    self.postMessage({ type: 'connect', server: config.endpoint });
  });

  socket.onAny((eventName, eventData) => {
    // console.log(
    //   `Received message: { server: ${config.endpoint} - event: ${eventName} - data: ${JSON.stringify(eventData)}}`
    // );
    self.postMessage({ type: 'message', server: config.endpoint, data: { event: eventName, data: eventData } });
  });

  socket.on('disconnect', () => {
    console.log(`Disconnected from ${config.endpoint}`);
    self.postMessage({ type: 'disconnect', server: config.endpoint });
  });

  socket.on('connect_error', (err: Error) => {
    console.error(`Connection error: ${config.endpoint}`, err.message);
  });

  return socket;
}
