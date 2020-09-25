import React from "react";
import Template, {Render} from "../template";
import * as _ from "../utils";

/**
 @property {string} className
**/
export default class Table extends Template {
	constructor(props) {
		super(props);

		this.state.columns = this.getColumns();
		this.state.items = this.getItems();
	}

	getItems() {
		return this.props.items;
	}

	getColumns() {
		return this.props.columns;
	}

	getColumnHeading(child) {
		const cols = [];

		for(const key of Object.keys(this.state.columns)) {
			const label = this.state.columns[key],
				props = {},
				data = {label};

			props.dataList = data;
			props.children = child.props.children;
			props.key = this.uniqId();

			cols.push(<Render {...props}/>);
		}

		return cols;
	}

	getRowId(item) {
		return item.ID||null;
	}

	getRow(child) {
		const rows = [];

		this.usedColumns = [];

		for(const item of this.state.items) {
			const props = {},
				data = {};

			data.rowId = this.getRowId(item);
			data.Column = child => this.getColumn(child, item);

			props.dataList = data;
			props.children = child.props.children;
			props.key = this.uniqId();

			rows.push(<Render {...props}/>);
		}

		return rows;
	}

	getColumn(child, item) {
		if (child.props.name) {
			this.usedColumns.push(child.props.name);

			return this.__getColumn(child.props.name, child, item);
		}

		let columns = Object.keys(this.state.columns);

		// Remove used columns
		columns = columns.filter( col => !_.contains(this.usedColumns, col));

		return columns.map(key => this.__getColumn(key, child, item));
	}

	__getColumn(column, child, item) {
		const props = {children: child.props.children},
			data = {columnId: column},
			callback = this[`column_${column}`] || this.props[`column_${column}`];

		if (callback) {
			callback.call(null, data, item, column);
		} else {
			data.column = item[column];
		}

		props.dataList = data;
		props.key = this.uniqId();

		return (<Render {...props}/>);
	}

	getDataList() {
		const data = {};

		data.attr = _.pick(this.props, ["className", "id"]);

		return data;
	}
}
Table.defaultProps = {templateId: "/template/table"};