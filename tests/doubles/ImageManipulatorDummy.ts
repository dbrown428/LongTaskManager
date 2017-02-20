import {ImageManipulator} from "./ImageManipulator";

export class ImageManipulatorDummy implements ImageManipulator {
	public resizeAndCropMedia(data: string, width: number, height: number): Promise <void> {
		return Promise.resolve();
	}
}
