/**
 * Common, site wide JavaScript functionality.
 * 
 * @author Alex Dawson
 */

(function() {
	let menu = document.getElementById('main-menu');
	// main menu doesn't exist if header menu isn't set.
	if (!menu) {
		return;
	}
	let openMenuButton = document.getElementById('menu-open');
	let closeMenuButton = document.getElementById('menu-close');
	let contentOverlay = document.querySelector('.header-nav-overlay');

	/**
	 * Display the navigation menu overlay.
	 */
	function showMenu() {
		menu.classList.remove('header-nav-closed');
		document.body.classList.add('noscroll');
		contentOverlay.classList.add('header-nav-overlay-visible');		
	}

	/**
	 * Hide the navigation menu overlay.
	 */
	function hideMenu() {
		menu.classList.add('header-nav-closed');
		document.body.classList.remove('noscroll');
		contentOverlay.classList.remove('header-nav-overlay-visible');	
	}

	openMenuButton.addEventListener('click', showMenu);
	closeMenuButton.addEventListener('click', hideMenu);
}());