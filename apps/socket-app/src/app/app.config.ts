import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';

import { provideSocketManager } from '@lib/shared/socket-manager';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    //
    provideSocketManager([
      {
        endpoint: 'http://localhost:3001',
        auth: { token: btoa('3001') },
        listenList: ['broadcastMessage', 'watchList-data', 'portfolio-data'],
        emitList: ['joinWatchList', 'leaveWatchList', 'joinPortfolio', 'leavePortfolio'],
      },
      {
        endpoint: 'http://localhost:3002',
        listenList: ['broadcastMessage', 'time'],
        emitList: [],
      },
      {
        endpoint: 'http://localhost:3003',
        listenList: ['broadcastMessage', 'time'],
        emitList: [],
      },
    ]),
  ],
};
