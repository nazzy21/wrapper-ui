import React from "react";
import TextInput from "./text";
import Button from "./button";
import _ from "../utils";
import {GQLUpload} from "@wrapper/gql-client";

/**
 @property {boolean} save
 	Whether to save the uploaded file into the database library.
 @property {object} crop
 	The sizes to which an uploaded image is copied and cropted.
 @property {function} onStatusChange
 	A callback listeners which triggers whenever the status changes.
 @property {boolean} multiple
 	Whether to upload multiple files at once.
**/
export default class UploadInput extends TextInput {
	constructor(props) {
		super(props);

		this.state = {status: "", files: []};
		this.uploader = new GQLUpload();
	}

	updateState(state) {
		const status = this.state.status;

		super.updateState(state, () => {
			if (!this.props.onStatusChange ||
				status === state.status) {
				return;
			}

			this.props.onStatusChange.call(null, state.status, this);

			// Clear status after a few seconds
			if ("done" === state.status || "error" === this.state.status) {
				this.timer = setInterval(this.clearStatus.bind(this), 300);
			}
		});
	}

	clearStatus() {
		if (this.timer) {
			clearInterval(this.timer);
		}

		this.updateState({status: ""});
	}

	select() {
		if (!this.fileRef) {
			return null;
		}

		if (this.fileRef.click) {
			this.fileRef.click();
		}
	}

	clear(ev) {
		if (ev && ev.preventDefault) {
			ev.preventDefault();
		}

		this.updateState({
			fileName: "",
			file: false,
			status: ""
		});
	}

	onChange(ev) {
		this.updateState({
			status: "ready",
			errorMessage: null,
			files: _.values(ev.target.files)
		});
	}

	upload() {
		this.updateState({status: "progress"});

		const {save, crop} = this.props,
			files = this.state.files;

		if (!files || !files.length) {
			return;
		}

		if (this.props.multiple) {
			this.uploader.uploadMany({
				name: this.props.name,
				files,
				params: {
					save: this.props.save,
					crop: this.props.crop
				},
				onSuccess: this.onSuccess.bind(this),
				onError: this.onError.bind(this)
			});

			return;
		}

		this.uploader.upload({
			name: this.props.name,
			file: files[0],
			params: {
				save: this.props.save,
				crop: this.props.crop
			},
			onSuccess: this.onSuccess.bind(this),
			onError: this.onError.bind(this)
		});
	}

	onSuccess(file) {
		this.updateState({
			status: "done",
			files: _.isArray(file) ? file : [file]
		});
	}

	onError(err) {
		this.updateState({
			status: "error",
			errorMessage: err.message
		});
		console.log("error:", err);
	}

	getFile() {
		return this.state.files && this.state.files[0];
	}

	getFiles() {
		return this.state.files;
	}

	getAttr() {
		const attr = super.getAttr();

		attr.type = "file";
		attr.ref = ref => {this.fileRef = ref};
		attr.onChange = this.onChange;

		if (this.props.multiple) {
			attr.multiple = true;
		}

		return attr;
	}

	getClearButton(child) {
		if (!this.state.fileName) {
			return null;
		}

		const props = _.clone(child.props);
		props.type = "button";
		props.onClick = this.clear.bind(this);

		return (<Button {...props}/>);
	}

	getSelectButton(child) {
		if ("" !== this.state.status) {
			return null;
		}

		const props = _.clone(child.props);
		props.type = "button";
		props.onClick = this.select.bind(this);

		return (<Button {...props}/>);
	}

	getUploadButton(child) {
		if ("ready" !== this.state.status) {
			return null;
		}

		const props = _.clone(child.props);
		props.type = "button";
		props.onClick = this.upload.bind(this);

		return (<Button {...props}/>);
	}

	getProgress(child) {
		if ("progress" !== this.state.status) {
			return null;
		}

		return child.props.children;
	}

	getDataList() {
		const attr = this.getAttr(),
			inputAttr = {
				type: "file",
				placeholder: this.props.placeholder,
				value: this.state.fileName
			};

		if ("progress" === this.state.status) {
			inputAttr.disabled = true;
		}

		return {
			attr, 
			inputAttr,
			status: this.state.status, 
			errorMessage: this.state.errorMessage,
			placeholder: this.props.placeholder,
			select: this.select.bind(this),
			fileName: this.state.files.join(", ")
		};
	}
}
UploadInput.defaultProps = {templateId: "/template/input/upload"};