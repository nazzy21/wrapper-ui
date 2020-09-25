import React from "react";
import Template from "../template";
import Screen from "../screen";
import {extend, setUrlParam} from "../utils";
import {renderComponent} from "../component";

/**
 * @property {int} currentPage
 * @property {int} totalItems
 * @property {int} perPage
 * @property {string} baseUrl
 * @property {boolean} updateScreen
 * @property {callback} onPageChange
 **/
export default class Paginate extends Template {
	constructor(props) {
		super(props);

		const {currentPage, totalItems, perPage, baseUrl} = this.props;

		this.state = {currentPage, totalItems, perPage, baseUrl};
	}

	switchPage(ev, page) {
		if (ev && ev.preventDefault) {
			ev.preventDefault();
		}

		this.updateState({currentPage: page}, this.props.onPageChange);

		if (this.props.onPageChange || !this.props.updateScreen) {
			return null;
		}

		const url = this.getUrl(page);

		Screen.load(url);
	}

	getUrl(page = 1) {
		let {baseUrl} = this.props;

		if (!baseUrl) {
			return "#";
		}

		if (page <= 1) {
			return baseUrl;
		}

		return setUrlParam(baseUrl, {page});
	}

	getNumPages() {
		const {totalItems, perPage} = this.state;

		return Math.ceil(totalItems/perPage);
	}

	getLink(props, page) {
		props.href = this.getUrl(page);
		props.onClick = ev => this.switchPage(ev, page);

		return (<a {...props}>{props.children}</a>);
	}

	getPageLink(child) {
		const current = this.state.currentPage,
			numPages = this.getNumPages(),
			itemCount = 5,
			items = [];

		let start = (Math.ceil(current/itemCount) * itemCount) - itemCount,
			end = start + itemCount;

		if (end > numPages) {
			end = numPages;
		}

		for(let i = start; i < end; i++) {
			items.push(this.getItem(child, i));
		}

		return items;
	}

	getItem(child, i) {
		let {currentClass} = child.props,
			props = extend({}, child.props);

		if (i === this.state.currentPage) {
			const _class = props.className ? [props.className] : [];
			_class.push(currentClass);
		}

		if (currentClass) {
			delete props.currentClass;
		}

		props.key = this.uniqId();

		return this.getLink(props, i);
	}

	getPrevLink(child) {
		const {alwaysVisible} = child.props,
			props = extend({}, child.props),
			prev = this.getNextPage();

		if (!prev && !alwaysVisible) {
			return null;
		}

		if (props.alwaysVisible) {
			delete props.alwaysVisible;
		}

		return this.getLink(props, prev);
	}

	getPrevious() {
		if (this.state.currentPage < 5) {
			return null;
		}

		return this.state.currentPage - 1;
	}

	getNextLink(child) {
		const {alwaysVisible} = child.props,
			props = extend({}, child.props),
			next = this.getNext();

		if (!next && !alwaysVisible) {
			return null;
		}

		if (props.alwaysVisible) {
			delete props.alwaysVisible;
		}

		return this.renderComponent(props, next);
	}

	getNext() {
		const {currentPage, perPage} = this.state,
			numPages = this.getNumPages(),
			start = (Math.ceil(currentPage/5) * 5) - 5,
			end = start + 5;

		if (end >= numPages || (end+1) >= numPages) {
			return null;
		}

		return end+1;
	}

	hasError() {
		return super.hasError() || this.state.totalItems <= this.state.perPage;
	}

	render() {
		if (this.hasError()) {
			return null;
		}

		return this.iterateChildren(this.props.children, {});
	}
}