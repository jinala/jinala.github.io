
function readEditor(){
	var editor = ace.edit("editor");
	var program = editor.getValue();
	document.getElementById("program").value = program;
	return program;
}

slide = Slide("myCanvas", readEditor, "navigation", "slide");

function loadPictures(){
	var piclist = 	document.getElementById("pictures").innerText;
	piclist = piclist.split(" ");
	var html = "";
	for(x in piclist){
		var fname = piclist[x];
		var dpos = fname.lastIndexOf(".");
		var name = fname.substring(0, dpos);
		html += "<img src=\"images/" + fname +  "\" id=\""+name+"\" height=\"50\" onClick=\"displayName('"+name+"', event)\" />"
	}
	
	document.getElementById("pictures").innerHTML = html;
}



function displayName(name, evt){
	var popup = document.getElementById("labelpopup");
	popup.style.position = "absolute";
	popup.style.left = evt.pageX+'px';
	popup.style.top = evt.pageY+'px';
	popup.style.visibility = "visible";
	popup.innerHTML = name + "<BR> <button  type='button' onClick=\"insertDraw('"+name+"')\">Dr</button><button  type='button' onClick='closeName()'>X</button>";
}

function insertDraw(name){
	var editor = ace.edit("editor");
	editor.insert("draw(\"" +name+ "\", , , );\n");
}


function insertKeep(){
	var editor = ace.edit("editor");
	editor.insert("keep();\n");
}

function insertGoAway(){
	var editor = ace.edit("editor");
	editor.insert("goaway();\n");
}


function insertText(text){
	var editor = ace.edit("editor");
	editor.insert(text + "\n");
}

function closeName(){
	var popup = document.getElementById("labelpopup");
	popup.style.visibility = "hidden";
}

