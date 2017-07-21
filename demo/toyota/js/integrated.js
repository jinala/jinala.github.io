// JavaScript Document


function Queue(){
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
 
 return {emptyqueue:emptyqueue, queueLen:queueLen, pushFront:pushFront, dequeue:dequeue, enqueue:enqueue};
}





function Slide(canvasID, getProgramText, navID, varname){
	
	var objs = {};
	

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
	
	function keep(){
		if((curID-1) in oldObjs){
			objs = {};
			var tmp = oldObjs[curID-1];
			for(x in tmp){
				objs[x] = tmp[x].clone();	
			}
		}else{
			objs = {};	
		}
	}


function randIn(name){
	if( name in objs){
		var bbox = getBBox(name, objs[name]);
		return new Randomness(bbox.x, bbox.xp, bbox.y, bbox.yp);
	}else{
		return rand();	
	}
}

function rand(){
	return new Randomness(0, 50, 0, 50);	
}


function next(){
	var newid = curID + 1
	if(((newid) in plist)){
		queue.enqueue("runChapter(" + newid + ");");	
	}	
}


function say(name, text){
	queue.enqueue("sayInner(\""+name+"\" ,\""+text+"\")" );	
}

function sayInner(name, text){
	if( name in objs){
		var cur = objs[name];
		var x = cur.x;
		var y = cur.y;
		var size = dt;
		var c = document.getElementById(canvasID);
		var ctx = c.getContext("2d");
		var textwidth = (size * text.length)/2;
		var textheight = size;
		var posx = Ox + (x+2)*dt;
		var posy = Oy + y * dt;
		ctx.fillStyle="#C8C8C8";
		ctx.fillRect(posx-dt,posy-textheight*1.5,textwidth+2*dt, 2*textheight); 
		ctx.fillStyle="#000000";
		ctx.font = "" + size + "px Arial";
		ctx.fillText(text,posx ,posy);
	}
}



function moveTo(name, x, y, times){
	if(times == undefined){
		times = 10;	
	}
	if(x instanceof Randomness){
		y = x.randy();
		x = x.randx();	
	}
	queue.enqueue("moveToInner(\""+name+"\" ," + x + ", " + y + "," + (times) + ")" );
}

function moveToInner(name, x, y, times){
	if(times == undefined){
		times = 10;	
	}
   	if( name in objs){
		var cur = objs[name];
		var dx = x - cur.x;
		var dy = y - cur.y;
		moveInner(name, {x:dx/times, y:dy/times});
		if(times > 1){
			pushFront( "moveToInner(\""+name+"\" ," + x + ", " + y + "," + (times-1) + ")" );
		}
	}
}

function nameToStr(name){
	if(name instanceof Array){
		var rv = "[";
		for(var ii in name){
			rv += nameToStr(name[ii]);
			rv += ",";	
		}
		rv = rv.substring(0, rv.length - 1);
		return rv + "]";	
	}else{
		return "\"" + name + "\"";	
	}
}

function turn(name, direction, times){
	if(times == undefined){
		times = 1;	
	}
	var namestr = nameToStr(name);
	for(var i=0; i<times; ++i){
		queue.enqueue( "turnInner("+namestr+" , { x:"+direction.x+" , y:"+direction.y+" })" );
	}		
}


function turnInner(name, direction){
	
	if(name instanceof Array){
		for(var ii in name){
			turnInner(name[ii], direction);	
		}
		return;
	}
	
	if(name in objs){
		var cur = objs[name];
		while(cur != null){
			cur.ang += direction.x;				
			cur = cur.next;
		}
		render();		
	}	
}

function move(name, direction, times){
	if(times == undefined){
		times = 1;	
	}
	if(direction instanceof Randomness){
		var cur;
		if(name instanceof Array){
			cur = objs[name[0]];
		}else{
			cur = objs[name];
		}
		direction = direction.relRand(cur.x, cur.y);
	}
	
	var namestr = nameToStr(name);
	for(var i=0; i<times; ++i){
		queue.enqueue( "moveInner("+namestr+" , { x:"+direction.x+" , y:"+direction.y+" })" );
	}
}


function moveInner(name, direction){
	
	if(name instanceof Array){
		for(var ii in name){
			moveInner(name[ii], direction);	
		}
		return;
	}
	
	if(name in objs){
		var cur = objs[name];
		while(cur != null){
			cur.x += direction.x;	
			cur.y += direction.y;
			cur = cur.next;
		}
		render();		
	}	
}

function goaway(name){	
	queue.enqueue( "goawayInner(\""+name+"\")" );
}

function goawayInner(name){
	if(name in objs){
		delete objs[name];			
		render();		
	}
}


function touching(name1, name2){			
	var cur1 = objs[name1];
	while(cur1 != null){
		var cur2 = objs[name2];
		while(cur2 != null){
			var bbox1 = getBBox(name1, cur1);
			var bbox2 = getBBox(name2, cur2);			
			if(intersect(bbox1, bbox2)){
				return true;	
			}		
			cur2 = cur2.next;	
		}		
		cur1 = cur1.next;
	}
	return false;
}


function have(name){
	if(name in objs){
		return true;	
	}
	return false;
}

function getX(name){
	if(!(name in objs)){
		return 0;
	}
	var cur1 = objs[name];
	return cur1.x;		
}

function getY(name){
	if(!(name in objs)){
		return 0;
	}
	var cur1 = objs[name];
	return cur1.y;
}



function write(text, x, y, size){
	function TEXT(x, y, size, text, next){
		return 	{x:x, y:y, size:size, text:text, next:next, clone:function (){ 
			var nxt = this.next;
			if(nxt != null){ nxt = nxt.clone(); }
			return {x:this.x, y:this.y, size:this.size, text:this.text, next:nxt, clone:this.clone};
		 } };
	}
	
	var name = "TEXT";
	if(size == undefined){
		size = 5;	
	}
	if(name in objs){
		objs[name] = TEXT(x, y, size, text, objs[name]); 
	}else{
		objs[name] = TEXT(x, y, size, text, null); 
	}
}

function shape(name, x, y, args){
	function OBJ(x, y, args, next){
		return {x:x, y:y, ang:0, args:args, next:next, clone : function (){
			var nxt = this.next;
			if(nxt != null){ nxt = nxt.clone(); }
			return {x:this.x, y:this.y, ang:this.ang, args:this.args, next:nxt, clone : this.clone};
			} };
	}
	if(name in objs){
		objs[name] = OBJ(x, y, args, objs[name]); 
	}else{
		objs[name] = OBJ(x,y,args, null); 
	}
	return;
}

function draw(name, x, y, size){
	
	if(x instanceof Randomness){
		size = y;
		y = x.randy();
		x = x.randx();	
	}
	
	function OBJ(x, y, size, next){
		return {x:x, y:y, ang:0, size:size, next:next, clone : function (){
			var nxt = this.next;
			if(nxt != null){ nxt = nxt.clone(); }
			return {x:this.x, y:this.y, ang:this.ang, size:this.size, next:nxt, clone : this.clone};
			} };
	}
	if(size == undefined){
		size = 5;	
	}
	if(name in objs){
		objs[name] = OBJ(x, y, size, objs[name]); 
	}else{
		objs[name] = OBJ(x,y,size, null); 
	}
	return;
}


function wall(xa, ya, xb, yb){
	function WALL(xa, ya, xb, yb, next){
		return 	{xa:xa, ya:ya, xb:xb, yb:yb, next:next, clone:function(){
			var nxt = this.next;
			if(nxt != null){ nxt = nxt.clone(); }
			return 	{xa:this.xa, ya:this.ya, xb:this.xb, yb:this.yb, next:nxt, clone:this.clone };
		}};
	}
	var name = "WALL";
	if(name in objs){
		objs[name] = WALL(xa, ya, xb, yb, objs[name]);
	}else{
		objs[name] = WALL(xa, ya, xb, yb, null);
	}	
}



	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	var dt = 21;
	var Ox = 30;
	var Oy = 30;
	
	var clickX = -1;
	var clickY = -1;
	
	var queue = Queue();

	
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
		updateNav(navID);	
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
		queue.enqueue("wrapup();");
		var newid = id+1;
		var ehcount = Object.keys(currentHandlers).length;
		if(((newid) in plist) && !paused && ehcount === 1 ){
			queue.enqueue("runChapter(" + (id+1) + ");");	
		}
		paused = false;
	}

	function updateNav(navFrame){
		var cntnt = "";	
		for(x in oldObjs){
			var	cont = plist[x];
			var firstline = cont.substring(0, cont.indexOf("\n"));
			cntnt += "<button style='font-size:20px; color=0xEE0000' onClick='"+ varname +".startFrom("+ x + ")'>" + firstline + "</button><BR>"  ;
		}
		document.getElementById(navFrame).innerHTML = cntnt;
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
		if(queue.emptyqueue()){
			paused = true;
			runChapter(id);
			setTimeout(runCommand, 50);
		}
	}



	function playFromChange(){
		if(queue.emptyqueue()){		
			processFromChange();
			setTimeout(runCommand, 50);
		}
	}
	
	function play(){
		if(queue.emptyqueue()){
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
			setTimeout(function () { clickAgain(ox, oy); }, DELAY*queue.queueLen());	
		}
	}
	
	function clickUp(){
			console.log("Up");
		keepClicking = false;
	}

	
	function clickAgain(offX, offY){
		if(keepClicking){
			clickHandler(offX, offY);
			setTimeout(function () { clickAgain(offX, offY); }, DELAY*queue.queueLen());
		}	
	}


	
	
	function clickHandler(offX, offY){
		console.log("HAndler" + offX+ "  " + offY);
		clickX = Math.round((offX - Ox)	/ dt);
		clickY = Math.round((offY - Oy)	/ dt);
			var needsrun = queue.emptyqueue();
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
									queue.enqueue("wrapup();");
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
					queue.enqueue("wrapup();");		
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
		var c = document.getElementById(canvasID);
		var ctx = c.getContext("2d");
		ctx.clearRect(0, 0, c.width, c.height);
		grid();
		var name;
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
				var x = Math.floor(Ox + dt*cur.x);
				var y = Math.floor(Oy + dt*cur.y);				
				var c=document.getElementById(canvasID);
				var ctx=c.getContext("2d");
				if("color" in cur.args){
					ctx.fillStyle=cur.args.color;
				}else{
					ctx.fillStyle="#000000";
				}
				ctx.fillRect(x,y,dt*cur.args.w,dt*cur.args.h); 
				if("text" in cur.args){
					var size = 50;
					var color ="#990000";
					if("fontsize" in cur.args){
						size = cur.args.fontsize;	
					}
					if("fontcolor" in cur.args){
						color = cur.args.fontcolor;	
					}
					ctx.fillStyle= color;
					ctx.font = "" + size + "px Arial";
					ctx.fillText(cur.args.text,x +((dt*cur.args.w)/10.0),y+((dt*cur.args.h)/4.0));	
				}
				
			}else if(cleanName(name)==="circle"){
				var cur = objs[name];
				var x = Math.floor(Ox + dt*cur.x);
				var y = Math.floor(Oy + dt*cur.y);				
				var c=document.getElementById(canvasID);
				var ctx=c.getContext("2d");
				ctx.fillStyle="#000000";
				 ctx.beginPath();
				 ctx.arc(x, y, dt*cur.args.r, 0, 2*Math.PI, 0);		
				 ctx.closePath();	
				 ctx.fill();	 
				// ctx.stroke();
				if("text" in cur.args){
					var size = 50;
					var color ="#990000";
					if("fontsize" in cur.args){
						size = cur.args.fontsize;	
					}
					if("fontcolor" in cur.args){
						color = cur.args.fontcolor;	
					}
					ctx.fillStyle= color;
					ctx.font = "" + size + "px Arial";
					ctx.fillText(cur.args.text,x -((dt*cur.args.r*2.0)/3.0),y);	
				}				
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
	var hg = document.getElementById(canvasID + "_hasgrid");
	if(!hg.checked){
		return;	
	}
	var c = document.getElementById(canvasID);
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


var DELAY = 30;
var DTalk = 2000;

function runCommand() {
	var f = function(){
		var goodCmd = queue.dequeue();
		if(goodCmd != null){
			try{
			eval(goodCmd);
			} catch (e) { }
			
			if(queue.emptyqueue()){
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
//------------------------------------------------------------------	
	return {play:play, stop:stop, playFromChange:playFromChange, 
	        grid:grid, gridonoff:gridonoff, clickUp:clickUp, 
			clickDown:clickDown, startFrom:startFrom };
	
}
