import React from "react";
import {formatDate} from "../date";

/**
 Outputs user local formatted datetime.

 @param {string} date
 	The date string to format to. If not set, will use the user's local datetime.
 @param {string} dateFormat
 	The date format style.
**/
export default function DateTime({date, dateFormat}) {
	if (!date) {
		return null;
	}
	
	const dateTime = formatDate(date, dateFormat);

	return dateTime.local;
}