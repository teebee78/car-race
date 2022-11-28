import { ChangeDetectionStrategy, Component, HostListener, OnInit } from '@angular/core';
import { BehaviorSubject, interval, map, merge, Observable, scan, shareReplay, Subject, switchMapTo, takeUntil, takeWhile, tap, timer } from 'rxjs';
import { replaceCharAt } from '../util/string.util';

type Direction = 'FORWARD' | 'LEFT' | 'RIGHT' | 'STOP';
type GameStatus = 'INITIALIZED' | 'PLAY' | 'GAME_OVER';

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

  @HostListener('document:keyup.ArrowLeft', ['$event'])
  onLeft(event: any) {
    this.commands$.next('LEFT');
  }

  @HostListener('document:keyup.ArrowRight', ['$event'])
  onRight(event: any) {
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

export class GameState {

  static initialize(streets: number, lanes: number): GameState {
    var street = [];
    for (let streetIndex = 0; streetIndex < streets-1; streetIndex++) {
      street.push(' '.repeat(lanes));
    }
    street.push(replaceCharAt(' '.repeat(lanes), lanes / 2, 'p'));
    return new GameState('INITIALIZED', 0, street);
  }

  constructor(public status: GameStatus, public score: number, public street: string[]) {
  }

  public move(direction: Direction): GameState {
    switch (direction) {
      case 'FORWARD': return this.forward();
      case 'LEFT': return this.steer(-1);
      case 'RIGHT': return this.steer(1);
      case 'STOP': return this.stop();
    }
  }

  private stop(): GameState {
    return new GameState('GAME_OVER', this.score, this.street);
  }

  private forward(): GameState {
    const playersCarPosition = this.playersCarPosition();
    if (this.street[this.street.length - 2][playersCarPosition] !== ' ') {
      return new GameState('GAME_OVER', this.score, this.street);
    }

    const addCar = Math.random() * 2 > 1;
    const newCarPosition = Math.floor(Math.random() * this.street[0].length);
    var newLine = addCar
      ? ' '.repeat(newCarPosition) + this.randomColor() + ' '.repeat(this.street[0].length - newCarPosition - 1)
      : ' '.repeat(this.street[0].length);

    var newStreet = [newLine, ... this.street.slice(0, -1)];
    var last = newStreet[newStreet.length - 1];
    var newLast = last.substring(0, playersCarPosition) + 'p' + last.substring(playersCarPosition+ 1, newStreet.length - 1);
    newStreet[newStreet.length - 1] = newLast;

    return new GameState('PLAY', this.score + 1, newStreet);
  }

  private steer(steerAmount: number): GameState {
    const playersCarPosition = this.playersCarPosition();
    var newCarPosition = Math.max(0, Math.min(playersCarPosition+ steerAmount, this.street[0].length - 1));
    if (newCarPosition !== playersCarPosition && this.street[this.street.length - 1][newCarPosition] !== ' ') {
      return new GameState('GAME_OVER', this.score, this.street);
    }
    var newStreet = [... this.street];
    const last = newStreet[newStreet.length - 1];
    const lastWithoutPlayer = replaceCharAt(last, playersCarPosition, ' ');
    newStreet[newStreet.length - 1] = replaceCharAt(lastWithoutPlayer, newCarPosition, 'p');

    return new GameState('PLAY', this.score, newStreet);
  }

  private randomColor(): string {
    const random = Math.floor(Math.random() * 3);
    return ['r', 'b', 'g'][random];
  }

  private playersCarPosition(): number {
    return this.street[this.street.length - 1].indexOf('p');
  }
}
