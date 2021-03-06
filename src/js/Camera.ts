import Component from "./Component";
import { isPath } from "./sprites/TilesSpritesheet";
import { Tuple2Nums, Tuple4Nums } from "./spritesheet";

const p = Symbol();

export const STD_TILE_SIZE = 16;

export default class Camera {
	private [p]:{
		background:CanvasRenderingContext2D;
		canvas:HTMLCanvasElement;
		components:Component[];
		ctx:CanvasRenderingContext2D;
		foreground:CanvasRenderingContext2D;
		prevTime:number;
		screenX:number;
		screenY:number;
		startTime:number;
		readonly tileSize:number;
		vwH: number;
		vwW: number;
		vwX: number;
		vwY: number;
		worldHeight: number;
		worldWidth: number;
		zoom:number;
	};

	/**
	 * The number of milliseconds that have elapsed since the start of the game
	 */
	public get time():number {
		return performance.now() - this[p].startTime;
	}

	constructor(canvas:HTMLCanvasElement) {
		const ctx = canvas.getContext("2d");
		if (!ctx) throw Error();
		let tileSize = STD_TILE_SIZE;
		let zoom = 1;
		const background = document.createElement("canvas").getContext("2d");
		const foreground = document.createElement("canvas").getContext("2d");
		if (!background || !foreground) throw Error("Unable to create background canvases");
		this[p] = {
			background,
			canvas,
			components: [],
			ctx,
			foreground,
			prevTime: performance.now(),
			screenX: 0,
			screenY: 0,
			startTime: performance.now(),
			get tileSize() {
				return tileSize;
			},
			get zoom() {
				return zoom;
			},
			vwH: 18*16,
			vwW: 32*16,
			vwX: 0,
			vwY: 0,
			worldHeight: 18,
			worldWidth: 32,
			set zoom(value) {
				zoom = value;
				tileSize = STD_TILE_SIZE * zoom;
			},
		};

		this.render = this.render.bind(this);
		this.compute = this.compute.bind(this);
	}

	/**
	 * Returns milliseconds since the last time this function was called
	 * @returns 
	 */
	private getElapasedTime():number {
		const { time: currentTime, [p]: { prevTime } } = this;
		const elapsedTime = currentTime - prevTime;
		this[p].prevTime = currentTime;
		return elapsedTime;
	}

	start() {
		const { canvas, ctx } = this[p];
		
		window.requestAnimationFrame(this.render);
		window.setInterval(this.compute, 0, canvas);
	}

	compute() {
		const { canvas, vwH, vwW } = this[p];
		const { width: cWidth, height: cHeight } = canvas;
		const elapsedTime = this.getElapasedTime();
		this[p].vwX = (cWidth - vwW) / 2;
		this[p].vwY = (cHeight - vwH) / 2;
		for (const c of this[p].components) c.compute(elapsedTime, this.time);
	}

	render() {
		const { background, canvas, ctx, foreground, vwH, vwW, vwX, vwY } = this[p];
		const { width: cWidth, height: cHeight } = canvas;
		foreground.canvas.width = background.canvas.width = ctx.canvas.width;
		foreground.canvas.height = background.canvas.height = ctx.canvas.height;
		ctx.clearRect(0, 0, cWidth, cHeight);
		background.clearRect(0, 0, cWidth, cHeight);
		foreground.clearRect(0, 0, cWidth, cHeight);

		for (const c of this[p].components) c.render();

		ctx.drawImage(background.canvas, 0, 0, vwW, vwH, vwX, vwY, vwW, vwH);
		ctx.drawImage(foreground.canvas, 0, 0, vwW, vwH, vwX, vwY, vwW, vwH);

		window.requestAnimationFrame(this.render);
	}

	click(screenCoords:Tuple2Nums):Component|undefined {
		const [x, y] = screenCoords;
		const { vwH, vwW, vwX, vwY } = this[p];
		const path = this[p].components.find(isPath);
		// Are we clicking somewhere within the game view?
		if (x >= vwX && x <= (vwX + vwW) && y >= vwY && y <= (vwY + vwH)) {
			const tilePosition = this.screenToWorld(screenCoords);
			console.log(`Click detected at ${tilePosition[0]}, ${tilePosition[1]}`);
			// Check if the user clicked a tower:
			const c = path?.findComponent(tilePosition);
			if (c) return c;
			// If all else fails, return the path:
			return path;
		}
	}

