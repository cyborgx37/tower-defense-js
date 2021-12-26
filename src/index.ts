export function start(canvas?:HTMLCanvasElement) {
	if (!canvas) {
		canvas = document.createElement("canvas");
		document.body.appendChild(canvas);
	}
}