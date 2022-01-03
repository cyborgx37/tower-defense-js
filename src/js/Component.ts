export default interface Component {
	compute(elapsedTime:number, totalTime:number):void;
	render():void;
}