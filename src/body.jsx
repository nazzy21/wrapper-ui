import React from "react";
import Template, {Render} from "./template";
import Screen from "./screen";
import {appEvent} from "./hook";
import Config, {getTemplate} from "./config";
import Preload from "./components/preload";

export default class Body extends Template {
	constructor(props) {
		super(props);

		this.state.template = null;
		this.state.nextTemplate = null;
		this.state.preload = true;
		Screen.subscribe(this.changeContent.bind(this));
	}

	changeContent({screenId, client, pageNow, typeNow, refresh}) {
		const state = {screenId, client, pageNow, typeNow, refresh};

		state.template = this.getTemplate(screenId, pageNow, "/index");

		this.updateState(state);
	}

	subscribe() {
		if (this.timer) {
			clearInterval(this.timer);
		}

		if (!Screen.hasQueries()) {
			// Delay executtion for a few seconds
			this.timer = setInterval(this.bodyChanged.bind(this), 300);

			return;
		}

		// Execute screen queries
		Screen.exec().then(this.bodyChanged.bind(this));
	}

	unsubscribe() {
		if (this.timer) {
			clearInterval(this.timer);
		}
	}

	bodyChanged() {
		appEvent.trigger("screenChanged");
	}

	getPreload() {
		return (<Preload key="screen-preloader"/>);
	}

	getTemplate(screenId, pageNow, defaults) {
		const template = getTemplate(pageNow, defaults);

		if (!template) {
			return null;
		}

		return this.iterateChildren(template, {});
	}

	render() {
		if (this.hasError()) {
			return null;
		}

		return [this.getPreload(), this.state.template];
	}
}