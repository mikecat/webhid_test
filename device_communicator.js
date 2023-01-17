"use strict";

const DeviceCommunicator = (function() {
	const DeviceCommunicator = function(device) {
		if (!(this instanceof DeviceCommunicator)) return new DeviceCommunicator(device);
		Object.defineProperties(this, {
			"device": {"value": device},
			"node": {"value": createElementWithClass("div", "device-top")},
		});
		const innerDiv = document.createElement("div");
		(function(div, obj) {
			const innerGrid = createElementWithClass("div", "device-area-divider");
			div.appendChild(innerGrid);
			const innerGridTop = document.createElement("div");
			innerGridTop.setAttribute("style", "grid-row: 1;");
			innerGrid.appendChild(innerGridTop);
			const deviceName = document.createElement("h2");
			deviceName.appendChild(document.createTextNode(device.productName));
			if (device.productName === ""){
				deviceName.innerHTML = "&nbsp;";
			}
			innerGridTop.appendChild(deviceName);

			const deviceInfo = createElementWithClass("div", "device-info");
			innerGridTop.appendChild(deviceInfo);
			const deviceIdArea = document.createElement("div");
			deviceIdArea.setAttribute("style", "grid-column: 1;");
			deviceIdArea.appendChild(document.createTextNode(
				toHexWithDigits(device.vendorId, 4) + ":" + toHexWithDigits(device.productId, 4)
			));
			deviceInfo.appendChild(deviceIdArea);
			const deviceConnectionControlArea = document.createElement("div");
			deviceConnectionControlArea.setAttribute("style", "grid-column: 2;");
			const openButton = document.createElement("button");
			openButton.setAttribute("type", "button");
			openButton.appendChild(createMultiLanguageNode({
				"japanese": "開く",
				"english": "open",
			}));
			deviceConnectionControlArea.appendChild(openButton);
			const closeButton = document.createElement("button");
			closeButton.setAttribute("type", "button");
			closeButton.appendChild(createMultiLanguageNode({
				"japanese": "閉じる",
				"english": "close",
			}));
			deviceConnectionControlArea.appendChild(closeButton);
			const forgetButton = document.createElement("button");
			forgetButton.setAttribute("type", "button");
			forgetButton.appendChild(createMultiLanguageNode({
				"japanese": "忘れる",
				"english": "forget",
			}));
			deviceConnectionControlArea.appendChild(forgetButton);
			deviceInfo.appendChild(deviceConnectionControlArea);

			const txHeader = document.createElement("h3");
			txHeader.appendChild(createMultiLanguageNode({
				"japanese": "送信するデータ",
				"english": "Data to send",
			}));
			innerGridTop.appendChild(txHeader);
			const sendDataInput = new HexArea(true);
			sendDataInput.minAddressDigits = 2;
			innerGridTop.appendChild(sendDataInput.node);
			const txReportIdArea = createElementWithClass("div", "device-tx-report-id");
			innerGridTop.appendChild(txReportIdArea);
			txReportIdArea.appendChild(createMultiLanguageNode({
				"japanese": "レポート ID:",
				"english": "Report ID:",
			}));
			const reportIdInput = document.createElement("input");
			txReportIdArea.appendChild(reportIdInput);
			reportIdInput.setAttribute("type", "text");
			reportIdInput.setAttribute("size", "5");
			reportIdInput.setAttribute("value", "0");
			const txButtonArea = createElementWithClass("div", "device-tx-button-area");
			innerGridTop.appendChild(txButtonArea);
			const sendOutputButton = document.createElement("button");
			sendOutputButton.setAttribute("type", "button");
			sendOutputButton.appendChild(createMultiLanguageNode({
				"japanese": "output レポートを送信",
				"english": "send output report",
			}));
			txButtonArea.appendChild(sendOutputButton);
			const sendFeatureButton = document.createElement("button");
			sendFeatureButton.setAttribute("type", "button");
			sendFeatureButton.appendChild(createMultiLanguageNode({
				"japanese": "feature レポートを送信",
				"english": "send feature report",
			}));
			txButtonArea.appendChild(sendFeatureButton);
			txButtonArea.appendChild(document.createElement("br"));
			const receiveFeatureButton = document.createElement("button");
			receiveFeatureButton.setAttribute("type", "button");
			receiveFeatureButton.appendChild(createMultiLanguageNode({
				"japanese": "feature レポートを受信",
				"english": "receive feature report",
			}));
			txButtonArea.appendChild(receiveFeatureButton);

			const rxHeader = document.createElement("h3");
			rxHeader.appendChild(createMultiLanguageNode({
				"japanese": "最後に受信したデータ",
				"english": "Last received data",
			}));
			innerGridTop.appendChild(rxHeader);
			const receivedDataArea = new HexArea(false);
			receivedDataArea.minAddressDigits = 2;
			innerGridTop.appendChild(receivedDataArea.node);
			const rxInfoArea = createElementWithClass("div", "device-last-rx-info");
			innerGridTop.appendChild(rxInfoArea);
			const rxInfoLeft = document.createElement("div");
			rxInfoArea.appendChild(rxInfoLeft);
			rxInfoLeft.setAttribute("style", "grid-column: 1;");
			rxInfoLeft.appendChild(createMultiLanguageNode({
				"japanese": "レポート ID:",
				"english": "Report ID:",
			}));
			const lastReceivedReportIdArea = document.createElement("span");
			rxInfoLeft.appendChild(lastReceivedReportIdArea);
			lastReceivedReportIdArea.textContent = "-";
			const rxInfoRight = document.createElement("div");
			rxInfoArea.appendChild(rxInfoRight);
			rxInfoRight.setAttribute("style", "grid-column: 2;");
			const lastReceivedTimeArea = document.createElement("div");
			rxInfoRight.appendChild(lastReceivedTimeArea);

			const logHeader = document.createElement("h3");
			logHeader.appendChild(createMultiLanguageNode({
				"japanese": "ログ",
				"english": "Activity log",
			}));
			innerGridTop.appendChild(logHeader);
			const logArea = document.createElement("div");
			logArea.setAttribute("style", "grid-row: 2;");
			innerGrid.appendChild(logArea);

			const innerGridBottom = createElementWithClass("div", "device-footer");
			innerGridBottom.setAttribute("style", "grid-row: 3;");
			innerGrid.appendChild(innerGridBottom);
			const innerGridBottomLeft = document.createElement("div");
			innerGridBottomLeft.setAttribute("style", "grid-column: 1;");
			innerGridBottom.appendChild(innerGridBottomLeft);
			const logSaveButton = document.createElement("button");
			logSaveButton.setAttribute("type", "button");
			logSaveButton.appendChild(createMultiLanguageNode({
				"japanese": "ログを保存",
				"english": "save log",
			}));
			innerGridBottomLeft.appendChild(logSaveButton);
			const innerGridBottomRight = document.createElement("div");
			innerGridBottomRight.setAttribute("style", "grid-column: 2;");
			innerGridBottom.appendChild(innerGridBottomRight);
			const removeButton = document.createElement("button");
			removeButton.setAttribute("type", "button");
			removeButton.appendChild(createMultiLanguageNode({
				"japanese": "表示を消す",
				"english": "remove from list",
			}));
			innerGridBottomRight.appendChild(removeButton);
		})(innerDiv, this);
		this.node.appendChild(innerDiv);
	};

	// この DeviceCommunicator に、紐づけたデバイスが切断されたことを通知する
	DeviceCommunicator.prototype.deviceDisconnected = function() {
		this.node.children[0].style.backgroundColor = "lightgray"; // temp
	};

	return DeviceCommunicator;
})();
