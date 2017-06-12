// For an introduction to the Blank template, see the following documentation:


function getImg(name, left, top) {
    // return '<img id='+name+' style="width: 152px; height: 95px;  position:relative; left:'+left+'px; top:'+top+'px;" src="images/' + name + '.png">';
    return '<div id=' + name + ' style="position:relative; left:' + left + 'px; top:' + top + 'px;"><img style="height: 95px;" src="images/' + name + '.png"></div>';
}

function addTextbox(name) {
    //return 'Hello';
    return '<div id=text'+name+' style="position:relative; left:150px; top:-195px;">' +
    '<div id=intext' + name + ' style="position:relative; left:12px; top:10px; width:150px; height:80px; border-radius:10px; background-color:rgb(19, 98, 35); color:rgb(224, 205, 94); padding:8px; font-size:18px; font-family:\'Berlin Sans FB\'"> Hello World  </div>' +
    '<div style="position:relative; left:0px; top:0px; width:20px; height:20px; background-color:rgb(19, 98, 35); color:rgb(224, 205, 94); "></div>' +
     '</div>';
}

var LEFT = -300;
var RIGHT = 1300;
var TOP = -100;
var BOT = 1000;
var cmdQueueHead = null;
var cmdQueueTail = null;

function enqueue(cmd){
	if(cmdQueueTail==null){
		cmdQueueTail = 	{cmd: cmd , next : null};
		cmdQueueHead = cmdQueueTail;
	}else{
		cmdQueueTail.next = {cmd: cmd , next : null};
		cmdQueueTail = cmdQueueTail.next;
	}
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


var actors = {};

function getActor(name) {
    
    if (name in actors) {
        return actors[name];
    } else {
        document.getElementById(name+"board").innerHTML = getImg(name, 0, 0);
        var tmp = document.getElementById(name);
        actors[name] = {
            html: tmp,
            texthtml:null,
            left: 0,
            top: 0,
            move: function () {
                var cactor = this;
				
				if (this.texthtml != null) {
					// var oldtxt = document.getElementById('text'+ name);
					// oldtxt.innerHTML = "";
					document.getElementById(name+"board").innerHTML = getImg(name, this.left, this.top);
					this.html = document.getElementById(name);
					this.texthtml = null;
				}
                return {
                    left: function () {
                        cactor.left -= 10;
                        if (cactor.left < LEFT) { cactor.left = RIGHT; }
                        cactor.html.style.setProperty('left', cactor.left + 'px'); return this;
                    },
                    right: function () {
                        cactor.left += 10;
                        if (cactor.left >RIGHT) { cactor.left = LEFT; }
                        cactor.html.style.setProperty('left', cactor.left + 'px'); return this;
                    },
                    up: function () {
                        cactor.top -= 10;
                        if (cactor.top < TOP) { cactor.top = BOT; }
                        cactor.html.style.setProperty('top', cactor.top + 'px'); return this;
                    },
                    down: function () {
                        cactor.top += 10;
                        if (cactor.top > BOT) { cactor.top = TOP; }
                        cactor.html.style.setProperty('top', cactor.top + 'px'); return this;
                    },
                    home: function () {
                        var me = this;
                        if(cactor.top > 0){
							me.up();
							pushFront(name + "().move().home()");
                        }else if(cactor.left > 0){
							me.left();
							pushFront(name + "().move().home()");
                            //setTimeout(function(){ me.left(); me.home(); }, 50);
                        } else if (cactor.top < -11) {
							me.down();
							pushFront(name + "().move().home()");
                            //setTimeout(function () { me.down(); me.home(); }, 50);
                        } else if (cactor.left < -11) {
							me.right();
							pushFront(name + "().move().home()");
                            //setTimeout(function () { me.right(); me.home(); }, 50);
                        }
                    }
                };
                // this.html.currentStyle.left = this.left+'px';
            },
            say: function(text){
                if (this.texthtml == null) {
                    //tmp.parentElement.innerHTML += addTextbox(name);
                    //this.html = document.getElementById(name);
                    this.html.innerHTML += addTextbox(name);
                    //document.getElementById(name + "board").innerHTML += addTextbox(name);
                    this.texthtml = document.getElementById('text' + name);
                }
                document.getElementById('intext' + name).innerHTML = text;
            },
            compute: function(expr){
                try {
                    var text = expr + " = ";
                    text += eval(expr);
                    this.say(text);
                } catch (e) { }
            }
        };
        return actors[name];
    }        
}



function marshall(){
	return getActor('marshall');
}

function rocky(){
	return getActor('rocky');
}

function zuma(){
	return getActor('zuma');
}

function skye(){
	return getActor('skye');
}

function ryder(){
	return getActor('ryder');
}

function chase(){
	return getActor('chase');
}

function pluto(){
	return getActor('pluto');
}

function minnie(){
	return getActor('minnie');
}

function mater() {
    return getActor('mater');
}

function everest() {
    return getActor('everest');
}

function nosmoking() {
    return getActor('nosmoking');
}

function playgroundsign() {
    return getActor('playgroundsign');
}

function playground(){
	return getActor('playground');		
}

function mickey() {
    return getActor('mickey');
}
function mcqueen() {
    return getActor('mcqueen');
}

function train() {
    return getActor('train');
}

function parse(cmd) {
	cmd = cmd.trim();
    var lst = cmd.split(" ");
    var outcmd = "";
    var inSay = false;
    var inWhatIs = false;
    var fst = true;
	var cidx = 0;
	var loop = 0;
	if(lst[cidx + 1] == "times" || lst[cidx + 1] == "time"){
		loop = lst[0];
		cidx = 2;
	}
    for (; cidx < lst.length; ++cidx) {
        var cc = lst[cidx];
        if (cc == "say" && !inSay && !inWhatIs) {
            inSay = true;
            outcmd += '.say("';
        } else if (cc == "what" && !inSay && !inWhatIs) {
            cidx++;
            cc = lst[cidx];
            //this should say 'is';
            inWhatIs = true;
            outcmd += '.compute("';
        
        }else{
            if (inSay || inWhatIs) {
                outcmd += " " + cc;
            } else {
                if (!fst) {
                    outcmd += ".";
                }
                outcmd += cc + "()";
            }
        }
        fst = false;
    }
    if (inSay || inWhatIs) {
        outcmd += '")';
    }    
	if(loop > 0){
		for(var i = 0; i < loop; ++i){
			enqueue(outcmd);	
		}
	}else{
		enqueue(outcmd);
	}
}



function runCommand() {
	var f = function(){
		var goodCmd = dequeue();
		if(goodCmd != null){
			try{
			eval(goodCmd);
			} catch (e) { }
			var delay = 60;
			if(goodCmd.includes("say") || goodCmd.includes("what")){
				delay = 2000;
			}
			setTimeout(function () { f(); }, delay);
		}
	}
	
	f();
}


function inchange(e) {
    var cmdbox = document.getElementById("command");
    var text = cmdbox.value;    
    if (e.keyCode == 13) {
	    parse(text);
        runCommand();
    }
}


function play(){
	var program = document.getElementById("program").value;
	var lines = program.split("\n");
	for(var i in lines){
		    parse(lines[i]);
	}
    runCommand();
}


function test() {
    mater().move().right();
    mater().move().down().right();
    mickey().move().right();
    mickey().move().down().right();
}
