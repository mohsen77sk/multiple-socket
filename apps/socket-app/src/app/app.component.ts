import { AsyncPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SocketManagerService } from '@lib/shared/socket-manager';
import { Observable, tap } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [RouterModule, AsyncPipe],
})
export class AppComponent implements OnInit {
  private _socketManagerService = inject(SocketManagerService);

  title = 'socket-app';
  time$!: Observable<string>;
  stockData$!: Observable<any>;

  /**
   * On init
   */
  ngOnInit(): void {
    this._socketManagerService
      .listen<string>('broadcastMessage')
      .pipe(tap((message) => console.log(message)))
      .subscribe();

    this.time$ = this._socketManagerService.listen<string>('time');
  }
}
