
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
		enqueue("runChapter(" + newid + ");");	
	}	
}


function say(name, text){
	enqueue("sayInner(\""+name+"\" ,\""+text+"\")" );	
}

function sayInner(name, text){
	if( name in objs){
		var cur = objs[name];
		var x = cur.x;
		var y = cur.y;
		var size = dt;
		var c = document.getElementById("myCanvas");
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
	moveToInner(name, x, y, times);
	//enqueue("moveToInner(\""+name+"\" ," + x + ", " + y + "," + (times) + ")" );
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
		turnInner(namestr, {x:direction.x, y:direction.y});
		//enqueue( "turnInner("+namestr+" , { x:"+direction.x+" , y:"+direction.y+" })" );
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
		moveInner(namestr, {x:direction.x, y:direction.y});
		//enqueue( "moveInner("+namestr+" , { x:"+direction.x+" , y:"+direction.y+" })" );
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
	enqueue( "goawayInner(\""+name+"\")" );
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


