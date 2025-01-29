import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SocketManagerService } from '@lib/shared/socket-manager';
import { tap } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [RouterModule],
})
export class AppComponent implements OnInit {
  private _socketManagerService = inject(SocketManagerService);

  title = 'socket-app';

  /**
   * On init
   */
  ngOnInit(): void {
    this._socketManagerService
      .listenAll<string>('broadcastMessage')
      .pipe(tap((message) => console.log(message)))
      .subscribe();
  }
}
