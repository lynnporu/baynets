let worksheetName = undefined;

class Serializator {

	static _save_window;

	// Contains objects associated with numerical key as the priority of
	// serializing.
	static serializableObjects = {};

	static classNames = {}

	static dumpWorksheet() {

		const dump = [];

		for(const object of Serializator.iterateSerializables())
			dump.push({
				"_c": object.constructor.name, /* constructor */
				"_d": object.serializedObject, /* dump */
				"_u": object.uuid              /* uuid */
			})

		return JSON.stringify(dump);
	}

	static undumpWorksheet(dump) {
		for(const object of JSON.parse(dump)){
			const instance = Serializator
				.classNames[object["_c"] /* constructor */]
				.fromSerialized(
					object["_u"] /* uuid */,
					object["_d"] /* dump */
				);
		}
	}

	static openSaveDialog() {

		const windw = new Window(
			document.getElementById("save_dialog_template"),
			"auto", "auto"
		)

		Serializator._save_window = windw;

		const worker = (e) => {
			worksheetName = windw.element.querySelector(".name_input").value;
			windw.destroyDOM();
			Serializator.saveWorksheet();
		}

		windw.element
			.querySelector(".save_button").addEventListener("click", worker);

		windw.element
			.querySelector(".name_input").addEventListener("keyup", (e) => {
				if(e.keyCode == 13) worker(e);
			});

		windw.element.querySelector(".name_input").focus();

	}

	static saveWorksheet() {
		if(!worksheetName)
			Serializator.openSaveDialog();
		else
			saveAs(
				new Blob(
					[Serializator.dumpWorksheet()],
					{"type": "application/json;charset=utf-8"}
				),
				`${worksheetName}.json`
			);
	}
	static openWorksheet() {
		worksheetName = undefined;
	}

	static registerSerializable(priority, object) {
		// Kinda pythonic defaultdict
		const dict = Serializator.serializableObjects;
		if(!(priority in dict))
			dict[priority] = [];
		dict[priority].push(object);
	}

	static unregisterSerializable(object) {
		for(const priority of Object.keys(Serializator.serializableObjects))
			Serializator.serializableObjects[priority].delete(object);
	}

	static * iterateSerializables() {

		const priorities = Object
			.keys(Serializator.serializableObjects)
			.sort((a, b) => (a * 1) > (b * 1));

		for(const priority of priorities)
			yield* Serializator.serializableObjects[priority];

	}

}

document.body.addEventListener("keydown", (e) => {

	if(e.ctrlKey)
		switch(e.keyCode){
			case 83: /* KeyS */
				e.preventDefault();
				e.stopPropagation();
				Serializer.saveWorksheet();
				break;
			case 79: /* KeyO */
				e.preventDefault();
				e.stopPropagation();
				Serializer.openWorksheet();
				break;
		}

});
