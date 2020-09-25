import React from "react";
import Template, {Render} from "../template";
import Screen from "../screen";
import CheckInput from "../input/checkbox";
import * as _ from "../utils";

export default class ListTable extends Template {
	constructor(props) {
		super(props);

		this.state = {
			page: this.props.page||1,
			items: this.props.items,
			select: false,
			selection: 0
		};
		this.usedColumns = [];
	}

	getColumns() {
		return this.props.columns||{};
	}

	getColumnHeading(child) {
		const columns = this.getColumns(),
			cols = [];

		for(const key of Object.keys(columns)) {
			const label = columns[key],
				props = {},
				data = {label};

			props.dataList = data;
			props.children = child.props.children;
			props.key = this.uniqId();

			cols.push(<Render {...props}/>);
		}

		return cols;
	}

	getRow(child) {
		const rows = [];

		this.usedColumns = [];

		for(const item of this.state.items) {
			const props = {},
				data = {};

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

		let columns = Object.keys(this.getColumns());

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

	column_select_input(item) {
		return (<CheckInput
			value = {this.getRowId(item)}
			/>);
	}

	getScreenId() {
		const {pageNow, typeNow} = Screen.get();

		return `${pageNow}-${typeNow}-${this.props.type}`;
	}

	getNumPages() {
		return Math.ceil(this.props.totalItems/this.props.perPage);
	}

	getActiveColumns() {
		return CurrentUser.getSetting(this.getScreenId(), this.props.defaultColumns);
	}

	getColumnList() {
		return this.props.columns;
	}

	getColumns33() {
		const active = this.getActiveColumns(),
			columns = this.getColumnList(),
			list = {};

		if (this.state.select) {
			list.all = {
				label: (<CheckInput
					label = {i18n("All")}
					onChange = {this.toggleSelect}
					/>),
				callback: this.column_select_input
			};
		}

		for(const columnId of active) {
			if (!columns[columnId]) {
				continue;
			}

			const {label, callback} = columns[columnId],
				_callback2 = this[`column_${columnId}`];

			list[columnId] = {label, callback:callback||_callback2};
		}

		return list;
	}

	getDataList33() {
		const {page} = this.state,
			{type, perPage} = this.props;

		const dataList = {
			type, 
			page, 
			numPages: this.getNumPages()
		};

		return dataList;
	}

	getTable(child) {
		const props = {
			className: `list-table list-${this.props.type}`,
			columns: this.getColumns(),
			items: this.state.items,
			ref: ref => {this.tableRef = ref}
		};

		return React.cloneElement(child, props);
	}

	getActionButtons(child) {
		return this.iterateChildren(child.props.children, {});
	}

	getActions() {
		return this.props.actions;
	}

	getButton(child) {
		const actions = this.getActions(),
			buttons = [];

		for(const typeId of Object.keys(actions)) {
			const props = extend({
				disabled: !this.state.selection,
				dataList: {type: typeId}
			}, actions[typeId]);

			buttons.push(React.cloneElement(child, props));
		}

		return buttons;
	}

	getPaginate(child) {
		const props = {
			page: this.state.page,
			perPage: this.props.perPage,
			totalItems: this.state.totalItems,
			ref: ref => {this.paginateRef = ref}
		};

		return React.cloneElement(child, props);
	}
}
ListTable.defaultProps = {templateId: "/template/list-table"};