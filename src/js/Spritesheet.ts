import Camera, { STD_TILE_SIZE } from "./Camera";

export type Tuple2Nums = [number,number];
export type Tuple4Nums = [number,number,number,number];
type FramesMap = Map<string,Tuple4Nums>;
type FramesRecord = Record<string,Tuple4Nums>;
type StripsMap = Map<string, [string,number][]>;
type StripsRecord = Record<string, [string,number][]>;
type StripMetadata = { strip: [string,number][]; loopTime:number };
type StripsMetadata = Map<string, StripMetadata>;

const p = Symbol();

export type SpritesheetStatus = "loaded" | "notloaded";

const SINGLE_TILE = STD_TILE_SIZE;
const DOUBLE_TILE = STD_TILE_SIZE * 2;
const TRIPLE_TILE = STD_TILE_SIZE * 2;

export default class Spritesheet {
	private [p]: {
		camera: Camera,
		img?: HTMLImageElement,
		frames: FramesMap,
		strips: StripsMetadata,
	};

	protected get camera():Camera {
		return this[p].camera;
	}

	public get status():SpritesheetStatus {
		return this[p].img ? "loaded" : "notloaded";
	}

	constructor (camera:Camera) {
		this[p] = {
			camera,
			frames: new Map<string, Tuple4Nums>(),
			strips: new Map<string, StripMetadata>(),
		};
	}

	async load(src:string, frames?:FramesMap|FramesRecord, strips?:StripsMap|StripsRecord):Promise<void> {
		return new Promise<void>((resolve, reject) => {
			const img = new Image();
			img.src = src;
			img.onload = () => {
				this[p].img = img;
				if (frames) {
					this.setFrames(frames);
					if (strips) this.setStrips(strips);
				}
				resolve();
			};
			img.onerror = (e) => {
				this[p].img = undefined;
				reject(e);
			};
		});
	}

	/**
	 * Set a map of predefined ranges to make rendering individual sprites easier
	 * @param frames 
	 */
	setFrames(frames:FramesMap|FramesRecord) {
		const { frames: f } = this[p];

		const entries = (frames instanceof Map) ? frames.entries() : Object.entries(frames);
		for (const [name, coords] of entries) f.set(name, coords);
	}

	setStrips(strips:StripsMap|StripsRecord) {
		const { strips: s } = this[p];

		const entries = (strips instanceof Map) ? strips.entries() : Object.entries(strips);
		for (const [name, strip] of entries) {
			let loopTime = 0;
			for (const [, time] of strip) loopTime += time;
			s.set(name, {
				strip,
				loopTime,
			});
		}
	}

	draw(coords:Tuple4Nums, dest:Tuple2Nums|Tuple4Nums, background?:boolean):void;
	draw(name:string, dest:Tuple2Nums|Tuple4Nums, background?:boolean):void;
	draw(nameOrCoords:string|Tuple4Nums, dest:Tuple2Nums|Tuple4Nums, background=false):void {
		const { img } = this[p];
		if (!img) throw Error("Spritesheet not loaded");

		if (typeof nameOrCoords === "string") {
			const { frames } = this[p];
			const namedRange = frames.get(nameOrCoords);
			if (!namedRange) throw Error(`Range '${nameOrCoords}' not defined`);
			nameOrCoords = namedRange;
		}

		const [ sx, sy, sWidth, sHeight ] = nameOrCoords;
		const [ dx, dy ] = dest;
		let [ , , dWidth, dHeight ] = dest;
		if (dWidth === undefined) {
			if (sWidth === SINGLE_TILE) dWidth = 1;
			else if (sWidth === DOUBLE_TILE) dWidth = 2;
			else if (sWidth === TRIPLE_TILE) dWidth = 3;
			else dWidth = sWidth / 16;
		}
		if (dHeight === undefined) {
			if (sHeight === SINGLE_TILE) dHeight = 1;
			else if (sHeight === DOUBLE_TILE) dHeight = 2;
			else if (sHeight === TRIPLE_TILE) dHeight = 3;
			else dHeight = sHeight / 16;
		}
		if (background) {
			this[p].camera.drawBackgroundImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
		} else {
			this[p].camera.drawForegroundImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
		}
	}

	/**
	 * 
	 * @param animationId A unique Id identifying a single, continuous animation
	 * @param stripName 
	 * @param elapsedTime 
	 */
	animate(stripName:string, totalTime:number, dest:Tuple2Nums|Tuple4Nums, background=false):void {
		const { strips } = this[p];
		const metadata = strips.get(stripName);
		if (!metadata) throw Error(`Strip '${stripName}' not defined`);

		// Relative to the loop length
		let relTime = totalTime % metadata.loopTime;
		let currentRange:string|undefined;
		for (const [name, time] of metadata.strip) {
			currentRange = name;
			if (relTime < time) break;
			relTime -= time;
		}
		if (!currentRange) throw Error(`No ranges found for '${stripName}'`);
		this.draw(currentRange, dest, background);
	}
}