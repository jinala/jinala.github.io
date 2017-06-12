
var dt = 21;
var Ox = 30;
var Oy = 30;

var clickX = -1;
var clickY = -1;



function Randomness(xa, xb, ya, yb){
	var rx = Math.random();
	var ry = Math.random();
	this.randx = function() {
		return rx *(xb-xa) + xa;
	}
	this.randy = function(){
		return ry *(yb-ya) + ya;		
	}	
	
	this.relRand = function(px , py){
		var vx = rx * 4 - 2;
		var vy = ry * 4 - 2;
		if(xa <= px+vx && px+vx <= xb && ya <= py+vy && py+vy <= yb){
			return 	{ x:vx , y:vy};
		}else{
			return {x:0,y:0};	
		}
	}
	
}


var oldObjs={};
var objs = {}

var cmdQueueHead = null;
var cmdQueueTail = null;

function emptyqueue(){
	return 	cmdQueueTail==null;
}

function enqueue(cmd){
	if(cmdQueueTail==null){
		cmdQueueTail = 	{cmd: cmd , next : null};
		cmdQueueHead = cmdQueueTail;
	}else{
		cmdQueueTail.next = {cmd: cmd , next : null};
		cmdQueueTail = cmdQueueTail.next;
	}
}

function queueLen(){
	var tmp = cmdQueueHead;
	var cnt = 0;
	while(tmp != null){
		cnt++;
		tmp = tmp.next;
	}
	return cnt;
}

function pushFront(cmd){
	var tmp = {cmd:cmd, next:cmdQueueHead};
	cmdQueueHead = tmp;
	if(cmdQueueTail == null){
		cmdQueueTail = cmdQueueHead;	
	}	
}

function dequeue(){
	if(cmdQueueHead == null){
		return null;	
	}else{
		var rv = cmdQueueHead;
		cmdQueueHead = cmdQueueHead.next;
		if(cmdQueueHead == null){
			cmdQueueTail = null;	
		}
		return rv.cmd;	
	}
}



var plist = {};
var curID = -1;
var paused = false;


function wrapup(){
	if(curID != -1){
		var clones = {};
		for(x in objs){
			clones[x] = objs[x].clone();	
		}
		oldObjs[curID] = clones;
	}
	updateNav();	
}

function processCodeBlock(text){
	var codeList = text.split("@");
	var code = "";
	var clickHandlers = {};
	clickHandlers["WHEN"] = null;
	for(x in codeList){
		var chunk = codeList[x];	
		var idx = chunk.indexOf('\n');
		var firstLine = chunk.substring(0, idx);	
		var clk = "click";
		var whn = "when";
		function startsWith(tag){
			if(firstLine.length >= tag.length){		
				var maybeword = firstLine.substring(0, tag.length);	
				if(maybeword === tag){
					return true;
				}
			}
			return false;
		}		
		if(startsWith(clk)){
			if(firstLine.length > clk.length +1){
				var fstQuote = firstLine.indexOf('"');
				var lastQuote = firstLine.lastIndexOf('"');
				if(lastQuote - fstQuote > 0){
					var clkName = firstLine.substring(fstQuote+1, lastQuote);
					clickHandlers[clkName] = chunk.substring(idx, chunk.length);
				}
			}else{
				clickHandlers["ALL"] = chunk.substring(idx, chunk.length);
			}
		}else{		
		    if(startsWith(whn)){			
				var cond = firstLine.substring(whn.length + 1, idx);
				var content = chunk.substring(idx, chunk.length);
				clickHandlers["WHEN"] = { cond: cond, action:content, next: clickHandlers["WHEN"]}
			}else{
				code += chunk;
			}
		}
		
	}
	
	eval(code);
	return clickHandlers;
}


var currentHandlers = {};

function runChapter(id){	
	id = Number(id);
	curID = id;
	var text = plist[id];	
	objs = {}
	currentHandlers = processCodeBlock(text);
	render();
	enqueue("wrapup();");
	var newid = id+1;
	var ehcount = Object.keys(currentHandlers).length;
	if(((newid) in plist) && !paused && ehcount === 1 ){
		enqueue("runChapter(" + (id+1) + ");");	
	}
	paused = false;
}



function updateNav(){
	var cntnt = "";	
	for(x in oldObjs){
		var	cont = plist[x];
		var firstline = cont.substring(0, cont.indexOf("\n"));
		cntnt += "<button style='font-size:20px; color=0xEE0000' onClick='startFrom("+ x + ")'>" + firstline + "</button><BR>"  ;
	}
	document.getElementById("navigation").innerHTML = cntnt;
}


