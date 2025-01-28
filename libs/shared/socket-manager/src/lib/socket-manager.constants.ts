import { InjectionToken } from '@angular/core';
import { SocketConfig } from './socket-manager.types';

export const SOCKET_CONFIG = new InjectionToken<SocketConfig | SocketConfig[]>('SOCKET_CONFIG');
