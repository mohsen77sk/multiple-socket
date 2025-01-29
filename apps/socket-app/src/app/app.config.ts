import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';

import { provideMskSocketManager } from '@lib/shared/socket-manager';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    //
    provideMskSocketManager([
      { endpoint: 'http://localhost:3001', auth: { token: '3001' }, listenList: ['broadcastMessage'], emitList: [] },
      { endpoint: 'http://localhost:3002', auth: { token: '3002' }, listenList: ['broadcastMessage'], emitList: [] },
      { endpoint: 'http://localhost:3003', auth: { token: '3003' }, listenList: ['broadcastMessage'], emitList: [] },
    ]),
  ],
};
