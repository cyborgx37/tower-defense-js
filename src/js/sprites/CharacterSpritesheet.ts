import characterUrl from "../../assets/character.png";
import Component, { CompassDirection } from "../Component";
import Spritesheet, { Tuple2Nums, Tuple4Nums } from "../spritesheet";

export interface WalkerComponent extends Component {
	direction:CompassDirection;
	done: ()=>void;
	path?: Tuple2Nums[];
	speed: number;
	x: number;
	y: number;
	life: number;
	lifeMax: number;
	lifePct: number;
	setPath(path:Tuple2Nums[]):void;
	shoot(damage:number):void;
}

export function isWalker(c:Component):c is WalkerComponent {
	return c.type === "walker";
}

export default class CharacterSpritesheet extends Spritesheet {
	async load():Promise<void> {
		return await super.load(characterUrl, {
			"runnings1": [9*16,  0*32, 16, 32],
			"runnings2": [10*16, 0*32, 16, 32],
			"runnings3": [11*16, 0*32, 16, 32],
			"runnings4": [12*16, 0*32, 16, 32],
			"runninge1": [9*16,  1*32, 16, 32],
			"runninge2": [10*16, 1*32, 16, 32],
			"runninge3": [11*16, 1*32, 16, 32],
			"runninge4": [12*16, 1*32, 16, 32],
			"runningn1": [9*16,  2*32, 16, 32],
			"runningn2": [10*16, 2*32, 16, 32],
			"runningn3": [11*16, 2*32, 16, 32],
			"runningn4": [12*16, 2*32, 16, 32],
			"runningw1": [9*16,  3*32, 16, 32],
			"runningw2": [10*16, 3*32, 16, 32],
			"runningw3": [11*16, 3*32, 16, 32],
			"runningw4": [12*16, 3*32, 16, 32],
			"crumples1": [5*16, 0*32, 16, 32],
			"crumples2": [6*16, 0*32, 16, 32],
			"crumples3": [7*16, 0*32, 16, 32],
			"crumplee1": [5*16, 1*32, 16, 32],
			"crumplee2": [6*16, 1*32, 16, 32],
			"crumplee3": [7*16, 1*32, 16, 32],
			"crumplen1": [5*16, 2*32, 16, 32],
			"crumplen2": [6*16, 2*32, 16, 32],
			"crumplen3": [7*16, 2*32, 16, 32],
			"crumplew1": [5*16, 3*32, 16, 32],
			"crumplew2": [6*16, 3*32, 16, 32],
			"crumplew3": [7*16, 3*32, 16, 32],
		}, {
			"runnings": [
				["runnings1", 200],
				["runnings2", 200],
				["runnings3", 200],
				["runnings4", 200],
			],
			"runninge": [
				["runninge1", 200],
				["runninge2", 200],
				["runninge3", 200],
				["runninge4", 200],
			],
			"runningn": [
				["runningn1", 200],
				["runningn2", 200],
				["runningn3", 200],
				["runningn4", 200],
			],
			"runningw": [
				["runningw1", 200],
				["runningw2", 200],
				["runningw3", 200],
				["runningw4", 200],
			],
			"spinning": [
				["runnings1", 50],
				["runninge2", 50],
				["runningn3", 50],
				["runningw4", 50],
			],
			"crumples": [
				["crumples2", 200],
				["crumples1", 200],
			],
			"crumplee": [
				["crumplee2", 200],
				["crumplee1", 200],
			],
			"crumplen": [
				["crumplen2", 200],
				["crumplen1", 200],
			],
			"crumplew": [
				["crumplew2", 200],
				["crumplew1", 200],
			],
		});
	}

	createRunningGuy():WalkerComponent {
		const character = this;
		let currentTime:number = -1;
		let isDone = false;
		let currentFrom:Tuple2Nums|undefined;
		let currentTo:Tuple2Nums|undefined;
		let damageIndicator = 0;
		let deathIndicator = 0;
		const offset = (Math.random() * 0.5) - 0.25;
		return {
			type: "walker",
			direction: "s",
			done: () => void 0,
			path: undefined,
			speed: 1, // standard tiles per second
			x: currentFrom?.[0] ?? 0,
			y: currentFrom?.[1] ?? 0,
			life: 32,
			lifeMax: 32,
			lifePct: 1,
			compute(elapsedTime, totalTime) {
				if (isDone) return;
				currentTime = totalTime;
				this.lifePct = this.life / this.lifeMax;
				if (damageIndicator > 0) {
					damageIndicator -= elapsedTime;
					if (damageIndicator < 0) damageIndicator = 0;
				}
				if (deathIndicator > 0) {
					deathIndicator -= elapsedTime;
					if (deathIndicator <= 0) {
						deathIndicator = 0;
						isDone = true;
						this.done();
						return;
					}
				}
				const { path } = this;
				if (!path) return;
				if (deathIndicator === 0 && path && currentTo) {
					const run = currentTo[0] - this.x;
					const rise = currentTo[1] - this.y;
					const distanceRemaining = Math.sqrt( (run * run) + (rise * rise) );
					const distanceTravelled = (elapsedTime * this.speed) / 1000;
					this.direction = (run > 0) ? "e" : (run < 0) ? "w" : (rise > 0) ? "s" : "n";
					if (distanceTravelled >= distanceRemaining) {
						currentFrom = currentTo;
						currentTo = path.shift();
						this.x = currentFrom[0];
						this.y = currentFrom[1];
					} else {
						const ratio = distanceTravelled / distanceRemaining;
						this.x += (run * ratio);
						this.y += (rise * ratio);
					}
				} else if (deathIndicator > 0) {

				} else {
					// Presumably we've reached the end of the path
					isDone = true;
					this.done();
				}
			},
			render() {
				if (isDone) return;
				if (deathIndicator > 0) {
					character.animate(`crumple${this.direction}`, 400 - deathIndicator, [
						this.x + offset,
						this.y - 1 + offset,
					]);
				} else if (damageIndicator > 0) {
					character.animate(`spinning`, 400 - damageIndicator, [
						this.x + offset,
						this.y - 1 + offset,
					]);
				} else  {
					character.animate(`running${this.direction}`, currentTime, [
						this.x + offset,
						this.y - 1 + offset,
					]);
				}
				character.camera.fillRect([
					this.x + 0.1 + offset,
					this.y - 0.8 + offset,
					0.8 * this.lifePct,
					0.2,
				], "#FF0000AA");
				character.camera.strokeRect([
					this.x + 0.1 + offset,
					this.y - 0.8 + offset,
					0.8,
					0.2,
				], "black");
			},
			setPath(path:Tuple2Nums[]) {
				this.path = path;
				currentFrom = path.shift();
				currentTo = path.shift();
				this.x = currentFrom?.[0] ?? -1;
				this.y = currentFrom?.[1] ?? -1;
			},
			shoot(damage:number) {
				this.life -= damage;
				damageIndicator = 400;
				if (this.life <= 0) {
					this.life = 0;
					deathIndicator = 400;
				}
			},
		};
	}
}