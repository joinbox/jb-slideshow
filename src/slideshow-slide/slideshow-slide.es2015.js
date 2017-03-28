(() => {

	/* global window, HTMLElement, CustomEvent */


	/**
	* Slide of a Slideshow. Mainly registers itself at the slideshow, then
	* gets and handles visibilityChanges of the slide.
	*/
	class SlideshowSlide extends HTMLElement {

		constructor() {
			super();
		}


		connectedCallback() {
			// Store previous parent so that we can still emit a remove-slide event
			// when Slide is removed.
			this._parentElement = this.parentElement;
			this._registerAtSlideshow();			
		}

		disconnectedCallback() {
			this._unregisterAtSlideshow();
		}


		/**
		* Register myself at slideshow; is needed to receive visiblity updates.
		* Add registerHandler to event's details; will be called by Slideshow if it's
		* present; needed to store slideshow which is needed to pause/resume it.
		*/
		_registerAtSlideshow() {
			this._sendRegisterEvent('add-slide', null, { registerHandler: (slideshow) => this._registerSlideshowHandler(slideshow) });
		}


		/**
		* Called from Slideshow as a response to add-slide event fired. Reference
		* to function is passed in ev.detail when add-slide is emitted.
		*/
		_registerSlideshowHandler(slideshow) {
			console.log('SlideshowSlide: Store slideshow %o', slideshow);
			this._slideshow = slideshow;
		}


		/**
		* Unregister myself at parent slideshow
		*/
		_unregisterAtSlideshow() {
			this._sendRegisterEvent('remove-slide', this._parentElement);
			this._parentElement = undefined;
		}

		/**
		* Emits a register/unregister event
		*/
		_sendRegisterEvent(type, node, detail) {
			
			console.log('SlideshowSlide: Send event %o', type);

			// Get detail, if available, and add element property
			detail = detail || {};
			detail.element = this;

			const event = new CustomEvent(type, { bubbles: true, detail: detail });
			(node || this).dispatchEvent(event);

		}


		/**
		* Is called from Slideshow when visibility changes. This is why we
		* have to register slides at the slideshow.
		*/
		visibilityChange(visible) {
			console.log('SlideshowSlide: Slide %o is visible? %o', this, visible);
		}

	}


	window.SlideshowSlide = SlideshowSlide;
	window.customElements.define('slideshow-slide', SlideshowSlide);




})();