import {Promise} from 'es6-promise';

export interface ImageManipulator {
	resizeAndCropMedia(data: string, width: number, height: number): Promise <void>;
}
