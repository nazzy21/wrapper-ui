import React from "react";
import Template from "../template";

/**
 @property {int} Id
 @property {object} fileData
 @property {string} size
 @property {string} defaultSrc
**/
export default class ImageMedia extends Template {
	constructor(props) {
		super(props);

		const {Id, fileData} = this.props;
		this.state = {Id, fileData};
	}

	setFileData(fileData) {
		this.updateState({
			fileData,
			Id: fileData.Id ? fileData.Id : null
		});
	}

	getSrc() {
		if (!this.state.fileData) {
			return this.props.defaultSrc;
		}

		const fileData = this.state.fileData;

		return fileData.file.path;
	}

	getAttr() {
		const {width, height, size, onClick} = this.props,
			attr = {width, height, onClick};

		attr.src = this.getSrc();

		if (this.state.fileData) {
			const fileData = this.state.fileData;

			attr.alt = fileData.name;

			// Get size
		}

		if (this.onClick) {
			attr.onClick = this.onClick.bind(this);
		}

		return attr;
	}

	getDataList() {
		const data = this.props.dataList||{};

		// Generate image attribute
		data.attr = this.getAttr();

		const {title, description} = this.props;
		data.title = title;
		data.description = description;
		data.className = this.props.className;

		if (this.state.fileData) {
			const file = this.state.fileData;

			data.title = file.title||title;
			data.description = file.description||description;
		}

		return data;
	}

	hasError() {
		return super.hasError() || !this.getSrc();
	}
}
ImageMedia.defaultProps = {templateId: "/template/media/image"};