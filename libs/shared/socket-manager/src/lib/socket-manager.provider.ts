import { inject, Provider, EnvironmentProviders, provideEnvironmentInitializer } from '@angular/core';
import { SOCKET_CONFIG } from './socket-manager.constants';
import { SocketManagerService } from './socket-manager.service';
import { SocketConfig } from './socket-manager.types';

export const provideMskSocketManager = (value: Array<SocketConfig>): Array<Provider | EnvironmentProviders> => {
  return [
    {
      provide: SOCKET_CONFIG,
      useValue: value,
    },
    provideEnvironmentInitializer(() => inject(SocketManagerService)),
  ];
};
