import {updateUi} from "../utils";
import {Goal, Score, SoccerBall, SoccerPitch, SoccerTeam, Clock} from "../gameObjects";
import {teams} from "../constants";

export default class PitchScene extends Phaser.Scene {
  private _pitch: SoccerPitch;
  private _ball: SoccerBall;
  private _teamA: SoccerTeam;
  private _teamB: SoccerTeam;
  private _goalA: Goal;
  private _goalB: Goal;
  private _score: Score;
  private _clock: Clock;
  private _counter: number = 0; // seconds

  constructor() {
    super({
      key: "pitch",
      active: false,
      visible: false,
    });
  }

  public init() {
    this.data.set(
      {
        goalkeeperHasBall: false,
        gameOn: false,
        ballInGoal: false,
      },
      false
    );
  }

  public create() {

    let me = this;
    this.input.keyboard.on('keydown-A', function (event) {
      me._teamA.kickOff();
      me._teamB.kickOff();
    });
    this._pitch = new SoccerPitch(this);
    this._goalA = new Goal(this, this.pitch.x, this.pitch.midpoint.y, 1);
    this._goalB = new Goal(
      this,
      this.pitch.x + this.pitch.width,
      this.pitch.midpoint.y,
      -1
    );
    this._ball = new SoccerBall(
      this,
      this.pitch.midpoint.x,
      this.pitch.midpoint.y
    );
    this._teamA = new SoccerTeam(this, teams[0], true, this.goalB, this.goalA);
    this._teamB = new SoccerTeam(this, teams[1], false, this.goalA, this.goalB);
    this._score = new Score(this, this.game.renderer.width / 2, 8);
    this._clock = new Clock(this, 10, 8);

    this.time.addEvent({ delay: 100, callback: this.onSecondEvent, callbackScope: this, loop: true });

    this.teamA.setOpponents(this.teamB);
    this.teamB.setOpponents(this.teamA);

    this.physics.add.collider(this.teamA, this.teamB);
    this.physics.add.collider(this.teamB, this.teamA);
    this.physics.add.collider(this._ball, [this.goalA, this.goalB, this.pitch]);
    this.physics.add.collider(
      [this.teamA, this.teamB],
      [this.goalA, this.goalB, this.pitch]
    );
  }

  private onSecondEvent()
  {
    this._counter++;
  }

  private static formatTime(seconds){
    const minutes = Math.floor(seconds/60);
    let partInSeconds = seconds % 60;
    let secs = partInSeconds.toString().padStart(2,'0');
    let mins = minutes.toString().padStart(2,'0');
    return `${mins}:${secs}`;
  }

  public update() {
    this._clock.setText(PitchScene.formatTime(this._counter));
    if (this.data.get("ballInGoal")) {
      if (!this.goalA.isBallInGoal && !this.goalB.isBallInGoal) {
        this.data.set("ballInGoal", false);
      }
    } else {
      if (this.goalA.isBallInGoal) {
        this.goalA.incrementScore();
        this._score.setText(`${this.goalB.scored}-${this.goalA.scored}`);
        this.data.set("ballInGoal", true);
      } else if (this.goalB.isBallInGoal) {
        this.goalB.incrementScore();
        this._score.setText(`${this.goalB.scored}-${this.goalA.scored}`);
        this.data.set("ballInGoal", true);
      }
    }

    updateUi(this);
  }

  public setGoalkeeperHasBall(value: boolean) {
    this.data.set("goalkeeperHasBall", value);
  }

  public setGameOn(value: boolean) {
    this.data.set("gameOn", value);
  }

  public get goalkeeperHasBall(): boolean {
    return this.data.get("goalkeeperHasBall");
  }

  public get gameOn(): boolean {
    return this.data.get("gameOn");
  }

  public get pitch(): SoccerPitch {
    return this._pitch;
  }

  public get ball(): SoccerBall {
    return this._ball;
  }

  public get teamA(): SoccerTeam {
    return this._teamA;
  }

  public get teamB(): SoccerTeam {
    return this._teamB;
  }

  public get goalA(): Goal {
    return this._goalA;
  }

  public get goalB(): Goal {
    return this._goalB;
  }
}
