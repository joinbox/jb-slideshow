(() => {

	/* global window, HTMLElement, Flickity */


	/**
	* A simple Flickity-slideshow that plays and pauses videos depending on their 
	* visibility: 
	* - autoplay a video if it becomes visible; stop the slideshow while it plays
	* - continue slideshow as soon as video ends
	* - pause videos in background
	*/
	class Slideshow extends HTMLElement {

		constructor() {
			super();
			this._slides = [];
			this._setupSlideListeners();
		}


		connectedCallback() {
			this._initSlideshow();
		}


		/**
		* Listen to add-slide and remove-slide events of SlideshowSlide. They 
		* will be notified of visibility changes.
		*/
		_setupSlideListeners() {

			// Slide registers itself
			this.addEventListener('add-slide', (ev) => {
				console.log('Slideshow: Slide %o registered', ev.detail.element);
				this._slides.push(ev.detail.element);
				if (ev.detail.registerHandler) ev.detail.registerHandler(this);
			});

			// Slide unregisters itself
			this.addEventListener('remove-slide', (ev) => {
				console.log('Slideshow: Slide %o un-registered', ev.detail.element);
				this._slides.splice(this._slides.indexOf(ev.detail.element), 1);
				// Update cells – http://flickity.metafizzy.co/api.html#reloadcells
				//this._flickity.destroy();
				//setTimeout(() => this._initSlideshow(), 1);
			});

		}



		/**
		* Initializes Flickity
		*/
		_initSlideshow() {

			// Flickity is missing
			if (!window.Flickity) throw new Error('Slideshow: Please add Flickity to your JS/CSS sources.');

			// Get options from attribute.
			const options = this.getAttribute('flickity-options');
			let parsedOptions = {};
			if (options) {

				// Try to parse options
				try {
					parsedOptions = JSON.parse(options);
				}
				catch(err) {
					console.error('Slideshow: Could not parse Flickity options: %o', err);
				}

				// Invalid attribute (not an object)
				if (typeof parsedOptions !== 'object') {
					console.error('Slideshow: Invalid Flickity options %o, must be an object', parsedOptions);
					parsedOptions = {};
				}

			}

			console.log('Slideshow: Initialize Flickity with options %o', parsedOptions);

			this._flickity = new Flickity(this, parsedOptions);
			this._setupFlickityListeners();

		}




		/**
		* Set up event handlers for Flickity
		*/
		_setupFlickityListeners() {
			
			if (!this._flickity) {
				console.error('Slideshow: Cannot setup listeners, instance is undefined');
				return;
			}

			// Settle: Update visibility
			this._flickity.on('settle', () => {
				
				this._slides.forEach((slide) => {

					// Current
					if (slide === this._flickity.selectedSlide.cells[0].element) {
						slide.visibilityChange(true);
					}
					else {
						slide.visibilityChange(false);
					}

				});

			});

		}


		pause() {
			console.log('Slideshow: Pause');
			this._flickity.stopPlayer();
		}

		resume() {
			console.log('Slideshow: Play');
			// Un-pause *autoplay*
			this._flickity.playPlayer();
		}

		next() {
			// Go straight to next slide
			console.log('Slideshow: Next slide');
			this._flickity.next();
		}


	}


	window.Slideshow = Slideshow;
	window.customElements.define('jb-slideshow', Slideshow);

})();

