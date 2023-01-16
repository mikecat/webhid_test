"use strict";

window.addEventListener("DOMContentLoaded", function() {
	const addDeviceButton = document.getElementById("add-device-button");
	const deviceTable = document.getElementById("device-table");

	addDeviceButton.addEventListener("click", function() {
		const d = document.createElement("div");
		d.setAttribute("class", "device-table-cell");
		d.appendChild(new DeviceCommunicator(null).node);
		deviceTable.appendChild(d);
	});
});
