import { drawCoords } from "./coords";
import "../assets/index.css";

async function start(canvas?:HTMLCanvasElement) {
	if (!canvas) {
		canvas = document.createElement("canvas");
		canvas.className = "app";
		document.body.appendChild(canvas);
	}

	const ctx = canvas.getContext("2d");
	if (ctx === null) throw Error("Canvas 2d graphics not supported in this browser");

	window.requestAnimationFrame(render.bind(undefined, ctx));
	window.setInterval(compute, 8, canvas);
}

let prevTime = 0;
function render(ctx:CanvasRenderingContext2D, time:number) {
	const { canvas } = ctx;
	const elapsedTime = time - prevTime;
	prevTime = time;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawCoords(ctx, elapsedTime);
	window.requestAnimationFrame(render.bind(undefined, ctx));
}

function compute(canvas:HTMLCanvasElement) {
	const { body } = document;
	canvas.height = body.clientHeight;
	canvas.width = body.clientWidth;
}

start();