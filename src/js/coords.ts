let topLeftAscent:number = -1,
	bottomRightDescent:number;

export function drawCoords(ctx:CanvasRenderingContext2D, time:number) {
	if (topLeftAscent < 0) {
		topLeftAscent = ctx.measureText("top-left").fontBoundingBoxAscent;
		bottomRightDescent = ctx.measureText("bottom-right").fontBoundingBoxDescent;
	}

	const { canvas } = ctx;
	const { height: cHeight, width: cWidth } = canvas;

	ctx.font = "10px serif";

	ctx.textAlign = "start";
	ctx.textBaseline = "top";
	ctx.fillText("top-left", 0, 0);
	ctx.textBaseline = "bottom";
	ctx.fillText("bottom-left", 0, cHeight);
	ctx.textAlign = "end";
	ctx.textBaseline = "top";
	ctx.fillText("top-right", cWidth, 0);
	ctx.textBaseline = "bottom";
	ctx.fillText("bottom-right", cWidth, cHeight);

	ctx.textAlign = "center";
	ctx.fillText(`${Math.round(1000 / time)}fps`, cWidth / 2, cHeight / 2);
}