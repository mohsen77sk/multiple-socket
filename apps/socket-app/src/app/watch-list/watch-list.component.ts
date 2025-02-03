import { Component, inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { AsyncPipe, NgClass } from '@angular/common';
import { Observable } from 'rxjs';
import { SocketManagerService } from '@lib/shared/socket-manager';

@Component({
  selector: 'app-watch-list',
  templateUrl: './watch-list.component.html',
  styleUrl: './watch-list.component.scss',
  encapsulation: ViewEncapsulation.None,
  imports: [AsyncPipe, NgClass],
})
export class WatchListComponent implements OnInit, OnDestroy {
  private _socketManagerService = inject(SocketManagerService);

  stockData$!: Observable<any>;

  /**
   * On init
   */
  ngOnInit(): void {
    this._socketManagerService.emit('joinWatchList');

    this.stockData$ = this._socketManagerService.listen<any>('watchList-data');
  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    this._socketManagerService.emit('leaveWatchList');
  }
}
