import { ChangeDetectionStrategy, Component, HostListener, OnInit } from '@angular/core';
import { BehaviorSubject, interval, map, merge, Observable, scan, shareReplay, Subject, switchMapTo, takeUntil, takeWhile, tap, timer } from 'rxjs';
import { replaceCharAt } from '../util/string.util';
import { Direction, GameState } from './game-state';


@Component({
  selector: 'app-car-race',
  templateUrl: './car-race.component.html',
  styleUrls: ['./car-race.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CarRaceComponent implements OnInit {

  public ticks$?: Observable<number>;
  public gameState$: Observable<GameState> = new BehaviorSubject(GameState.initialize(20, 10));

  private commands$ = new Subject<Direction>();

  constructor() {
  }

  ngOnInit(): void {
  }

  @HostListener('document:keyup.ArrowLeft')
  onLeft() {
    this.commands$.next('LEFT');
  }

  @HostListener('document:keyup.ArrowRight')
  onRight() {
    this.commands$.next('RIGHT');
  }

  onStopClick() {
    this.commands$.next('STOP');
  }

  onStartClick() {
    this.gameState$ = merge(
      interval(150).pipe(map<number, Direction>((_) => 'FORWARD')),
      this.commands$
    ).pipe(
      scan((current, direction) => current.move(direction), GameState.initialize(20, 10)),
      takeWhile(gameState => gameState.status === 'PLAY', true),
      shareReplay(),
    );
  }
}