	/**
	 * Draws an image using world coordinates, where 0,0 is the top-left of the world and 1,1 is one standard tile size
	 * to the right and down. Note that for performance reasons the tile will not be drawn if the
	 * position is off-camera.
	 * @param img - The spritesheet from which to draw the tile
	 * @param sx - The x position of the tile within the spritesheet
	 * @param sy - The y position of the tile within the spritesheet
	 * @param sWidth - The width of the tile
	 * @param sHeight - The height of the tile
	 * @param dx - The x position at which to draw the tile in world coordinates
	 * @param dy - The y position at which to draw the tile in world coordinates
	 * @param dWidth - The width of the tile in world coordinates (defaults to the width of the tile in the spritesheet)
	 * @param dHeight - The height of the tile in world coordinates (defaults to the width of the tile in the
	 *     spritesheet)
	 */
	drawForegroundImage(img:CanvasImageSource, sx:number, sy:number, sWidth:number, sHeight:number, dx:number, dy:number, dWidth:number, dHeight:number) {
		const { foreground, tileSize } = this[p];
		const [translatedX, translatedY] = this.worldToScreen([dx, dy]);
		foreground.drawImage(img, sx, sy, sWidth, sHeight, translatedX, translatedY, dWidth * tileSize, dHeight * tileSize);
	}

	/**
	 * Draws an image using world coordinates, where 0,0 is the top-left of the world and 1,1 is one standard tile size
	 * to the right and down. Note that for performance reasons the tile will not be drawn if the
	 * position is off-camera.
	 * @param img - The spritesheet from which to draw the tile
	 * @param sx - The x position of the tile within the spritesheet
	 * @param sy - The y position of the tile within the spritesheet
	 * @param sWidth - The width of the tile
	 * @param sHeight - The height of the tile
	 * @param dx - The x position at which to draw the tile in world coordinates
	 * @param dy - The y position at which to draw the tile in world coordinates
	 * @param dWidth - The width of the tile in world coordinates (defaults to the width of the tile in the spritesheet)
	 * @param dHeight - The height of the tile in world coordinates (defaults to the width of the tile in the
	 *     spritesheet)
	 */
	drawBackgroundImage(img:CanvasImageSource, sx:number, sy:number, sWidth:number, sHeight:number, dx:number, dy:number, dWidth:number, dHeight:number) {
		const { background, tileSize } = this[p];
		const [translatedX, translatedY] = this.worldToScreen([dx, dy]);
		background.drawImage(img, sx, sy, sWidth, sHeight, translatedX, translatedY, dWidth * tileSize, dHeight * tileSize);
	}

	fillRect([dx, dy, dWidth, dHeight]:Tuple4Nums, fillStyle:typeof CanvasRenderingContext2D.prototype.fillStyle) {
		const { foreground, tileSize } = this[p];
		const [translatedX, translatedY] = this.worldToScreen([dx, dy]);
		foreground.fillStyle = fillStyle;
		foreground.fillRect(translatedX, translatedY, dWidth * tileSize, dHeight * tileSize);
	}

	strokeRect([dx, dy, dWidth, dHeight]:Tuple4Nums, strokeStyle:typeof CanvasRenderingContext2D.prototype.strokeStyle) {
		const { foreground, tileSize } = this[p];
		const [translatedX, translatedY] = this.worldToScreen([dx, dy]);
		foreground.strokeStyle = strokeStyle;
		foreground.strokeRect(translatedX, translatedY, dWidth * tileSize, dHeight * tileSize);
	}

	registerComponent(component:Component) {
		this[p].components.push(component);
		return component;
	}

	unregisterComponent(component:Component) {
		const { components } = this[p];
		const index = components.indexOf( component );
		if (index < 0) return;
		components.splice(index, 1);
		return component;
	}

	screenToWorld([x,y]:Tuple2Nums):Tuple2Nums {
		const { tileSize, vwX, vwY } = this[p];
		return [
			Math.floor((x + this[p].screenX - vwX) / tileSize),
			Math.floor((y + this[p].screenY - vwY) / tileSize),
		];
	}

	worldToScreen([x, y]:Tuple2Nums):Tuple2Nums {
		const { tileSize } = this[p];
		return [
			(x * tileSize) - this[p].screenX,
			(y * tileSize) - this[p].screenY,
		];
	}

	zoom(value:number) {
		this[p].zoom = value;
	}

	pan(delta:[number,number]) {
		this.panScreen(this.worldToScreen(delta));
	}

	panScreen([deltaX, deltaY]:[number,number]) {
		const {
			vwH,
			vwW,
			tileSize,
			worldHeight,
			worldWidth,
			zoom,
		} = this[p];
		let newX = this[p].screenX + deltaX;
		let newY = this[p].screenY + deltaY;
		if (newX < 0) newX = 0;
		if (newY < 0) newY = 0;
		const maxX = (worldWidth * tileSize) - vwW;
		const maxY = (worldHeight * tileSize) - vwH;
		if (newX > maxX) newX = maxX;
		if (newY > maxY) newY = maxY;
		this[p].screenX = newX;
		this[p].screenY = newY;
	}
}