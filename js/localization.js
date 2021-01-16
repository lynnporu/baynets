let currentLocalization = "ua_UA";

const localizationStrings = {
	"ua_UA": {
		"window_close": "Закрити",
		"window_maximize": "Розгорнути",
		"save_changes": "Зберегти",
		"node_name": "Назва:",
		"node_edit_window_header_knot": "Налаштувати вузол",
		"node_edit_window_header_cases": "Налаштувати подію",
		"probability_invalid": "Ймовірність повинна бути задана у межах [0; 1]",
		"ribbon_add_node": "Подія",
		"ribbon_add_link": "Зв'язок"
	},
	"en_US": {
		"window_close": "Close",
		"window_maximize": "Maximize",
		"save_changes": "Save",
		"node_name": "Name:",
		"node_edit_window_header_knot": "Knot node settings",
		"node_edit_window_header_cases": "Event settings",
		"probability_invalid": "Probability value should lie in [0; 1] range",
		"ribbon_add_node": "Action",
		"ribbon_add_link": "Link"
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
