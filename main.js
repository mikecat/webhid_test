"use strict";

window.addEventListener("DOMContentLoaded", function() {
	const h = new HexArea(true);
	document.body.appendChild(h.node);
	let testData = "";
	for (let i = 0; i < 32; i++) {
		testData += String.fromCharCode((Math.random() * 256) >>> 0);
	}
	h.data = testData;
});
