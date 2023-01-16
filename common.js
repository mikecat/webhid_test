"use strict";

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
