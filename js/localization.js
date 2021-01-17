let currentLocalization = "ua_UA";

const localizationStrings = {
	"ua_UA": {
		"window_close": "Закрити",
		"window_maximize": "Розгорнути",
		"save_changes": "Зберегти",
		"node_name": "Назва:",
		"node_edit_window_header_knot": "Налаштувати вузол",
		"node_edit_window_header_cases": "Налаштувати подію",
		"node_hold_and_drag": "Утримуйте та потягніть",
		"node_keep_dragging": "Піднесіть до іншої події",
		"probability_invalid": "Ймовірність повинна бути задана у межах [0; 1]",
		"ribbon_add_node": "Подія",
		"ribbon_add_link": "Зв'язок",
		"statestring_nodes_cases": {
			"one": "$n подія",
			"few": "$n події",
			"many": "$n подій"
		},
		"statestring_causes_length_cases": {
			"one": "$n чинник",
			"few": "$n чинники",
			"many": "$n чинників"
		},
		"statestring_conseq_length_cases": {
			"one": "$n наслідок",
			"few": "$n наслідки",
			"many": "$n наслідків"
		}
	},
	"en_US": {
		"window_close": "Close",
		"window_maximize": "Maximize",
		"save_changes": "Save",
		"node_name": "Name:",
		"node_edit_window_header_knot": "Knot node settings",
		"node_edit_window_header_cases": "Event settings",
		"node_hold_and_drag": "Hold and drag",
		"node_keep_dragging": "Link another node",
		"probability_invalid": "Probability value should lie in [0; 1] range",
		"ribbon_add_node": "Action",
		"ribbon_add_link": "Link",
		"statestring_nodes_cases": {
			"one": "$n node",
			"few": "$n nodes",
			"many": "$n nodes"
		},
		"statestring_causes_length_cases": {
			"one": "$n parent",
			"few": "$n parents",
			"many": "$n parents"
		},
		"statestring_conseq_length_cases": {
			"one": "$n child",
			"few": "$n children",
			"many": "$n children"
		}
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

const getLocNumericalLabel = (name, number) => {

	const strings = getLocString(name),
	      abs = Math.abs(number);

	let form;
	if(abs == 1)                form = strings["one"];
	else if(abs > 0 && abs < 5) form = strings["few"];
	else                        form = strings["many"];

	return form.replace("$n", number);

}
