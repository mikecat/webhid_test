"use strict";

const DeviceCommunicator = (function() {
	// ログ用のテキスト
	const statusNames = {
		"connected": {
			"japanese": "接続",
			"english": "connected",
		},
		"disconnected": {
			"japanese": "切断",
			"english": "disconnected",
		},
		"opened": {
			"japanese": "通信開始",
			"english": "opened",
		},
		"closed": {
			"japanese": "通信終了",
			"english": "closed",
		},
		"forgotten": {
			"japanese": "設定解除",
			"english": "forgotten",
		},
	};
	const errorPrefix = {
		"japanese": "",
		"english": "Failed to ",
	};
	const errorSuffix = {
		"japanese": "に失敗",
		"english": ".",
	};
	const actionNames = {
		"open": {
			"japanese": "通信の開始",
			"english": "open device",
		},
		"close": {
			"japanese": "通信の終了",
			"english": "close device",
		},
		"forget": {
			"japanese": "設定の解除",
			"english": "forget device",
		},
		"send": {
			"japanese": "output レポートの送信",
			"english": "send output report",
		},
		"sendFeature": {
			"japanese": "feature レポートの送信",
			"english": "send feature report",
		},
		"receiveFeature": {
			"japanese": "feature レポートの受信",
			"english": "receive feature report",
		},
	};
	const communicationNames = {
		"send": {
			"japanese": "送信",
			"english": "output",
		},
		"receive": {
			"japanese": "受信",
			"english": "input",
		},
		"sendFeature": {
			"japanese": "feature レポートの送信",
			"english": "send feature report",
		},
		"receiveFeature": {
			"japanese": "feature レポートの受信",
			"english": "receive feature report",
		},
	};
	const reportIdName = {
		"japanese": "レポートID",
		"english": "Report ID",
	};

	const uint8ToHexString = function(array) {
		let result = "";
		for (let i = 0; i < array.length; i++) {
			result += toHexWithDigits(array[i], 2);
		}
		return result;
	};
	const toDecimalWithDigits = function(value, digits) {
		let result = value.toString(10);
		while (result.length < digits) result = "0" + result;
		return result;
	};

	const DeviceCommunicator = function(device) {
		if (!(this instanceof DeviceCommunicator)) return new DeviceCommunicator(device);
		Object.defineProperties(this, {
			"device": {"value": device},
			"node": {"value": createElementWithClass("div", "device-top")},
		});
		const innerDiv = document.createElement("div");
		(function(div, obj) {
			// ----- UIの生成 -----
			const innerGrid = createElementWithClass("div", "device-area-divider device-status-element");
			div.appendChild(innerGrid);
			const innerGridTop = document.createElement("div");
			innerGridTop.setAttribute("style", "grid-row: 1;");
			innerGrid.appendChild(innerGridTop);
			const deviceName = document.createElement("h2");
			deviceName.appendChild(document.createTextNode(device.productName));
			if (device.productName === "") {
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
			const deviceOpenStatus = document.createElement("div");
			deviceOpenStatus.setAttribute("style", "grid-column: 2;");
			deviceOpenStatus.setAttribute("class", "device-indicator");
			deviceInfo.appendChild(deviceOpenStatus);
			const deviceOpenIndicator = createMultiLanguageNode({
				"japanese": "通信可 (opened)",
				"english": "opened",
			});
			deviceOpenIndicator.setAttribute("class", "device-indicator-opened");
			deviceOpenStatus.appendChild(deviceOpenIndicator);
			const deviceClosedIndicator = createMultiLanguageNode({
				"japanese": "通信不可 (closed)",
				"english": "closed",
			});
			deviceClosedIndicator.setAttribute("class", "device-indicator-closed");
			deviceOpenStatus.appendChild(deviceClosedIndicator);
			const deviceForgottenIndicator = createMultiLanguageNode({
				"japanese": "設定解除 (forgotten)",
				"english": "forgotten",
			});
			deviceForgottenIndicator.setAttribute("class", "device-indicator-forgotten");
			deviceOpenStatus.appendChild(deviceForgottenIndicator);
			const deviceConnectionControlArea = document.createElement("div");
			deviceConnectionControlArea.setAttribute("style", "grid-column: 3;");
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
			const deviceConnectionStatus = document.createElement("div");
			deviceConnectionStatus.setAttribute("style", "grid-column: 2;");
			deviceConnectionStatus.setAttribute("class", "device-indicator");
			innerGridBottom.appendChild(deviceConnectionStatus);
			const deviceConnectedIndicator = createMultiLanguageNode({
				"japanese": "接続中",
				"english": "connected",
			});
			deviceConnectedIndicator.setAttribute("class", "device-indicator-connected");
			deviceConnectionStatus.appendChild(deviceConnectedIndicator);
			const deviceDisconnectedIndicator = createMultiLanguageNode({
				"japanese": "切断済",
				"english": "disconnected",
			});
			deviceDisconnectedIndicator.setAttribute("class", "device-indicator-disconnected");
			deviceConnectionStatus.appendChild(deviceDisconnectedIndicator);
			const innerGridBottomRight = document.createElement("div");
			innerGridBottomRight.setAttribute("style", "grid-column: 3;");
			innerGridBottom.appendChild(innerGridBottomRight);
			const removeButton = document.createElement("button");
			removeButton.setAttribute("type", "button");
			removeButton.appendChild(createMultiLanguageNode({
				"japanese": "表示を消す",
				"english": "remove from list",
			}));
			innerGridBottomRight.appendChild(removeButton);

			// ----- 動作の実装 -----
			const logData = [];
			const addLog = function(logEntry) {
				logData.push(logEntry);
				const logElement = createElementWithClass("div", "device-log-entry");
				const log1 = document.createElement("div");
				logElement.appendChild(log1);
				const timeElement = document.createElement("span");
				timeElement.appendChild(document.createTextNode(logEntry.time.toLocaleTimeString()));
				log1.appendChild(timeElement);
				if (logEntry.kind === "status") {
					if (logEntry.value in statusNames) {
						log1.appendChild(createMultiLanguageNode(statusNames[logEntry.value]));
					} else {
						const s = document.createElement("span");
						s.appendChild(document.createTextNode(logEntry.value));
						log1.appendChild(s);
					}
				} else if (logEntry.kind === "error") {
					const errorText = document.createElement("span");
					errorText.appendChild(createMultiLanguageNode(errorPrefix));
					if (logEntry.target in actionNames) {
						errorText.appendChild(createMultiLanguageNode(actionNames[logEntry.target]));
					} else {
						errorText.appendChild(document.createTextNode(logEntry.target));
					}
					errorText.appendChild(createMultiLanguageNode(errorSuffix));
					log1.appendChild(errorText);
					const log2 = document.createElement("div");
					log2.appendChild(document.createTextNode(logEntry.message));
					logElement.appendChild(log2);
				} else if (logEntry.kind === "communication") {
					if (logEntry.action in communicationNames) {
						log1.appendChild(createMultiLanguageNode(communicationNames[logEntry.action]));
					} else {
						const s = document.createElement("span");
						s.appendChild(document.createTextNode(logEntry.action));
						log1.appendChild(s);
					}
					const reportIdElement = document.createElement("span");
					reportIdElement.appendChild(document.createTextNode("("));
					reportIdElement.appendChild(createMultiLanguageNode(reportIdName));
					reportIdElement.appendChild(document.createTextNode(": 0x" + toHexWithDigits(logEntry.reportId, 2) + ")"));
					log1.appendChild(reportIdElement);
					const log2 = document.createElement("div");
					const dataDetailTop = document.createElement("details");
					const dataSummary = document.createElement("summary");
					const dataDetail = document.createElement("div");
					const dataArea = new HexArea(false);
					dataArea.minAddressDigits = 2;
					dataArea.dataUint8 = logEntry.data;
					logElement.appendChild(log2);
					log2.appendChild(dataDetailTop);
					dataDetailTop.appendChild(dataSummary);
					dataDetailTop.appendChild(dataDetail);
					dataDetail.appendChild(dataArea.node);
					let dataString = "";
					for (let i = 0; i < logEntry.data.length && i < 16; i++) {
						if (i > 0) dataString += " ";
						dataString += toHexWithDigits(logEntry.data[i], 2);
					}
					if (logEntry.data.length > 16) dataString += " …";
					dataSummary.appendChild(document.createTextNode(dataString));
					dataSummary.setAttribute("class", "device-data-summary");
				} else {
					const s = document.createElement("span");
					s.appendChild(document.createTextNode(logEntry.kind));
					log1.appendChild(s);
				}
				logArea.insertBefore(logElement, logArea.firstChild);
			}
			const addErrorLog = function(target, message) {
				addLog({"time": new Date(), "kind": "error", "target": target, "message": message});
			};
			logSaveButton.addEventListener("click", (function() {
				let prevObjectURL = null;
				return function() {
					const logText = JSON.stringify({
						"device": {
							"productName": device.productName,
							"vendorId": device.vendorId,
							"productId": device.productId,
						},
						"logData": logData,
					}, function(key, value) {
						if (value instanceof ArrayBuffer) {
							return uint8ToHexString(new Uint8Array(value));
						} else if (ArrayBuffer.isView(value)) {
							return uint8ToHexString(new Uint8Array(value.buffer, value.byteOffset, value.byteLength));
						} else {
							return value;
						}
					});
					const blob = new Blob([logText], {"type": "application/json"});
					const blobURL = URL.createObjectURL(blob);
					if (prevObjectURL !== null) URL.revokeObjectURL(prevObjectURL);
					prevObjectURL = blobURL;
					const aElement = document.createElement("a");
					const currentDate = new Date();
					aElement.setAttribute("href", blobURL);
					aElement.setAttribute("download", "hidlog-" +
						toHexWithDigits(device.vendorId, 4).toLowerCase() + "-" +
						toHexWithDigits(device.productId, 4).toLowerCase() + "-" +
						toDecimalWithDigits(currentDate.getFullYear(), 4) +
						toDecimalWithDigits(currentDate.getMonth() + 1, 2) +
						toDecimalWithDigits(currentDate.getDate(), 2) +
						toDecimalWithDigits(currentDate.getHours(), 2) +
						toDecimalWithDigits(currentDate.getMinutes(), 2) +
						toDecimalWithDigits(currentDate.getSeconds(), 2) +".json");
					aElement.click();
				};
			})());

			let statusIsOpened = false;
			const updateSendButtonEnableStatus = function() {
				let enable = statusIsOpened;
				const reportId = parseInt(reportIdInput.value);
				if (isNaN(reportId) || reportId < 0 || 0xff <reportId) enable = false;
				sendOutputButton.disabled = !enable;
				sendFeatureButton.disabled = !enable;
				receiveFeatureButton.disabled = !enable;
			};
			reportIdInput.addEventListener("input", updateSendButtonEnableStatus);
			const setDeviceOpenStatus = function(status, time) {
				if ((typeof time) === "undefined") time = new Date();
				innerGrid.classList.remove("device-status-opened");
				innerGrid.classList.remove("device-status-closed");
				innerGrid.classList.remove("device-status-forgotten");
				innerGrid.classList.add("device-status-" + status);
				openButton.disabled = status !== "closed";
				closeButton.disabled = status === "forgotten";
				statusIsOpened = status === "opened";
				updateSendButtonEnableStatus();
				sendOutputButton.disabled = status !== "opened";
				sendFeatureButton.disabled = status !== "opened";
				receiveFeatureButton.disabled = status !== "opened";
				if (time !== null) {
					addLog({"time": time, "kind": "status", "value": status});
				}
			};

			const currentTime = new Date();
			innerGrid.classList.add("device-status-connected");
			addLog({"time": currentTime, "kind": "status", "value": "connected"});
			if(device.opened) {
				setDeviceOpenStatus("opened", currentTime);
			} else {
				setDeviceOpenStatus("closed", null);
			}
			openButton.addEventListener("click", function() {
				device.open().then(function() {
					setDeviceOpenStatus("opened");
				}).catch(function(error) {
					addErrorLog("open", error.name + ": " + error.message);
				});
			});
			closeButton.addEventListener("click", function() {
				device.close().then(function() {
					setDeviceOpenStatus("closed");
				}).catch(function(error) {
					addErrorLog("close", error.name + ": " + error.message);
				});
			});
			forgetButton.addEventListener("click", function() {
				device.forget().then(function() {
					setDeviceOpenStatus("forgotten");
				}).catch(function(error) {
					addErrorLog("forget", error.name + ": " + error.message);
				});
			});

			sendOutputButton.addEventListener("click", function() {
				const data = sendDataInput.dataUint8;
				const reportId = parseInt(reportIdInput.value);
				device.sendReport(reportId, data).then(function() {
					addLog({"time": new Date(), "kind": "communication", "action": "send", "data": data, "reportId": reportId});
				}).catch(function(error) {
					addErrorLog("send", error.name + ": " + error.message);
				});
			});
			sendFeatureButton.addEventListener("click", function() {
				const data = sendDataInput.dataUint8;
				const reportId = parseInt(reportIdInput.value);
				device.sendFeatureReport(reportId, data).then(function() {
					addLog({"time": new Date(), "kind": "communication", "action": "sendFeature", "data": data, "reportId": reportId});
				}).catch(function(error) {
					addErrorLog("sendFeature", error.name + ": " + error.message);
				});
			});
			receiveFeatureButton.addEventListener("click", function() {
				const reportId = parseInt(reportIdInput.value);
				device.receiveFeatureReport(reportId).then(function(dataRaw) {
					const data = new Uint8Array(dataRaw.buffer, dataRaw.byteOffset, dataRaw.byteLength);
					receivedDataArea.dataUint8 = data;
					lastReceivedReportIdArea.textContent = "0x" + toHexWithDigits(reportId, 2) + " (feature)";
					addLog({"time": new Date(), "kind": "communication", "action": "receiveFeature", "data": data, "reportId": reportId});
				}).catch(function(error) {
					addErrorLog("receiveFeature", error.name + ": " + error.message);
				});
			});
			device.addEventListener("inputreport", function(event) {
				const data = new Uint8Array(event.data.buffer, event.data.byteOffset, event.data.byteLength);
				receivedDataArea.dataUint8 = data;
				lastReceivedReportIdArea.textContent = "0x" + toHexWithDigits(event.reportId, 2);
				addLog({"time": new Date(), "kind": "communication", "action": "receive", "data": data, "reportId": event.reportId});
			});

			Object.defineProperties(obj, {
				"statusElement": {"value": innerGrid},
				"addLog": {"value": addLog},
			});

		})(innerDiv, this);
		this.node.appendChild(innerDiv);
	};

	// この DeviceCommunicator に、紐づけたデバイスが切断されたことを通知する
	DeviceCommunicator.prototype.deviceDisconnected = function() {
		this.statusElement.classList.remove("device-status-connected");
		this.statusElement.classList.add("device-status-disconnected");
		this.addLog({"time": new Date(), "kind": "status", "value": "disconnected"});
	};

	return DeviceCommunicator;
})();