function getProgramText(){
	var editor = ace.edit("editor");	
	var program = editor.getValue(); 
	document.getElementById("program").value = program;
	return program;
}

function processFromChange(){
	
	var program =  getProgramText();
	
	var oldplist = plist;
	plist = program.split(">>");
	var minid = -1;
	for(x in plist){
		if(!(x in oldplist && plist[x] === oldplist[x])){
			if(minid == -1){
				minid = x;	
			}
			if(x in oldObjs){
			  delete oldObjs[x];
			}
		}else{
			if(!(x in oldObjs)){
			  if(minid == -1){
					minid = x;	
				}
			}	
		}
		
	}
	
	if(minid != -1){
		runChapter(minid);	
	}
}




function processProg(){
	var program = getProgramText();	
	plist = program.split(">>");
	oldObjs = {};
	if(0 in plist){
		runChapter(0);	
	}
}

function startFrom(id){
	if(emptyqueue()){
		paused = true;
		runChapter(id);
		setTimeout(runCommand, 50);
	}
}



function playFromChange(){
	if(emptyqueue()){		
		processFromChange();
		setTimeout(runCommand, 50);
	}
}

function play(){
	if(emptyqueue()){
		processProg();
		setTimeout(runCommand, 50);
	}
}

function stop(){
	paused = true;
}


var left = {x:-1 , y : 0};
var right = {x:1, y:0};
var up = {x:0, y:-1};
var down = {x:0, y:1};




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



function gridonoff(){
	grid();
	render();
}


function cleanName(name){
	var vn = name.split(".");	
	return vn[0];
}


function getBBox(name, cur){
	var img = document.getElementById(cleanName(name));
	var ratio = img.naturalWidth / img.naturalHeight;
	var size = cur.size;
	var x = cur.x;
	var y = cur.y;
	var xp = x + size*ratio;
	var yp = y + size;	
	return {x:x, y:y, xp:xp, yp:yp};
}

function intersect(bbox1, bbox2){
	function rangeOverlap(v1, vp1, v2, vp2){
		if(v1 <= v2 && v2 <= vp1){
			return true;	
		}
		if(v2 <= v1 && v1 <= vp2){
			return true;	
		}
		return false;
	}
	return rangeOverlap(bbox1.x, bbox1.xp, bbox2.x, bbox2.xp) && rangeOverlap(bbox1.y, bbox1.yp, bbox2.y, bbox2.yp);
}

var keepClicking = false;

function clickDown(evt){
		console.log("Down");
	if(!keepClicking){
		keepClicking = true;
		clickHandler(evt.offsetX, evt.offsetY);
		var ox = evt.offsetX;
		var oy = evt.offsetY;
		setTimeout(function () { clickAgain(ox, oy); }, DELAY*queueLen());	
	}
}

function clickUp(){
		console.log("Up");
	keepClicking = false;
}


function clickAgain(offX, offY){
	if(keepClicking){
		clickHandler(offX, offY);
		setTimeout(function () { clickAgain(offX, offY); }, DELAY*queueLen());
	}	
}




function clickHandler(offX, offY){
	console.log("HAndler" + offX+ "  " + offY);
	clickX = Math.round((offX - Ox)	/ dt);
	clickY = Math.round((offY - Oy)	/ dt);
		var needsrun = emptyqueue();
		var ehcount = Object.keys(currentHandlers).length;
		if(ehcount > 0){
			var tmp = [];
			for(var name in objs){
				tmp.push(name);	
			}
			tmp.reverse();
			
			for(var ii in tmp){
				var name = tmp[ii];
				if(name in currentHandlers){
					var cur = objs[name];
					while(cur != null){
						
						var bbox = getBBox(name, cur);																		
						if(bbox.x <= clickX &&  clickX <= bbox.xp){
							if(bbox.y <= clickY && clickY <= bbox.yp ){
								eval(currentHandlers[name]);
								enqueue("wrapup();");
								if(needsrun){
									setTimeout(runCommand, 50);
								}
								return;
							}
						}
						cur = cur.next;
					}					
				}				
			}
			if("ALL" in currentHandlers){
				eval(currentHandlers["ALL"]);
				enqueue("wrapup();");		
			}								
		}
		if(needsrun){
			setTimeout(runCommand, 50);
		}
	highlight();	
}


function highlight(){	
	grid();
	render();
}


