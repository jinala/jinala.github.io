


function genCanvas(name){
	
	var elem = document.getElementById(name);
	var code = elem.innerHTML;
	function readEditor(){
		code =  code.replace(/&gt;/g, ">");
		return code;
	}
	
	window[name] = Slide(name, readEditor, name+'_navigation', "window." + name);
	elem.outerHTML = '<canvas id="'+name+'" width="1100" height="1800" style="border:1px solid #000000; " onMouseDown="window.'+name+'.clickDown(event)" onMouseUp="window.'+name+'.clickUp()" onMouseMove="window.'+name+'.clickUp()"></canvas><img src="images/Play.png" height="54" alt="" onClick="window.'+name+'.play()" onLoad="window.'+name+'.grid();"/><div style="font-size:25px"><input id="'+name+'_hasgrid" type="checkbox" onChange="window.'+name+'.gridonoff();">show grid</div><div id="'+name+'_navigation"></div>'
}
