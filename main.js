"use strict";

window.addEventListener("DOMContentLoaded", function() {
	const addDeviceButton = document.getElementById("add-device-button");
	const deviceTable = document.getElementById("device-table");

	addDeviceButton.addEventListener("click", function() {
		const d = document.createElement("div");
		d.setAttribute("class", "device-table-cell");
		const h = new HexArea(true);
		h.minAddressDigits = 2;
		d.appendChild(h.node);
		deviceTable.appendChild(d);
		let testData = "";
		for (let i = 0; i < 32; i++) {
			testData += String.fromCharCode((Math.random() * 256) >>> 0);
		}
		h.data = testData;
	});
});