function render(){
	var c = document.getElementById("myCanvas");
	var ctx = c.getContext("2d");
	ctx.clearRect(0, 0, c.width, c.height);
	grid();
	for(name in objs){
		if(name === "WALL"){
			var cur = objs[name];			
			while(cur != null){
				var xa = cur.xa;
				var xb = cur.xb;
				var ya = cur.ya;
				var yb = cur.yb;
				ctx.beginPath();
				ctx.strokeStyle="purple";
				ctx.lineWidth = 5;
				ctx.moveTo(Ox+xa*dt, Oy+ya*dt);
				ctx.lineTo(Ox+xb*dt, Oy+yb*dt);
				ctx.stroke();
				cur = cur.next;
			}
		}else if(name === "TEXT"){			
			var cur = objs[name];
			while(cur != null){
				var x = cur.x;
				var y = cur.y;
				var size = cur.size;
				var text = cur.text;
				ctx.font = "" + 25*size + "px Arial";
				ctx.fillText(text,Ox + x*dt ,Oy + y * dt);
				cur = cur.next;			
			}
		}else if(cleanName(name)==="rect"){
			var cur = objs[name];
			var x = cur.x;
			var y = cur.y;
			cur.args.w;
			var c=document.getElementById("myCanvas");
			var ctx=c.getContext("2d");
			ctx.fillRect(x,y,x+cur.args.w,y+cur.args.h); 
			
		}else{			
			var cur = objs[name];
			while(cur != null){
				var x = cur.x;
				var y = cur.y;
				var size = cur.size;
				var img = document.getElementById(cleanName(name));
				var ratio = img.naturalWidth / img.naturalHeight;
				var cx = Math.floor(Ox + dt*x);
				var cy = Math.floor(Oy + dt*y);
				var szx = (size*dt*ratio);
				var szy = (size*dt);
				if(cur.ang != 0){	
					var szxo2 = szx / 2.0;
					var szyo2 = szy / 2.0;				
					ctx.translate(cx + szxo2 , cy + szyo2);
					var angle = cur.ang / 3.0;
					ctx.rotate(angle);
					ctx.drawImage(img, -szxo2, -szyo2, szx, szy);
					ctx.rotate(-angle);
					ctx.translate(-(cx+szxo2), -(cy+szyo2));					
				}else{
					ctx.drawImage(img,cx,cy, szx, szy);	
				}
				cur = cur.next;
			}
		}
		
	}
}



function grid(){
	var hg = document.getElementById("hasgrid");
	if(!hg.checked){
		return;	
	}
	var c = document.getElementById("myCanvas");
	var ctx = c.getContext("2d");
	ctx.strokeStyle="#DADADA";
	ctx.font = "10px Arial";	
	ctx.lineWidth = 1;
	var Nlines = 50;
	for(var i = 0; i<Nlines; ++i){
		ctx.fillText("" + i,Ox + i*dt-3,Oy - 10);
		ctx.fillText("" + i,Ox -dt,Oy + i*dt);				
		if(i==clickX){
			ctx.beginPath();
			ctx.strokeStyle="#20FA20";
			ctx.moveTo(Ox + i*dt, Oy);
			ctx.lineTo(Ox + i*dt, Oy + dt*Nlines);
			ctx.stroke();	
			ctx.fillStyle="#D80000";
			ctx.fillText("" + i,Ox + i*dt-3,Oy - 10);
			ctx.fillStyle="#000000";
			ctx.strokeStyle="#DADADA";
			ctx.beginPath();
		}else{
			ctx.moveTo(Ox + i*dt, Oy);
			ctx.lineTo(Ox + i*dt, Oy + dt*Nlines);
			ctx.stroke();	
		}
		if(i==clickY){
			ctx.beginPath();
			ctx.strokeStyle="#FA2020";
			ctx.moveTo(Ox, Oy + i*dt);
			ctx.lineTo(Ox + dt*Nlines, Oy + i*dt);
			ctx.stroke();
			ctx.fillStyle="#D80000";
			ctx.fillText("" + i,Ox -dt,Oy + i*dt);	
			ctx.fillStyle="#000000";
			ctx.strokeStyle="#DADADA";
			ctx.beginPath();
		}else{
			ctx.moveTo(Ox, Oy + i*dt);
			ctx.lineTo(Ox + dt*Nlines, Oy + i*dt);
			ctx.stroke();				
		}
	}
	
}


var DELAY = 50;
var DTalk = 2000;

function runCommand() {
	var f = function(){
		var goodCmd = dequeue();
		if(goodCmd != null){
			try{
			eval(goodCmd);
			} catch (e) { }
			
			if(emptyqueue()){
				if("WHEN" in currentHandlers){
					var cur = currentHandlers["WHEN"];
					while(cur != null){
						if(eval(cur.cond)){
							eval(cur.action);	
						}					
						cur = cur.next;	
					}					
				}
			}
			
			
			var delay = DELAY;
			if(goodCmd.includes("say")){
				delay = DTalk;
			}
			setTimeout(function () { f(); }, delay);
		}
	}
	
	f();
}
