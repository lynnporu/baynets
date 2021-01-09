let currentLocalization = "ua_UA";

const localizationStrings = {
	"ua_UA": {
		"window_close": "Закрити",
		"window_maximize": "Розгорнути",
		"node_name": "Назва:",
		"node_edit_window_header_knot": "Налаштувати вузол",
		"node_edit_window_header_cases": "Налаштувати подію"
	},
	"en_US": {
		"window_close": "Close",
		"window_maximize": "Maximize",
		"node_name": "Name:",
		"node_edit_window_header_knot": "Knot node settings",
		"node_edit_window_header_cases": "Event settings"
	}
}

const getLocString = name => {
	const string = localizationStrings[currentLocalization][name];
	if(!string)
		throw TypeError(
			`'${name}' localization string does not exist`
		);
	else
		return string;
}
