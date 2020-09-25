import React from "react";
import _ from "./utils";

const compos = Object.create(null),
	registered = Object.create(null);

/**
 * Add component template to the list of usable components.
 *
 * @param {Object<React.Component>} compo
 * @returns {void}
 **/
export function addComponent(compo) {
	_.devAssert(compo.type && compo.type.name, "Invalid component!");

	compos[compo.type.name] = compo;
}

/**
 * Check if a component exist from the list of usable components.
 *
 * @param {string} name
 * @returns {boolean}
 **/
export function hasComponent(name) {
	return !!compos[name];
}

/**
 * Get a component object from the list.
 *
 * @param {string} name
 * @returns {object<React.Component>}
 **/
export function getComponent(name) {
	return compos[name] || null;
}

/**
 * Render a component.
 *
 * @param {string} name
 * @param {object} props
 * @param {*} children
 * @returns {object<React.Component}
 **/
export function renderComponent(name, props = {}, children = null) {
	if (!hasComponent(name)) {
		return null;
	}

	const compo = getComponent(name);

	if (props && children) {
		props.children = children;
	}

	return React.cloneElement(compo, props);
}