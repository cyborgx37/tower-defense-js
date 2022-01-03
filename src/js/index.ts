import "../assets/index.css";
import Camera from "./Camera";
import CharacterSpritesheet from "./sprites/CharacterSpritesheet";
import TilesSpritesheet from "./sprites/TilesSpritesheet";

async function start() {
	const canvas = document.createElement("canvas");
	canvas.className = "app";
	document.body.appendChild(canvas);

	const camera = new Camera(canvas);
	camera.zoom(2);
	camera.start();

	canvas.addEventListener("pointerdown", (e) => {
		canvas.setPointerCapture(e.pointerId);
		let originX = e.clientX;
		let originY = e.clientY;
		const pointerMoveHandler = (e:PointerEvent) => {
			camera.panScreen([originX - e.clientX, originY - e.clientY]);
			originX = e.clientX;
			originY = e.clientY;
		};
		canvas.addEventListener("pointermove", pointerMoveHandler);
		const pointerUpHandler = () => {
			canvas.removeEventListener("pointermove", pointerMoveHandler);
			canvas.removeEventListener("pointerup", pointerUpHandler);
		};
		canvas.addEventListener("pointerup", pointerUpHandler);
	});

	camera.registerComponent({
		compute: () => {
			const { body } = document;
			canvas.height = body.clientHeight;
			canvas.width = body.clientWidth;
		},
		render: () => {},
	});

	const tile = new TilesSpritesheet(camera);
	tile.load().then(() => {
		camera.registerComponent(tile.createRipples());
		camera.registerComponent(tile.createGrassPatch([0, 0, 32, 18]));
		camera.registerComponent(tile.createDirthPath([[0, 2], [10, 2], [10, 10], [31, 10]]));
	});

	const character = new CharacterSpritesheet(camera);
	character.load().then(() => {
		camera.registerComponent(character.createRunningGuy([[-2, 2], [10, 2], [10, 10], [33, 10]]));
	});
}

start();