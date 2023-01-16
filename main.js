"use strict";

window.addEventListener("DOMContentLoaded", function() {
	const addDeviceButton = document.getElementById("add-device-button");
	const languageSelect = document.getElementById("language-select");
	const deviceTable = document.getElementById("device-table");

	const LANGUAGE_KEY = "webhid_test_language_626d9d4c-871d-45bb-91f5-7bd5e9d17ca7";

	const readLocalStorage = function(key) {
		if ("localStorage" in window) {
			try {
				return window.localStorage.getItem(key);
			} catch (e) {
				console.warn(e);
				return null;
			}
		}
		return null;
	};
	const writeLocalStorage = function(key, value) {
		if ("localStorage" in window) {
			try {
				window.localStorage.setItem(key, value);
				return true;
			} catch (e) {
				console.warn(e);
				return false;
			}
		}
		return false;
	};

	const applyLanguageSelection = function() {
		const language = languageSelect.value.toString();
		const languageSelectPrefix = "language-select-";
		const classList = document.body.classList;
		const classesToRemove = [];
		for (let i = 0; i < classList.length; i++) {
			if (classList[i].substring(0, languageSelectPrefix.length) === languageSelectPrefix) {
				classesToRemove.push(classList[i]);
			}
		}
		for (let i = 0; i < classesToRemove.length; i++) {
			classList.remove(classesToRemove[i]);
		}
		classList.add(languageSelectPrefix + language);
	};
	const setLanguageByName = function(name) {
		for (let i = 0; i < languageSelect.options.length; i++) {
			if (languageSelect.options[i].value === name) {
				languageSelect.selectedIndex = i;
				applyLanguageSelection();
				break;
			}
		}
	};
	languageSelect.addEventListener("change", function() {
		applyLanguageSelection();
		writeLocalStorage(LANGUAGE_KEY, languageSelect.value);
	});
	window.addEventListener("storage", function(e) {
		if (e.key === LANGUAGE_KEY) setLanguageByName(e.newValue);
	});
	applyLanguageSelection(); // HTMLでの初期選択を反映させる

	addDeviceButton.addEventListener("click", function() {
		const d = document.createElement("div");
		d.setAttribute("class", "device-table-cell");
		d.appendChild(new DeviceCommunicator(null).node);
		deviceTable.appendChild(d);
	});

	// localStorage の操作で止まっても被害が抑えられるよう、最後に読み出しを行う
	let languageConfig = readLocalStorage(LANGUAGE_KEY);
	let languageSaveRequest = false;
	if (languageConfig === null) {
		if (navigator.language.substring(0, 2).toLowerCase() === "ja") {
			languageConfig = "japanase";
		} else {
			languageConfig = "english";
		}
		languageSaveRequest = true;
	}
	setLanguageByName(languageConfig);
	// 書き込みで止まっても被害が抑えられるよう、反映処理の後に書き込む
	if (languageSaveRequest) {
		writeLocalStorage(LANGUAGE_KEY, languageConfig);
	}
});
