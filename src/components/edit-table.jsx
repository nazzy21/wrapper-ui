import React from "react";
import Table from "./table";

/**
 Inherits all the properties of <Table> template wrapper.

 @property {object} rowActions
**/
export default class EditTable extends Table {
	hasRowActions(columnId) {
		if (!this.props.rowActions) {
			return false;
		}

		return !!this.props.rowActions[columnId];
	}

	getDataList() {
		const {type, columns} = this.props, 
			dataList = {
				tableType: type,
				hasItems: this.hasItems(),
				rowActions: this.props.rowActions
			};

		return dataList;
	}

	getRowActions(child, item) {
		const actions = [];

		for(const {id, name, callback} of this.props.rowActions) {
			const dataList = {
				actionId: id,
				actionName: name,
				triggerAction: ev => callback(item)
			};

			actions.push(this.listTemplate(child.props.children, dataList));
		}

		return actions;
	}

	getRowColumns(child, item) {
		const columns = [];

		for(const key of Object.keys(this.state.columns)) {
			const value = item[key]||null,
				dataList = {
					columnId: key,
					columnValue: value,
					hasRowActions: this.hasRowActions(key),
					RowActions: child => this.getRowActions(child, item)
				};

			columns.push(this.listTemplate(child.props.children, dataList));
		}

		return columns;
	}
}