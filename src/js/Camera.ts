import { drawCoords } from "./coords";

const p = Symbol();

export default class Camera {
	private [p]:{
		canvas:HTMLCanvasElement;
		ctx:CanvasRenderingContext2D;
		prevTime:number;
	};

	constructor(canvas:HTMLCanvasElement) {
		const ctx = canvas.getContext("2d");
		if (!ctx) throw Error();
		this[p] = {
			canvas,
			ctx,
			prevTime: 0,
		};

		this.render = this.render.bind(this);
		this.compute = this.compute.bind(this);
	}

	start() {
		const { canvas, ctx } = this[p];
		
		window.requestAnimationFrame(this.render);
		window.setInterval(this.compute, 0, canvas);
	}

	render(time:number) {
		const { canvas, ctx, prevTime } = this[p];
		const elapsedTime = time - prevTime;
		this[p].prevTime = time;
		const { width: cWidth, height: cHeight } = canvas;
		ctx.clearRect(0, 0, cWidth, cHeight);
		drawCoords(ctx, elapsedTime);

		window.requestAnimationFrame(this.render);
	}

	compute() {
		const { body } = document;
		const { canvas } = this[p];
		canvas.height = body.clientHeight;
		canvas.width = body.clientWidth;	
	}
}