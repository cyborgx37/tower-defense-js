import tilesUrl from "../../assets/tiles.png";
import Component from "../Component";
import Spritesheet, { Tuple2Nums, Tuple4Nums } from "../spritesheet";

export interface TilesComponent extends Component {
	x: number;
	y: number;
}
export interface GrassPatchComponent extends Component {
	x: number;
	y: number;
	width: number;
	height: number;
}
export interface DirthPathComponent extends Component {}

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
			"path": [16, 30*16, 16, 16]
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

	createDirthPath(path:Tuple2Nums[]):Component {
		const tiles = this;
		const positions:Tuple2Nums[] = [];
		let from = path.shift();
		let to = path.shift();
		while (from && to) {
			const [fromX, fromY] = from;
			const [toX, toY] = to;
			const run = toX - fromX;
			const rise = toY - fromY;
			const slope = (rise === 0) ? 0 : run / rise;
			if (run === 0) {
				const direction = (toY > fromY) ? 1 : -1;
				for (let y = fromY; y <= toY; y += direction) {
					positions.push([fromX, y]);
				}
			} else if (rise === 0) {
				const direction = (toX > fromX) ? 1 : -1;
				for (let x = fromX; x <= toX; x += direction) {
					positions.push([x, fromY]);
				}

			// It'd be great to work out angled paths at some point, but as I'm not planning on doing these in the near
			// future I'll save them for future-JD to work on:
			// } else if (run > 0 && slope <= 1) {
			// 	const direction = (toX > fromX) ? 1 : -1;
			// 	for (let x = fromX; x <= toX; x += direction) {
			// 		const y = Math.round(slope * x) + fromY;
			// 		positions.push([x, y]);
			// 	}
			// } else {
			// 	const direction = (toY > fromY) ? 1 : -1;
			// 	for (let y = fromY; y <= toY; y += direction) {
			// 		const x = (slope === 0) ? fromY : Math.round((y - fromY) / slope);
			// 		positions.push([x, y]);
			// 	}
			}
			from = to;
			to = path.shift();
		}
		return {
			compute() {},
			render() {
				for (const pos of positions) tiles.draw("path", pos, true);
			},
		}
	}
}