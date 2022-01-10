import tilesUrl from "../../assets/tiles.png";
import Component, { CompassDirection } from "../Component";
import Spritesheet, { Tuple2Nums, Tuple4Nums } from "../spritesheet";
import { WalkerComponent } from "./CharacterSpritesheet";

export interface TilesComponent extends Component {
	x: number;
	y: number;
}
export interface TimeLimitComponent extends TilesComponent {
	done: ()=>void;
}
export interface GrassPatchComponent extends Component {
	x: number;
	y: number;
	width: number;
	height: number;
}
export interface PathComponent extends Component {
	type: "path",
	registerPathWalker(pathWalker:WalkerComponent):WalkerComponent;
	unregisterPathWalker(pathWalker:WalkerComponent):WalkerComponent;
	findTile(fromPoint:Tuple2Nums, toPoint:Tuple2Nums):Tuple2Nums|undefined;
	subscribeToTile(tileCoords:Tuple2Nums, callback:(walkers:WalkerComponent[])=>void):void;
	registerTower(tower:TowerComponent):TowerComponent;
	findComponent(position:Tuple2Nums):TowerComponent|WalkerComponent|undefined;
}
export interface TowerComponent extends Component {
	type: "tower",
	x: number;
	y: number;
	direction: CompassDirection;
	range: number;
	distanceToTarget?: number;
	target(walkers:WalkerComponent[]):void;
}

export function isPath(c?:Component):c is PathComponent {
	return c?.type === "path";
}
export function isTower(c?:Component):c is TowerComponent {
	return c?.type === "tower";
}

function* tracePath(path:Tuple2Nums[]) {
	const pathToProcess = [...path];
	let from = pathToProcess.shift();
	let to = pathToProcess.shift();
	while (from && to) {
		const [fromX, fromY] = from;
		const [toX, toY] = to;
		const run = toX - fromX;
		const rise = toY - fromY;
		const slope = (rise === 0) ? 0 : run / rise;
		if (run === 0) {
			const direction = (toY > fromY) ? 1 : -1;
			const diff = Math.abs(toY - fromY);
			for (let delta = 0; delta <= diff; delta++) {
				yield <Tuple2Nums> [fromX, fromY + (delta * direction)];
			}
		} else if (rise === 0) {
			const direction = (toX > fromX) ? 1 : -1;
			const diff = Math.abs(toX - fromX);
			for (let delta = 0; delta <= diff; delta++) {
				yield <Tuple2Nums> [fromX + (delta * direction), fromY];
			}
		}
		from = to;
		to = pathToProcess.shift();
	}
}

export default class TilesSpritesheet extends Spritesheet {
	async load():Promise<void> {
		return await super.load(tilesUrl, {
			"grass1": [0, 0, 16, 16],
			"ripples1": [48, 48, 16, 16],
			"ripples2": [64, 48, 16, 16],
			"ripples3": [80, 48, 16, 16],
			"ripples4": [48, 64, 16, 16],
			"ripples5": [64, 64, 16, 16],
			"ripples6": [80, 64, 16, 16],
			"path": [16, 30*16, 16, 16],
			"cannonn": [10*16, 24*16, 16, 32],
			"cannons": [10*16, 22*16, 16, 32],
			"cannone": [14*16, 27*16, 32, 32],
			"cannonw": [16*16, 27*16, 32, 32],
			"bones1": [27*16, 1*16, 16, 16],
			"bones2": [27*16, 2*16, 16, 16],
			"bones3": [27*16, 3*16, 16, 16],
			"bones4": [28*16, 2*16, 16, 16],
			"bones5": [28*16, 3*16, 16, 16],
			"bones6": [29*16, 2*16, 16, 16],
			"bones7": [29*16, 3*16, 16, 16],
			"cannonball": [12*16, 22*16, 16, 16],
		}, {
			"ripples": [
				["ripples1", 200],
				["ripples2", 200],
				["ripples3", 200],
				["ripples4", 200],
				["ripples5", 200],
				["ripples6", 200],
			],
		});
	}

	createRipples(coords?:Tuple2Nums):TilesComponent {
		const tiles = this;
		let currentTime:number = -1;
		return {
			type: "decoration",
			x: coords?.[0] ?? 0,
			y: coords?.[1] ?? 0,
			compute(_, totalTime) {
				currentTime = totalTime;
			},
			render() {
				tiles.animate("ripples", currentTime, [ this.x, this.y ], true);
			},
		};
	}

	createGrassPatch(coords:Tuple2Nums|Tuple4Nums):GrassPatchComponent {
		const tiles = this;
		return {
			type: "decoration",
			x: coords[0],
			y: coords[1],
			width: coords[2] ?? 1,
			height: coords[3] ?? 1,
			compute() {},
			render() {
				for (let c = 0; c < this.width; c++) {
					for (let r = 0; r < this.height; r++) tiles.draw("grass1", [c + this.x, r + this.y, 1, 1], true);
				}
			},
		};
	}

