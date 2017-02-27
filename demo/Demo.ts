import {FGSystem} from "./FGSystem";
import {DownloadMediaLongTaskRequest} from "./DownloadMediaLongTaskRequest";

class Demo {
	public start() {
		const system = new FGSystem();
		const downloadMedia = new DownloadMediaLongTaskRequest(system.manager);

		const urls1 = [
			"http://amazing-space.stsci.edu/uploads/resource_image/image/204/hs-2013-51-a-full_jpg.jpg",
			"http://farm8.staticflickr.com/7315/11920653765_8dbd136b17_o.jpg",
			"http://www.sample-videos.com/video/mp4/720/big_buck_bunny_720p_1mb.mp4",
			"https://freewallpap.files.wordpress.com/2012/01/the-best-top-desktop-space-wallpapers-2.jpeg",
		];
		const urls2 = [
			"http://cdn.spacetelescope.org/archives/images/publicationjpg/heic1502a.jpg",
			"http://cdn.spacetelescope.org/archives/images/large/opo0324a.jpg",
			"http://c2.staticflickr.com/8/7151/6760135001_14c59a1490_o.jpg",
		];
		const urls3 = [
			"http://www.nasa.gov/sites/default/files/thumbnails/image/hs-2015-02-a-hires_jpg.jpg",
			"http://www.sample-videos.com/video/mp4/720/big_buck_bunny_720p_20mb.mp4",
		];

		// I'm intentionally ignoring the return values.
		downloadMedia.request(urls1, UserId.withValue("123"));
		downloadMedia.request(urls2, UserId.withValue("456"));
		downloadMedia.request(urls3, UserId.withValue("123"));
	}
}
