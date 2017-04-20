(() => {

	/* global window, SlideshowSlide */


	/**
	* This is where all the magic happens; is a child class of SlideshowSlide
	* and handles video:
	* - if video plays, pause slideshow
	* - if slideshows continues, pause video
	* - if video ends, resume slideshow
	* - if slide becomes visible, play video
	*/
	class SlideshowSlideVideo extends SlideshowSlide {

		constructor() {

			super();
			this._videos = [];
			this._addVideoListeners();
			console.log('SlideshowSlideVideo: Constructed');

		}

		/**
		* Override SlideshowSlide's implementation, called from Slideshow
		*/
		visibilityChange(visible) {
		
			if (visible) {
				console.log('SlideshowSlideVideo: %o became visible', this);
				this._modifyVideo('play');
			}
			else {
				this._modifyVideo('pause');
			}

		}



		/**
		* Play or pause all videos if they are ready.
		* @param {String} method			'play' or 'pause'
		*/
		_modifyVideo(method) {
			console.log('SlideshowSlideVideo: %s videos %o', method, this._videos);
			this._videos.forEach((video) => {
				if (!video.isReady()) return;
				video[method]();
			});
		}


		/**
		* Listen to video events to play/pause slideshow whenever
		* video's state changes. Also listens to add-video and stores
		* video in this._videos.
		*/
		_addVideoListeners() {

			this.addEventListener('add-video', (ev) => {
				this._videos.push(ev.detail.element);
			});

			this.addEventListener('remove-video', (ev) => {
				const el = ev.detail.element;
				this._videos.splice(el, this.videos.indexOf(el));
				console.log('SlideshowSlideVideo: Removed video %o, _videos now is %o', el, this._videos);
			});

			this.addEventListener('pause', (ev) => {
				ev.stopPropagation();
				this._slideshow.resume();
			});

			this.addEventListener('play', (ev) => {
				ev.stopPropagation();
				this._slideshow.pause();
			});

		}

	}

	window.SlideshowSlideVideo = SlideshowSlideVideo;
	window.customElements.define('slideshow-slide-video', SlideshowSlideVideo);

})();
