let currentLocalization = "uk_UA";

const localizationStrings = {
	"uk_UA": {
		"window_close": "Закрити",
		"window_maximize": "Розгорнути",
		"save_project_name": "Назва:",
		"save_worksheet": "Зберегти проєкт",
		"file_unable_open": "Не вдалось відкрити файл. Дивіться консоль.",
		"file_json_type": "Файли проєктів",
		"save": "Зберегти",
		"node_name": "Назва:",
		"node_edit_window_header_knot": "Налаштувати вузол",
		"node_edit_window_header_cases": "Налаштувати подію",
		"node_hold_and_drag": "Утримуйте та потягніть",
		"node_keep_dragging": "Піднесіть до іншої події",
		"node_connection_already_exists": "Зв'зок вже існує",
		"node_connection_can_cause_cycle": {
			"one": "Цей зв'язок може утворити цикл у $n вузол",
			"few": "Цей зв'язок може утворити цикл у $n вузли",
			"many": "Цей зв'язок може утворити цикл у $n вузлів"
		},
		"probability_invalid": "Ймовірність повинна бути задана у межах [0; 1]",
		"ribbon_add_node": "Подія",
		"ribbon_add_link": "Зв'язок",
		"ribbon_options": "Налаштувати",
		"ribbon_open": "Відкрити",
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
		"save": "Save",
		"save_project_name": "Name:",
		"node_name": "Name:",
		"save_worksheet": "Save worksheet",
		"file_unable_open": "File opening fail. See console log.",
		"file_json_type": "Worksheet files",
		"node_edit_window_header_knot": "Knot node settings",
		"node_edit_window_header_cases": "Event settings",
		"node_hold_and_drag": "Hold and drag",
		"node_keep_dragging": "Link another node",
		"node_connection_already_exists": "Connection already exists",
		"node_connection_can_cause_cycle": {
			"one": "This connection can cause cycle of $n node",
			"few": "This connection can cause cycle of $n nodes",
			"many": "This connection can cause cycle of $n nodes"
		},
		"probability_invalid": "Probability value should lie in [0; 1] range",
		"ribbon_add_node": "Action",
		"ribbon_add_link": "Link",
		"ribbon_options": "Options",
		"ribbon_open": "Open",
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
