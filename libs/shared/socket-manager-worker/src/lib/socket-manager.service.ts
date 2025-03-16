import { inject, Injectable } from '@angular/core';
import { SOCKET_CONFIG } from './socket-manager.constants';
import { filter, fromEvent, map, merge, Observable, tap } from 'rxjs';
import { SocketConfig } from './socket-manager.types';

interface IMessage {
  type: string;
  server: string;
  data?: IMessageData;
}

interface IMessageData {
  event: string;
  data?: unknown;
}

@Injectable({ providedIn: 'root' })
export class SocketManagerService {
  private _initConfig = inject(SOCKET_CONFIG);

  private worker!: Worker;

  /**
   * Constructor
   */
  constructor() {
    if (!this._initConfig) {
      throw new Error('SocketManagerService: No configuration provided!');
    }

    this.worker = new Worker(new URL('./socket-manager.worker', import.meta.url));
    this.worker.postMessage({ type: 'init', config: this._initConfig });
  }

  get events$(): Observable<MessageEvent<IMessage>> {
    return fromEvent(this.worker, 'message') as Observable<MessageEvent>;
  }

  get connects$(): Observable<IMessage> {
    return this.events$.pipe(
      filter((x) => x.data.type === 'connect'),
      map((x) => x.data)
    );
  }

  get messages$(): Observable<IMessage> {
    return this.events$.pipe(
      filter((x) => x.data.type === 'message'),
      map((x) => x.data)
    );
  }

  get disconnects$(): Observable<IMessage> {
    return this.events$.pipe(
      filter((x) => x.data.type === 'disconnect'),
      map((x) => x.data)
    );
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  emit(event: string, data: unknown): void {
    this.worker.postMessage({ type: 'send', data: { event, data } });
  }

  listen<T>(event: string): Observable<T | never> {
    const servers = this._initConfig.filter((item) => item.listenList.some((x) => x === event)).map((x) => x.endpoint);

    let activeServer!: string | undefined;

    return merge(this.connects$, this.disconnects$, this.messages$).pipe(
      filter((x) => servers.some((y) => y === x.server)),
      tap((message) => {
        if (message.type === 'connect') {
          if (activeServer === undefined) activeServer = message.server;
        }
        if (message.type === 'disconnect') {
          if (activeServer === message.server) activeServer = undefined;
        }
        if (message.type === 'message' && message.data?.event === event && !activeServer) {
          activeServer = message.server;
        }
      }),
      filter((x) => x.type === 'message' && x.server === activeServer),
      filter((x) => x.data?.event === event),
      map((x) => x.data?.data as T)
    );
  }

  listenAll<T>(event: string): Observable<T | never> {
    return this.messages$.pipe(
      filter((x) => x.data?.event === event),
      map((x) => x.data?.data as T)
    );
  }

  connect(config: SocketConfig): void {
    this.worker.postMessage({ type: 'connect', data: config });
  }

  disconnect(key: string): void {
    this.worker.postMessage({ type: 'disconnect', data: key });
  }

  disconnectAll(): void {
    this.worker.postMessage({ type: 'disconnectAll' });
  }
}
