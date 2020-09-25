import React from "react";
import Template from "../template";
import State from "../state";
import _ from "../utils";

const screenAlerts = new State("screenAlerts");

export default class ScreenAlert extends Template {
	constructor(props) {
		super(props);

		this.callback = this.uniqCallback(this.countUpdate, this.uniqId());

		screenAlerts.subscribe(this.callback);
	}

	unsubscribe() {
		screenAlerts.unsubscribe(this.callback);
	}

	getAlert(child) {
		const alerts = screenAlerts.get();

		return Object.values(alerts).map(alert => this.iterateAlert(alert, child));
	}

	iterateAlert(alert, child) {
		if (!alert) {
			return null;
		}
		
		alert.key = this.uniqId();
		
		return React.cloneElement(child, alert);
	}

	hasError() {
		return super.hasError() || _.isEmpty(screenAlerts.state);
	}
}
ScreenAlert.defaultProps = {templateId: "/template/screen-alert"};

/**
 @params {object} alert
 	Defines the alert type.
 	{
		@property {string} id
		@property {string} type
		@property {string|object} message
		@property {function} callback
		@property {int} duration
 	}
**/
export function setScreenAlert(alert) {
	const {id, type, callback} = alert,
		alertData = _.extend({}, alert);

	alertData.onCancel = () => {
		screenAlerts.unsetSync(id);
	};

	alertData.callback = () => {
		screenAlerts.unsetSync(id);

		if (callback) {
			callback.call(null);
		}
	};

	screenAlerts.setSync(id, alertData);
}