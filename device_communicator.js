"use strict";

const DeviceCommunicator = (function() {
	const DeviceCommunicator = function(device) {
		if (!(this instanceof DeviceCommunicator)) return new DeviceCommunicator(device);
		Object.defineProperties(this, {
			"device": {"value": device},
			"node": {"value": createElementWithClass("div", "device-top")},
			"sendDataInput": {"value": new HexArea(true)},
		});
		const innerDiv = document.createElement("div");
		this.node.appendChild(innerDiv);
		this.sendDataInput.minAddressDigits = 2;
		innerDiv.appendChild(this.sendDataInput.node);
		let testData = "";
		for (let i = 0; i < 32; i++) {
			testData += String.fromCharCode((Math.random() * 256) >>> 0);
		}
		this.sendDataInput.data = testData;
	};

	// この DeviceCommunicator に、紐づけたデバイスが切断されたことを通知する
	DeviceCommunicator.prototype.deviceDisconnected = function() {
		this.node.children[0].style.backgroundColor = "lightgray"; // temp
	};

	return DeviceCommunicator;
})();
