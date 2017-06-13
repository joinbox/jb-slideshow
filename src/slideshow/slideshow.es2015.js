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
			// Only auto-init if manual-init attribute is *not* set. Why's this option?
			// Because if we use the slideshow in an angular template, it will initialize 
			// too early when the angular template is still a documentFragment – the slideshow
			// will not work. See e.g. 
			// https://github.com/benjamincharity/angular-flickity/issues/30#issuecomment-202467150
			if (!this.hasAttribute('manual-init')) this._initSlideshow();
		}


		/**
		* Listen to add-slide and remove-slide events of SlideshowSlide. They 
		* will be notified of visibility changes.
		*/
		_setupSlideListeners() {

			// Slide registers itself
			this.addEventListener('add-slide', (ev) => {
				console.log('Slideshow: Slide %o registered', ev.detail.element);
				const slide = ev.detail.element;
				this._slides.push(slide);
				if (ev.detail.registerHandler) ev.detail.registerHandler(this);
				// Slide is visible: Call 
				if (this._flickity && this._flickity.selectedElement === slide) {
					console.log('Slideshow: Registered slide %o is visible', slide);
					slide.visibilityChange(true);
				}
			});

			// Slide unregisters itself
			this.addEventListener('remove-slide', (ev) => {
				console.log('Slideshow: Slide %o un-registered', ev.detail.element);
				this._slides.splice(this._slides.indexOf(ev.detail.element), 1);
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

			console.log('Slideshow: Initialize Flickity with options %o, slides %o', parsedOptions, this._slides);

			// Was initialized before: Re-set everything
			if (this._initialized) this._flickity.destroy();

			this._flickity = new Flickity(this, parsedOptions);
			this._setupFlickityListeners();
			this._initialized = true;

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

		init() {
			console.log('Slideshow: init');
			this._initSlideshow();
		}


	}


	window.Slideshow = Slideshow;
	window.customElements.define('jb-slideshow', Slideshow);

})();

