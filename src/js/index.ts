import "../assets/index.css";
import Camera from "./Camera";
import CharacterSpritesheet, { WalkerComponent } from "./sprites/CharacterSpritesheet";
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
		type: "worker",
		compute: () => {
			const { body } = document;
			canvas.height = body.clientHeight;
			canvas.width = body.clientWidth;
		},
		render: () => {},
	});

	const tile = new TilesSpritesheet(camera);
	const character = new CharacterSpritesheet(camera);
	await Promise.all([ tile.load(), character.load() ]);

	const path = tile.createDirthPath([[-2, 2], [10, 2], [10, 10], [33, 10]]);

	camera.registerComponent(tile.createRipples());
	camera.registerComponent(tile.createGrassPatch([0, 0, 32, 18]));
	camera.registerComponent(path);
	camera.registerComponent(path.registerTower(tile.createCannon([12,8], "w")));
	camera.registerComponent(path.registerTower(tile.createCannon([13,8], "s")));
	camera.registerComponent(path.registerTower(tile.createCannon([14,13], "n")));

	// Create a bad-guy spawner
	const spawner = {
		type: "worker" as const,
		lastSpawn: 0,
		guys: [] as WalkerComponent[],
		compute(_:number, totalTime:number) {
			const { guys } = this;
			if (totalTime - this.lastSpawn > 2000) {
				this.lastSpawn = totalTime;
				const guy = character.createRunningGuy();
				path.registerPathWalker(guy);
				guy.speed = 0.75 + (Math.random() * 0.75);
				guy.done = () => {
					guys.splice(guys.indexOf(guy), 1);
					path.unregisterPathWalker(guy);
					camera.unregisterComponent(guy);
					if (guy.life <= 0) {
						const bones = tile.createBones([guy.x, guy.y]);
						bones.done = () => {
							camera.unregisterComponent(bones);
						};
						camera.registerComponent(bones);
					}
				}
				guys.push(guy);
				camera.registerComponent(guy);
			}
		},
		render() {},
	};
	camera.registerComponent(spawner);
}

start();