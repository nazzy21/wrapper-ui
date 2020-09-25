import React from "react";
import Template from "../template";
import _ from "../utils";
import {i18n} from "../lang";
import {getTemplate} from "../gql-state/config";

 /**
 Displays different types of informative messages.

 @property {int} duration
 	Optional. Sets the number of minutes the message appears.
 @property {string} type
 	The type of alert message to appear.
 @property {boolean} dismissible
 	Whether user is able to dismiss the alert message.
 @property {callback} onDismiss
 	A function to execute when an alert message disappers.
 **/
export default class Alert extends Template {
	constructor(props) {
		super(props);

		const {type, dismissible, duration = 0, message} = this.props;

		this.state = {type, dismissible, duration, message};
		this.dismiss = this.dismiss.bind(this);
	}

	subscribe() {
		if (!this.state.duration) {
			return null;
		}

		this.timer = setInterval(this.dismiss, this.state.duration);
	}

	unsubscribe() {
		if (!this.timer) {
			return;
		}

		clearInterval(this.timer);
	}

	cancel() {
		if (this.timer) {
			clearInterval(this.timer);
		}

		this.timer = false;

		this.updateState({
			type: "",
			dismissible: false,
			duration: 0,
			message: null
		});

		if (this.props.onCancel) {
			this.props.onCancel.call(null);
		}
	}

	dismiss() {
		if (this.timer) {
			clearInterval(this.timer);
		}

		this.timer = false;

		this.updateState({
			type: "",
			dismissible: false,
			duration: 0,
			message: null
		}, this.callback.bind(this));
	}

	callback() {
		if (!this.props.callback) {
			return;
		}

		this.props.callback.call(null, this);
	}

	hasError() {
		return super.hasError() || !this.state.message;
	}

	getTitle(type) {
		const titleList = {
			error: i18n("Error"),
			warning: i18n("Warning"),
			success: i18n("Success"),
			confirmation: i18n("Confirm"),
			progress: i18n("Loading...")
		};

		return titleList[type];
	}

	getDataList() {
		const {type, message = this.props.children, dismissible} = this.state,
			dataList = {type, message, dismissible};

		dataList.title = this.props.title||this.getTitle(type);
		dataList.cancel = () => this.cancel();
		dataList.dismiss = () => this.dismiss();

		return dataList;
	}

	render() {
		if (this.hasError()) {
			return null;
		}

		const data = this.getDataList(),
			template = this.props.children || getTemplate(`/template/alert/${this.state.type}`);

		return this.iterateChildren(template, data);
	}
}