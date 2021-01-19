let currentLocalization = "uk_UA";

const localizationStrings = {
	"uk_UA": {
		"reload_to_apply_language": "Перезавантажте сторінку для того, щоби оновити елементи інтерфейсу.",
		"close": "Закрити",
		"window_close": "Закрити",
		"window_maximize": "Розгорнути",
		"save_project_name": "Назва:",
		"save_worksheet": "Зберегти проєкт",
		"file_unable_open": "Не вдалось відкрити файл. Дивіться консоль.",
		"file_json_type": "Файли проєктів",
		"save": "Зберегти",
		"settings": "Налаштування",
		"node_name": "Назва:",
		"node_edit_window_header_knot": "Налаштувати вузол",
		"node_edit_window_header_cases": "Налаштувати подію",
		"node_hold_and_drag": "Утримуйте та потягніть",
		"node_keep_dragging": "Піднесіть до іншої події",
		"node_connection_already_exists": "Зв'зок вже існує",
		"node_connection_loop_is_not_allowed": "Петлі не дозволені",
		"node_connection_can_cause_cycle": {
			"one": "Цей зв'язок може утворити цикл у $n вузол",
			"few": "Цей зв'язок може утворити цикл у $n вузли",
			"many": "Цей зв'язок може утворити цикл у $n вузлів"
		},
		"node_delete": "Delete",
		"probability_invalid": "Ймовірність повинна бути задана у межах [0; 1]",
		"ribbon_add_node": "Подія",
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
		},
		"settings_appearance": "Вигляд",
		"settings_language": "Мова",
		"settings_constants": "Константи",
		"settings_maximum_bfs": "Обмеження ітерацій BFS",
		"settings_maxbfs_descr": "Для того, щоби запобігти безкінечному виконанню BFS внаслідок помилки, цим параметром можна обмежити максимальну кількість ітерацій.",
		"settings_maximum_backtrace": "Обмеження трасування дерев",
		"settings_maxbacktrace_descr": "Для того, щоби запобігти безкінечному бектрейсу в дереві внаслідок помилки, цим параметром можна обмежити максимальну глибину пошуку."
	},
	"en_US": {
		"reload_to_apply_language": "Reload page to refresh interface captions.",
		"close": "Close",
		"window_close": "Close",
		"window_maximize": "Maximize",
		"save": "Save",
		"save_project_name": "Name:",
		"node_name": "Name:",
		"settings": "Settings",
		"save_worksheet": "Save worksheet",
		"file_unable_open": "File opening fail. See console log.",
		"file_json_type": "Worksheet files",
		"node_edit_window_header_knot": "Knot node settings",
		"node_edit_window_header_cases": "Event settings",
		"node_hold_and_drag": "Hold and drag",
		"node_keep_dragging": "Link another node",
		"node_connection_already_exists": "Connection already exists",
		"node_connection_loop_is_not_allowed": "Loops are not allowed",
		"node_connection_can_cause_cycle": {
			"one": "This connection can cause cycle of $n node",
			"few": "This connection can cause cycle of $n nodes",
			"many": "This connection can cause cycle of $n nodes"
		},
		"node_delete": "Delete",
		"probability_invalid": "Probability value should lie in [0; 1] range",
		"ribbon_add_node": "Action",
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
		},
		"settings_appearance": "Appearance",
		"settings_language": "Language",
		"settings_constants": "Constants",
		"settings_maximum_bfs": "Maximum BFS size",
		"settings_maxbfs_descr": "In order to avoid infinite BFS as a result of an uncaught error, you can limit maximum iterations number.",
		"settings_maximum_backtrace": "Maximum tree backtrace",
		"settings_maxbacktrace_descr": "In order to avoid infinite tree backtrace as a result of an uncaught error, you can limit maximum iterations number."
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
