export type CompassDirection = "n"|"s"|"e"|"w";

export default interface Component {
	type:"path"|"decoration"|"tower"|"walker"|"worker";
	x?:number;
	y?:number;
	compute(elapsedTime:number, totalTime:number):void;
	render():void;
}