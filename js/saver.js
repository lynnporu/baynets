const saveWorksheet = () => {

	console.log("saving");

}

const openWorksheet = () => {

	console.log("opening");

}

document.body.addEventListener("keydown", (e) => {

	if(e.ctrlKey)
		switch(e.keyCode){
			case 83: /* KeyS */
				e.preventDefault();
				e.stopPropagation();
				saveWorksheet();
				break;
			case 79: /* KeyO */
				e.preventDefault();
				e.stopPropagation();
				openWorksheet();
				break;
		}

});
