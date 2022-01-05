import characterUrl from "../../assets/character.png";
import Component, { CompassDirection } from "../Component";
import Spritesheet, { Tuple2Nums, Tuple4Nums } from "../spritesheet";
import { TowerComponent } from "./TilesSpritesheet";

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
			"runnings1": [0*16,  0*32, 16, 32],
			"runnings2": [1*16, 0*32, 16, 32],
			"runnings3": [2*16, 0*32, 16, 32],
			"runnings4": [3*16, 0*32, 16, 32],
			"runninge1": [0*16,  1*32, 16, 32],
			"runninge2": [1*16, 1*32, 16, 32],
			"runninge3": [2*16, 1*32, 16, 32],
			"runninge4": [3*16, 1*32, 16, 32],
			"runningn1": [0*16,  2*32, 16, 32],
			"runningn2": [1*16, 2*32, 16, 32],
			"runningn3": [2*16, 2*32, 16, 32],
			"runningn4": [3*16, 2*32, 16, 32],
			"runningw1": [0*16,  3*32, 16, 32],
			"runningw2": [1*16, 3*32, 16, 32],
			"runningw3": [2*16, 3*32, 16, 32],
			"runningw4": [3*16, 3*32, 16, 32],
			"swordings1": [0*32, 4*32, 32, 32],
			"swordings2": [1*32, 4*32, 32, 32],
			"swordings3": [2*32, 4*32, 32, 32],
			"swordings4": [3*32, 4*32, 32, 32],
			"swordingn1": [0*32, 5*32, 32, 32],
			"swordingn2": [1*32, 5*32, 32, 32],
			"swordingn3": [2*32, 5*32, 32, 32],
			"swordingn4": [3*32, 5*32, 32, 32],
			"swordinge1": [0*32, 6*32, 32, 32],
			"swordinge2": [1*32, 6*32, 32, 32],
			"swordinge3": [2*32, 6*32, 32, 32],
			"swordinge4": [3*32, 6*32, 32, 32],
			"swordingw1": [0*32, 7*32, 32, 32],
			"swordingw2": [1*32, 7*32, 32, 32],
			"swordingw3": [2*32, 7*32, 32, 32],
			"swordingw4": [3*32, 7*32, 32, 32],
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
			"swordings": [
				["swordings1", 150],
				["swordings2", 50],
				["swordings3", 50],
				["swordings4", 50],
			],
			"swordingn": [
				["swordingn1", 150],
				["swordingn2", 50],
				["swordingn3", 50],
				["swordingn4", 50],
			],
			"swordinge": [
				["swordinge1", 150],
				["swordinge2", 50],
				["swordinge3", 50],
				["swordinge4", 50],
			],
			"swordingw": [
				["swordingw1", 150],
				["swordingw2", 50],
				["swordingw3", 50],
				["swordingw4", 50],
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

	createSworder(coords:Tuple2Nums, direction:CompassDirection):TowerComponent {
		const character = this;
		let currentTime:number = -1;
		let walkersInRange:WalkerComponent[]|undefined;
		let lastShot:number = 0;
		let attacking = 0;
		const timeBetweenShots = 300;
		return {
			type:"tower",
			direction,
			x: coords[0],
			y: coords[1],
			range: 2,
			compute(elapsedTime, totalTime) {
				currentTime = totalTime;
				if (attacking > 0) attacking -= elapsedTime;
				if (attacking < 0) attacking = 0;
				if (!walkersInRange?.length) return;
				if (totalTime - lastShot >= timeBetweenShots) {
					lastShot = totalTime;
					walkersInRange[0].shoot(5);
					attacking = 300;
				}
				// Walkers won't necessarily remain in range, so we need to clear this cache once we've processed it
				walkersInRange = undefined;
			},
			render() {
				if (attacking > 0) {
					character.animate(`swording${this.direction}`, attacking, [
						this.x,
						this.y - 1,
					]);
				} else {
					character.draw(`swording${this.direction}1`, [this.x, this.y - 1])
				}
			},
			target(walkers:WalkerComponent[]):void {
				walkersInRange = walkers.filter(w => w.life > 0);
			},
		};
	}
}