	createDirthPath(path:Tuple2Nums[]):PathComponent {
		const tiles = this;
		const positions:Tuple2Nums[] = [];
		for (const pos of tracePath(path)) {
			positions.push(pos);
		}
		const towers:TowerComponent[] = [];
		const pathWalkers:WalkerComponent[] = [];
		const subscriptions:Record<string,((walkers:WalkerComponent[])=>void)[]> = {};
		return {
			type: "path",
			compute(elapsedTime, totalTime) {
				const targets:Record<string,WalkerComponent[]> = {};
				for (const subKey in subscriptions) targets[subKey] = [];
				for (const walker of pathWalkers) {
					const posKey = `${Math.round(walker.x)}-${Math.round(walker.y)}`;
					if (posKey in subscriptions) {
						targets[posKey].push(walker);
					}
				}
				for (const [subKey, callbacks] of Object.entries(subscriptions)) {
					const targetsForSub = targets[subKey];
					for (const sub of callbacks) sub(targetsForSub);
				}
			},
			render() {
				for (const pos of positions) tiles.draw("path", pos, true);
			},
			registerPathWalker(pathWalker:WalkerComponent) {
				pathWalkers.push( pathWalker );
				pathWalker.setPath([...path]);
				return pathWalker;
			},
			unregisterPathWalker(pathWalker:WalkerComponent) {
				const index = pathWalkers.indexOf(pathWalker);
				if (index !== undefined) pathWalkers.splice( index, 1 );
				return pathWalker;
			},
			findTile(fromPoint:Tuple2Nums, toPoint:Tuple2Nums) {
				for (const tracePos of tracePath([fromPoint, toPoint])) {
					for (const pathPos of positions) {
						if (pathPos[0] === tracePos[0] && pathPos[1] === tracePos[1]) return pathPos;
					}
				}
			},
			subscribeToTile(tileCoords:Tuple2Nums, callback:(walkers:WalkerComponent[])=>void) {
				const key = `${tileCoords[0]}-${tileCoords[1]}`;
				if (!(key in subscriptions)) subscriptions[key] = [];
				subscriptions[key].push(callback);
			},
			registerTower(tower:TowerComponent) {
				const origin:Tuple2Nums = [tower.x, tower.y];
				const toPoint:Tuple2Nums = [...origin];
				const { direction, range } = tower;
				if (direction === "n") {
					toPoint[1] -= range;
				} else if (direction === "s") {
					toPoint[1] += range;
				} else if (direction === "e") {
					toPoint[0] += range;
				} else if (direction === "w") {
					toPoint[0] -= range;
				}
				const pathTile = this.findTile(origin, toPoint);
				if (pathTile) {
					this.subscribeToTile(pathTile, walkers => tower.target(walkers));
					const a = pathTile[0] - origin[0];
					const b = pathTile[1] - origin[1];
					tower.distanceToTarget = 
						(a === 0) ? Math.abs(b):
						(b === 0) ? Math.abs(a):
						Math.sqrt((a*a)+(b*b));
				}
				towers.push(tower);
				return tower;
			},
			findComponent(position:Tuple2Nums):TowerComponent|WalkerComponent|undefined {
				const [x, y] = position;
				for (const t of towers) {
					if (t.x === x && t.y === y) return t;
				}
				for (const w of pathWalkers) {
					if (w.x === x && w.y === y) return w;
				}
			},
		}
	}

	createCannon(coords:Tuple2Nums, direction:CompassDirection):TowerComponent {
		const tiles = this;
		let walkersInRange:WalkerComponent[]|undefined;
		let lastShot:number = 0;
		let balls:TimeLimitComponent[] = [];
		const timeBetweenShots = 2000;
		return {
			type: "tower",
			x: coords[0],
			y: coords[1],
			direction,
			range: 10,
			compute(elapsedTime, totalTime) {
				if (walkersInRange?.length) {
					if (totalTime - lastShot >= timeBetweenShots) {
						lastShot = totalTime;
						for (const w of walkersInRange) {
							w.shoot(15);
							const ball = tiles.createCannonball(coords, direction, this.distanceToTarget || this.range);
							ball.done = () => {
								// FIFO
								balls.shift();
							};
							balls.push(ball);
						}
					}
					// Walkers won't necessarily remain in range, so we need to clear this cache once we've processed it
					walkersInRange = undefined;
				}
				for (const ball of balls) ball.compute(elapsedTime, totalTime);
			},
			render() {
				const { direction:d } = this;
				for (const ball of balls) ball.render();
				if (d === "n" || d === "s" || d === "e") {
					tiles.draw(`cannon${d}`, [this.x, this.y - 1]);
				} else {
					tiles.draw(`cannon${d}`, [this.x - 1, this.y - 1]);
				}
			},
			target(walkers:WalkerComponent[]):void {
				walkersInRange = walkers.filter(w => w.life > 0);
			},
		};
	}

	createCannonball(from:Tuple2Nums, direction:CompassDirection, range:number):TimeLimitComponent {
		const tiles = this;
		const msPerTile = 30;
		let flightTime = msPerTile * range;
		let isDone = false;
		// The E|W facing cannons are not dead-center to their tiles
		const vertShift = (direction === "e" || direction === "w") ? -0.5 : 0;
		return {
			type: "decoration",
			x: from[0],
			y: from[1] + vertShift,
			done: () => {},
			compute(elapsedTime, totalTime) {
				if (isDone) return;
				flightTime -= elapsedTime;
				if (flightTime <= 0) {
					flightTime = 0;
					isDone = true;
					this.done();
				}
				const distance = elapsedTime / msPerTile;
				if (direction === "n") {
					this.y -= distance;
				} else if (direction === "s") {
					this.y += distance;
				} else if (direction === "e") {
					this.x += distance;
				} else if (direction === "w") {
					this.x -= distance;
				}
			},
			render() {
				if (isDone) return;
				tiles.draw("cannonball", [this.x, this.y]);
			},
		};
	}

	createBones(position:Tuple2Nums):TimeLimitComponent {
		const tiles = this;
		let duration = 8000;
		const boneIndex = Math.round(Math.random() * 6) + 1;
		let isDone = false;
		return {
			type: "decoration",
			x: position[0],
			y: position[1],
			done: ()=>{},
			compute(elapsedTime, totalTime) {
				if (isDone) return;
				duration -= elapsedTime;
				if (duration < 0) {
					isDone = true;
					this.done();
				}
			},
			render() {
				if (isDone) return;
				tiles.draw(`bones${boneIndex}`, position, true);
			}
		};
	}
}