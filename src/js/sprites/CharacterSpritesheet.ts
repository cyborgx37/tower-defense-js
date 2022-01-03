import characterUrl from "../../assets/character.png";
import Component from "../Component";
import Spritesheet, { Tuple2Nums, Tuple4Nums } from "../spritesheet";

export interface CharacterComponent extends Component {
	direction: "n"|"e"|"s"|"w";
	done: boolean;
	path: Tuple2Nums[];
	speed: number;
	x: number;
	y: number;
	life: number;
	lifeMax: number;
	lifePct: number;
}

export default class CharacterSpritesheet extends Spritesheet {
	async load():Promise<void> {
		return await super.load(characterUrl, {
			"runnings1": [9*16, 0, 16, 32],
			"runnings2": [10*16, 0, 16, 32],
			"runnings3": [11*16, 0, 16, 32],
			"runnings4": [12*16, 0, 16, 32],
		}, {
			"runnings": [
				["runnings1", 200],
				["runnings2", 200],
				["runnings3", 200],
				["runnings4", 200],
			],
		});
	}

	createRunningGuy(path:Tuple2Nums[]):CharacterComponent {
		const character = this;
		let currentTime:number = -1;
		let currentFrom = path.shift();
		let currentTo = path.shift();
		return {
			direction: "s",
			done: false,
			path,
			speed: 1, // standard tiles per second
			x: currentFrom?.[0] ?? 0,
			y: currentFrom?.[1] ?? 0,
			life: 32,
			lifeMax: 32,
			lifePct: 1,
			compute(elapsedTime, totalTime) {
				if (this.done) return;
				currentTime = totalTime;
				this.lifePct = this.life / this.lifeMax;
				if (currentTo) {
					const run = currentTo[0] - this.x;
					const rise = currentTo[1] - this.y;
					const distanceRemaining = Math.sqrt( (run * run) + (rise * rise) );
					const distanceTravelled = (elapsedTime * this.speed) / 1000;
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
				} else {
					this.done = true;
				}
			},
			render() {
				if (this.done) return;
				character.animate(`running${this.direction}`, currentTime, [ this.x, this.y - 1]);
				character.camera.fillRect([this.x + 0.1, this.y - 0.8, 0.8 * this.lifePct, 0.2], "#FF0000AA");
				character.camera.strokeRect([this.x + 0.1, this.y - 0.8, 0.8, 0.2], "black");
			},
		};
	}
}