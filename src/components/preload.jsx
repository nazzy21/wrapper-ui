import React from "react";
import {appEvent} from "../hook";
import Template from "../template";

export default class Preload extends Template {
	constructor(props) {
		super(props);

		this.state = {state: "enter", loaded: false, loading: true};

		// Listen to screen change
		appEvent.on("screenChange", this.__setLoading.bind(this));
		appEvent.on("screenChanged", this.__setLoaded.bind(this));
	}

	subscribe() {
		if ("enter" === this.state.state) {
			return;
		}

		this.updateState({state: "exit"});
	}

	/**
	 @private
	 @callback
	**/
	__setLoading({screenId}) {
		if (!screenId) {
			return;
		}

		this.updateState({loaded: true, loading: true});
	}

	/**
	 @private
	 @callback
	**/
	__setLoaded() {
		this.updateState({state: "enter-done", loading: false});
	}

	hasError() {
		return super.hasError() || "exit" === this.state.state;
	}

	render() {
		if (this.hasError()) {
			return null;
		}

		// On first load, just reload the original preloader
		if (!this.state.loaded) {
			return this.props.preloader||null;
		}

		return super.render();
	}
}
Preload.defaultProps = {templateId: "/preload"};