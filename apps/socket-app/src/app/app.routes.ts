import { Route } from '@angular/router';
import { WatchListComponent } from './watch-list/watch-list.component';
import { PortfolioComponent } from './portfolio/portfolio.component';

export const appRoutes: Route[] = [
  { path: '', redirectTo: '/watch-list', pathMatch: 'full' },
  // Add more routes here...
  { path: 'watch-list', component: WatchListComponent },
  { path: 'portfolio', component: PortfolioComponent },
];
