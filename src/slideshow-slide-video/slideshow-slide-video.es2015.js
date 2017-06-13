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
			this._isVisible = false;

		}

		/**
		* Override SlideshowSlide's implementation, called from Slideshow
		*/
		visibilityChange(visible) {

			this._isVisible = visible;
		
			if (visible) {
				console.log('SlideshowSlideVideo: %o became visible; pause slideshow, wait until all videos are ready', this);

				// If not all videos are ready, wait until they are, pause slideshow in the meantime
				this._waitUntilAllVideosAreReady()
					.then(() => {
						console.log('SlideshowSlideVideo: All videos were loaded');
						this._modifyVideo('play');
					});

				// Pause video here and not *only* on play callback of video
				// as slide might continue while video is loading (and before 
				// play callback fires). Then this slide is not visible any more,
				// slideshow won't be paused. Issue happens especially if autoplay
				// times are low.
				this._slideshow.pause();
			}
			else {
				console.log('SlideshowSlideVideo: %o became hidden', this);
				this._modifyVideo('pause');
			}

		}


		/**
		* Returns promise that resolves when 
		* - at least one video exists in this._videos and
		* - all videos are ready
		*/
		_waitUntilAllVideosAreReady() {
			//console.error(this._videos, this._areAllVideosReady());
			//this._videos.forEach((video) => console.log(video.isReady()));
			if (this._videos.length && this._areAllVideosReady()) return Promise.resolve();
			// Else happens also if there are no videos (because they have not yet been registered).
			// We therefore assume that all slideshow-slide-video must contain at least one video!
			else {
				return new Promise((resolve) => {
					this.addEventListener('ready', (ev) => {
						if (this._areAllVideosReady()) resolve();
						else return;
					});
				});
			}
		}

		/**
		* Returns true if isReady() returns true on all this._videos
		*/
		_areAllVideosReady() {
			return this._videos.every((video) => video.isReady());
		}


		/**
		* Play or pause all videos if they are ready.
		* @param {String} method		'play' or 'pause'
		* @param {Array} args			Arguments that method will be called with; needs to be an
		*								array that will be spread.
		*/
		_modifyVideo(method, args = []) {
			console.log('SlideshowSlideVideo: %s videos %o', method, this._videos);
			this._videos.forEach((video) => {
				if (!video.isReady()) return;
				if (!video[method]) {
					return console.error('SlideshowSlideVideo: Cannot call method %o on video %o, does not exist', method, video);
				}
				video[method](...args);
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

			// Video paused: Resume slideshow
			this.addEventListener('pause', (ev) => {
				ev.stopPropagation();
				// Only play slideshow if it's visible. If this slide becomes invisible, it should
				// not interfere with the slideshow
				if (this._isVisible) this._slideshow.resume();
			});

			// Video resumed: Pause slideshow
			this.addEventListener('play', (ev) => {
				ev.stopPropagation();
				// See comment in pause event listener
				if (this._isVisible) this._slideshow.pause();
			});

			// When video ends, advance to next slide
			this.addEventListener('end', (ev) => {
				console.log('SlideshowSlideVideo: Video ended, resume slideshow');
				ev.stopPropagation();
				this._modifyVideo('pause');
				this._slideshow.next();
				this._slideshow.resume();
				// Pause, then rewind video to 0 or it will *only* rewind and not play in the slideshow's next loop
				this._modifyVideo('goTo', [0]);
			});

		}

	}

	window.SlideshowSlideVideo = SlideshowSlideVideo;
	window.customElements.define('slideshow-slide-video', SlideshowSlideVideo);

})();
