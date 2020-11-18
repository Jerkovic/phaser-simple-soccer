import { PlayerProps } from "../types";
import PlayerBase from "./PlayerBase";

enum States {
  GlobalKeeperState = 0,
  TendGoal = 1,
  ReturnHome = 2,
  PutBallBackInPlay = 3,
  InterceptBall = 4,
}

export default class PlayerKeeper extends PlayerBase {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    frame: number,
    props: PlayerProps
  ) {
    super(scene, x, y, frame, props);
  }

  public setState(value: number): this {
    switch (value) {
      case States.TendGoal:
        break;
    }

    return super.setState(value);
  }

  public preUpdate(time: number, delta: number): void {
    switch (this.state) {
      case States.TendGoal:
        break;
    }

    super.preUpdate(time, delta);
  }
}
