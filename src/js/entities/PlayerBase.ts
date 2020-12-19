import { Angle, Vector2 } from "phaser/src/math";
import GameScene from "../scenes/GameScene";
import Team from "./Team";
import { PlayerProps } from "../types";
import { TIME_DELTA_MILI } from "../constants";
import Info from "./Info";

export enum Modes {
  Track,
  Seek,
  Pursuit,
  Interpose,
}

export default class PlayerBase extends Phaser.Physics.Arcade.Sprite {
  public scene: GameScene;
  public body: Phaser.Physics.Arcade.Body;
  public team: Team;
  public info: Info;
  public home: Vector2;
  public target: Vector2;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    frame: number,
    props: PlayerProps,
    index: number,
    name: string,
    home: Vector2,
    team: Team
  ) {
    super(scene, x, y, "sprites", frame);

    this.home = home;
    this.team = team;

    this.scene.add.existing(this);
    this.scene.physics.world.enable(this);

    this.setData(props);
    this.setData({
      name,
      index,
      isReadyForNextKick: true,
      mode: Modes.Track,
    });
    this.setSize(16, 16);
    this.setCircle(8);
    this.setDepth(3);

    this.info = new Info(this.scene, index, team.isLeft);

    this.scene.events.on(
      "postupdate",
      function () {
        this.info.x = this.x;
        this.info.y = this.y;
      },
      this
    );
  }

  public movePlayer(delta: number): void {
    const [speed, mode] = this.getData(["speed", "mode"]);

    switch (mode) {
      case Modes.Pursuit:
        const ballSpeed = this.scene.ball.body.speed;
        const magnitude = this.scene.ball.position
          .clone()
          .subtract(this.position)
          .length();

        let lookAheadTime = 0;

        if (ballSpeed !== 0) {
          lookAheadTime = magnitude / ballSpeed;
        }

        this.setTarget(this.scene.ball.futurePosition(lookAheadTime));
      case Modes.Seek:
        const targetAngle = Angle.BetweenPoints(this.position, this.target);

        this.setRotation(targetAngle);
        this.setVelocity(
          speed * delta * Math.cos(targetAngle),
          speed * delta * Math.sin(targetAngle)
        );
        break;
      case Modes.Track:
        this.setVelocity(0, 0);
        this.setRotation(
          Angle.BetweenPoints(this.position, this.scene.ball.position)
        );
        break;
      case Modes.Interpose:
        const targetAn = Angle.BetweenPoints(
          this.position,
          this.scene.ball.position
        );

        this.setTarget(this.rearInterposeTarget);

        const distance2 = this.position.distance(this.target);

        var temp1 = new Phaser.Math.Vector2(
          this.scene.ball.position.x - this.target.x,
          this.scene.ball.position.y - this.target.y
        ).normalize();
        var temp2 = new Phaser.Math.Vector2(
          this.target.x + temp1.x * distance2,
          this.target.y + temp1.y * distance2
        );

        const targetAngle2 = Angle.BetweenPoints(this.position, temp2);

        this.setRotation(targetAn);
        this.setVelocity(
          speed * delta * Math.cos(targetAngle2),
          speed * delta * Math.sin(targetAngle2)
        );
        break;
    }
  }

  public setMode(value: Modes): this {
    this.setData({ mode: value });

    return this;
  }

  public setTarget(value: Vector2): this {
    this.target = value;

    return this;
  }

  public setHome(value: Vector2): this {
    this.home = value;

    return this;
  }

  public returnHomeIfWaiting(target: Vector2): this {
    return this;
  }

  public passToRequester(receiver: PlayerBase): this {
    return this;
  }

  public isCloseToHome(epsilon: number = 10): boolean {
    return this.position.fuzzyEquals(this.home, epsilon);
  }

  public isCloseToTarget(epsilon: number = 10): boolean {
    return this.position.fuzzyEquals(this.target, epsilon);
  }

  public inHomeRegion(): boolean {
    return this.isCloseToHome(96);
  }

  public get isAtHome(): boolean {
    return this.isCloseToHome();
  }

  public get isAtTarget(): boolean {
    return this.isCloseToTarget();
  }

  public get position(): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(this.x, this.y);
  }

  public get facing(): Vector2 {
    return new Vector2(1, 0).setAngle(this.rotation);
  }

  public get speedPerSecond(): number {
    return this.speedPerFrame * TIME_DELTA_MILI;
  }

  public get speedPerFrame(): number {
    return this.getData("speed");
  }

  public get isReadyForNextKick(): boolean {
    return this.getData("isReadyForNextKick");
  }

  public get role(): string {
    return this.getData("role");
  }

  public get isClosestPlayerOnPitchToBall(): boolean {
    return this === this.team.closestPlayerOnPitchToBall;
  }

  public get isClosestPlayerToBall(): boolean {
    return this === this.team.closestPlayer;
  }

  public get rearInterposeTarget(): Phaser.Math.Vector2 {
    var x = this.team.goalHome.position.x;
    var y =
      this.scene.pitch.height / 2 +
      64 -
      this.team.goalHome.height / 2 +
      this.team.goalHome.height *
        ((this.scene.ball.position.y - 64) / this.scene.pitch.height);

    return new Phaser.Math.Vector2(x, y);
  }
}
