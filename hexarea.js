"use strict";

const HexArea = (function() {
	const toHexWithDigits = function(value, digits) {
		if ((typeof digits) === "undefined") digits = 0;
		let result = value.toString(16).toUpperCase();
		while (result.length < digits) result = "0" + result;
		return result;
	};
	const createElementWithClass = function(name, cls) {
		const elem = document.createElement(name);
		elem.setAttribute("class", cls);
		return elem;
	};
	const setDataElements = function(obj) {
		const data = obj.dataInternal;
		const internalNodes = obj.internalNodes;
		const numRows = (obj.dataInternal.length >>> 4) + 1;
		while (internalNodes.addressRows.length < numRows) {
			const addressRow = createElementWithClass("div", "hexarea-address-row");
			const addressCell = createElementWithClass("div", "hexarea-address-cell");
			addressRow.appendChild(addressCell);
			internalNodes.addressTable.appendChild(addressRow);
			internalNodes.addressRows.push(addressRow);
			internalNodes.addressElements.push(addressCell);
			const byteRow = createElementWithClass("div", "hexarea-byte-row");
			for (let i = 0; i < 16; i++) {
				const byteCell = createElementWithClass("div", "hexarea-byte-cell");
				byteRow.appendChild(byteCell);
				if (obj.editable) {
					byteCell.addEventListener("click", (function(idx) {
						return function() {
							obj.selectedIndex = idx;
						};
					})(internalNodes.byteElements.length));
				}
				internalNodes.byteElements.push(byteCell);
			}
			internalNodes.byteTable.appendChild(byteRow);
			internalNodes.byteRows.push(byteRow);
			const charRow = createElementWithClass("div", "hexarea-char-row");
			const charRowLeftMargin = createElementWithClass("div", "hexarea-char-left-margin");
			charRowLeftMargin.appendChild(document.createElement("div"));
			charRow.appendChild(charRowLeftMargin);
			for (let i = 0; i < 16; i++) {
				const charCell = createElementWithClass("div", "hexarea-char-cell");
				const charCellData = document.createElement("div");
				charCell.appendChild(charCellData);
				charRow.appendChild(charCell);
				internalNodes.charElements.push(charCellData);
			}
			internalNodes.charTable.appendChild(charRow);
			internalNodes.charRows.push(charRow);
		}
		const addressSize = toHexWithDigits(16 * (numRows - 1)).length;
		for (let i = 0; i < internalNodes.addressRows.length; i++) {
			if (i < numRows) {
				internalNodes.addressRows[i].style.display = "";
				internalNodes.addressElements[i].textContent = toHexWithDigits(16 * i, addressSize);
				internalNodes.byteRows[i].style.display = "";
				internalNodes.charRows[i].style.display = "";
			} else {
				internalNodes.addressRows[i].style.display = "none";
				internalNodes.byteRows[i].style.display = "none";
				internalNodes.charRows[i].style.display = "none";
			}
		}
		for (let i = 0; i < 16 * numRows; i++) {
			if (i < data.length) {
				const c = data.charCodeAt(i) & 0xff;
				internalNodes.byteElements[i].textContent = toHexWithDigits(c, 2);
				internalNodes.charElements[i].textContent = 0x20 <= c && c < 0x7f ? String.fromCharCode(c) : ".";
			} else {
				internalNodes.byteElements[i].textContent = "";
				internalNodes.charElements[i].textContent = "";
			}
		}
		if (obj.editingUpper >= 0) {
			internalNodes.byteElements[obj.selectedIndexInternal].textContent = toHexWithDigits(obj.editingUpper);
		}
	};

	const HexArea = function(editable, data) {
		if (!(this instanceof HexArea)) return new HexArea(editable);
		if ((typeof editable) === "undefined") editable = false;
		Object.defineProperties(this, {
			"editable": {"value": !!editable},
			"node": {"value": createElementWithClass("div", "hexarea-top")},
			"internalNodes": {"value": {
				"addressTable": createElementWithClass("div", "hexarea-address"),
				"byteTable": createElementWithClass("div", "hexarea-byte"),
				"charTable": createElementWithClass("div", "hexarea-char"),
				"addressRows": [],
				"byteRows": [],
				"charRows": [],
				"addressElements": [],
				"byteElements": [],
				"charElements": [],
			}},
		});
		this.selectedIndexInternal = -1;
		this.editingUpper = -1;
		this.insertModeInternal = false;

		const headerRow = createElementWithClass("div", "hexarea-top-row");
		headerRow.appendChild(createElementWithClass("div", "hexarea-top-cell"));
		const byteHeaderArea = createElementWithClass("div", "hexarea-top-cell");
		const byteHeader = createElementWithClass("div", "hexarea-byte-header");
		for (let i = 0; i < 16; i++) {
			const byteHeaderCell = createElementWithClass("div", "hexarea-byte-header-cell hexarea-byte-cell");
			const byteHeaderData = document.createElement("div");
			byteHeaderData.appendChild(document.createTextNode(i.toString(16).toUpperCase()));
			byteHeaderCell.appendChild(byteHeaderData);
			byteHeader.appendChild(byteHeaderCell);
		}
		byteHeaderArea.appendChild(byteHeader);
		headerRow.appendChild(byteHeaderArea);
		headerRow.appendChild(createElementWithClass("div", "hexarea-top-cell"));
		this.node.appendChild(headerRow);
		const contentsRow = createElementWithClass("div", "hexarea-top-row");
		const addressArea = createElementWithClass("div", "hexarea-top-cell");
		addressArea.appendChild(this.internalNodes.addressTable);
		contentsRow.appendChild(addressArea);
		const byteArea = createElementWithClass("div", "hexarea-top-cell");
		byteArea.appendChild(this.internalNodes.byteTable);
		contentsRow.appendChild(byteArea);
		const charArea = createElementWithClass("div", "hexarea-top-cell");
		charArea.appendChild(this.internalNodes.charTable);
		contentsRow.appendChild(charArea);
		this.node.appendChild(contentsRow);
		this.data = (typeof data) === "undefined" ? "" : data.toString();

		if (editable) {
			document.addEventListener("click", (function(obj) {
				return function() {
					obj.selectedIndex = -1;
				};
			})(this), true);
			document.addEventListener("keydown", (function(obj) {
				return function(e) {
					if (obj.selectedIndexInternal < 0) return;
					if (e.key === "Backspace") {
						if (obj.selectedIndexInternal > 0) {
							obj.data = obj.dataInternal.substring(0, obj.selectedIndexInternal - 1) +
								obj.dataInternal.substring(obj.selectedIndexInternal);
							obj.selectedIndex = obj.selectedIndexInternal - 1;
						}
					} else if (e.key === "Delete") {
						if (obj.selectedIndexInternal < obj.dataInternal.length) {
							obj.data = obj.dataInternal.substring(0, obj.selectedIndexInternal) +
								obj.dataInternal.substring(obj.selectedIndexInternal + 1);
							obj.selectedIndex = obj.selectedIndexInternal;
						}
					} else if (e.key === "ArrowLeft") {
						if (obj.selectedIndexInternal > 0) {
							obj.selectedIndex = obj.selectedIndexInternal - 1;
						}
					} else if (e.key === "ArrowRight") {
						obj.selectedIndex = obj.selectedIndexInternal + 1;
					} else if (e.key === "ArrowUp") {
						if (obj.selectedIndexInternal >= 16) {
							obj.selectedIndex = obj.selectedIndexInternal - 16;
						}
					} else if (e.key === "ArrowDown") {
						const numRows = (obj.dataInternal.length >> 4) + 1;
						if (obj.selectedIndexInternal + 16 < 16 * numRows) {
							obj.selectedIndex = obj.selectedIndexInternal + 16;
						}
					} else if (e.key === "Home") {
						obj.selectedIndex = obj.selectedIndexInternal & ~15;
					} else if (e.key === "End") {
						obj.selectedIndex = (obj.selectedIndexInternal & ~15) + 15;
					} else if (e.key === "Insert") {
						obj.insertMode = !obj.insertModeInternal;
					} else if (/^[0-9a-f]$/i.test(e.key)) {
						const delta = parseInt(e.key, 16);
						if (obj.editingUpper < 0) {
							obj.editingUpper = delta;
							obj.data = obj.dataInternal.substring(0, obj.selectedIndexInternal) +
								String.fromCharCode(delta * 16) + obj.dataInternal.substring(obj.selectedIndexInternal + (obj.insertModeInternal ? 0 : 1));
						} else {
							const c = obj.editingUpper * 16 + delta;
							obj.data = obj.dataInternal.substring(0, obj.selectedIndexInternal) +
								String.fromCharCode(c) + obj.dataInternal.substring(obj.selectedIndexInternal + 1);
							obj.selectedIndex = obj.selectedIndexInternal + 1;
						}
					}
				};
			})(this));
		}
	};
	const setData = function(data) {
		this.dataInternal = data.toString();
		setDataElements(this);
	};
	const setSelectedIndex = function(idx) {
		if (this.selectedIndexInternal >= 0) {
			this.internalNodes.byteElements[this.selectedIndexInternal].classList.remove("hexarea-byte-current");
			this.internalNodes.charElements[this.selectedIndexInternal].classList.remove("hexarea-char-current");
			if (this.editingUpper >= 0) {
				this.internalNodes.byteElements[this.selectedIndexInternal].textContent =
					this.selectedIndexInternal < this.dataInternal.length ? toHexWithDigits(this.dataInternal.charCodeAt(this.selectedIndexInternal), 2) : "";
				this.editingUpper = -1;
			}
		}
		this.selectedIndexInternal = idx > this.data.length ? this.data.length : idx;
		if (this.selectedIndexInternal >= 0) {
			this.internalNodes.byteElements[this.selectedIndexInternal].classList.add("hexarea-byte-current");
			this.internalNodes.charElements[this.selectedIndexInternal].classList.add("hexarea-char-current");
		}
	};
	const setInsertMode = function(mode) {
		this.insertModeInternal = !!mode;
		if (this.insertModeInternal) {
			this.node.classList.add("hexarea-insert-mode");
		} else {
			this.node.classList.remove("hexarea-insert-mode");
		}
	};

	Object.defineProperties(HexArea.prototype, {
		"data": {
			"get": function() { return this.dataInternal; },
			"set": setData
		},
		"selectedIndex": {
			"get": function() { return this.selectedIndexInternal; },
			"set": setSelectedIndex
		},
		"insertMode": {
			"get": function() { return this.insertModeInternal; },
			"set": setInsertMode
		},
		"dataUint8": {
			"get": function() {
				const ret = new Uint8Array(this.dataInternal.length);
				for (let i = 0; i < this.dataInternal.length; i++) {
					ret[i] = this.dataInternal.charCodeAt(i);
				}
				return ret;
			},
			"set": function(data){
				let dataString = "";
				for (let i = 0; i < data.length; i++) {
					dataString += String.fromCharCode(data[i] & 0xff);
				}
				this.data = dataString;
			}
		},
	});
	return HexArea;
})();
