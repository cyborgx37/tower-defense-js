import { drawCoords } from "./coords";
import "../assets/index.css";
import Camera from "./Camera";

async function start() {
	const camera = new Camera();
	camera.start();
}

start();