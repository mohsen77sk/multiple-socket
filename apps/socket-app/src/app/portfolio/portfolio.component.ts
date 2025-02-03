import { Component, inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { AsyncPipe, NgClass } from '@angular/common';
import { SocketManagerService } from '@lib/shared/socket-manager';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrl: './portfolio.component.scss',
  encapsulation: ViewEncapsulation.None,
  imports: [AsyncPipe, NgClass],
})
export class PortfolioComponent implements OnInit, OnDestroy {
  private _socketManagerService = inject(SocketManagerService);

  stockData$!: Observable<any>;

  /**
   * On init
   */
  ngOnInit(): void {
    this._socketManagerService.emit('joinPortfolio');

    this.stockData$ = this._socketManagerService.listen<any>('portfolio-data');
  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    this._socketManagerService.emit('leavePortfolio');
  }
}
