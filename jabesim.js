var globalvar = {};
//Jabe klass that is the basis for the other jabes
Jabe_v1 = $.klass({

    actionsExecuted: 0,
    jabeFunctions:"",
    x:0,
    y:0, //y=0 means on the TOP of the screen!
    direction:0, //direction % 100. Then: 0 = top. 25 = right. 50 = bottom. 75 = left. 100 top again, etc
    energy:0,

    initialize : function(args) {
        this.jabeFunctions = args.jabeFunctions;
    },

    //the 'free' actions that a jabe can execute infinitely in a round
    checkFood: function(opts) {
        return this.jabeFunctions.checkFood(opts);
    },
    isWalkable: function(opts) {
        return this.jabeFunctions.isWalkable(opts);
    },
    isOccupied: function(opts) {
        return this.jabeFunctions.isOccupied(opts);
    },
    checkJabe: function(opts) {
        return this.jabeFunctions.checkJabe(opts);
    },
    checkActionsLeft: function(opts) {
        return this.jabeFunctions.checkActionsLeft(opts);
    },
    setDirection: function(opts) {
        return this.jabefunctions.setDirection(opts);
    },
    turn: function(opts) {
        return this.jabeFunctions.turn(opts);
    },
    
    //the actions that a Jabe can execute only as many times as 'settings.actionsPerTurn' , after which his turn ends
    eat: function(opts) {
        return this.jabeFunctions.eat(opts);
    },    
    move: function(opts) {
        return this.jabeFunctions.move(opts);
    },
    attack: function(opts) {
        return this.jabeFunctions.attack(opts);
    },
    reproduce: function(opts) {
        return this.jabeFunctions.reproduce(opts);
    }

    
});

//function to convert RGB strings to Hex
function RGBtoHex(r,g,b) {
    function hex(x) {
        var h = parseInt(x).toString(16);
        if (h.length == 1) { h = "0" + h; }
        return h;
    }
    return "#" + hex(r) + hex(g) + hex(b);
}
//function to convert Hex into RGB
function hexToRGB(hex) {
    function HexToR(h) {return parseInt((cutHex(h)).substring(0,2),16)}
    function HexToG(h) {return parseInt((cutHex(h)).substring(2,4),16)}
    function HexToB(h) {return parseInt((cutHex(h)).substring(4,6),16)}
    function cutHex(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h}
    return { r: HexToR(hex), g: HexToG(hex), b: HexToB(hex) };
}
function random(range) {
    return Math.round(Math.random()*range);
}
function isset () {
    var a=arguments, l=a.length, i=0;
    if (l===0) {
        throw new Error('Empty isset'); 
    }
    while (i!==l) {
        if (typeof(a[i])=='undefined' || a[i]===null) { 
            return false; 
        } else { 
            i++; 
        }
    }
    return true;
}
// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};
Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};
//Cloning of objects
Object.clone = function(obj) {
  var newObj = (obj instanceof Array) ? [] : {};
  for (i in obj) {
    if (i == 'clone') continue;
    if (this[i] && typeof obj[i] == "object") {
      newObj[i] = Object.clone(obj[i]);
    } else newObj[i] = obj[i]
  } return newObj;
};

//JQuery plugin that enables the jabe simulation
$.fn.jabeSimulation = function(setting){

    var settings = $.extend({
        jabeActionsPerTurn: 1,
        worldSizeX: 100, //TODO
        worldSizeY: 100, //TODO
        jabeEnergyCostPerTurn: 100,
        jabeMaxEatPerTurn: 250,
        jabeInitialEnergy: 500, //make sure this is not lower than jabeEnergyCostPerTurn, as it will remove the jabe imediately the first turn
        foodMaxGrowPerTurn: 1000, //TODO
	}, setting);

	var worldBackground = this[0];
	var worldInteraction = this[1];
	var svgWorld;
	var timer;
	var roundFlag = false;
	var roundCount = 0;
	var jabes = Array();
	var currentJabe;
	var currentJabeId = -1;
	var jabeTribes = {};

    //these are the variables and functions that are accessible by the Jabes
    this.jabeFunctions = {
        checkFood : function(opts) {
            //the Jabe that is currently under investigation can always be found in currentJabe
            if (!opts.x) { opts.x = 0; }
            if (!opts.y) { opts.y = 0; }
            return world.getAreaAtXY((currentJabe.x + opts.x * 1), (currentJabe.y + opts.y * 1)).food;
        },
        isWalkable: function(opts) {
            //the Jabe that is currently under investigation can always be found in currentJabe
            if (isset(opts.direction)) {
                var dir = currentJabe.direction;
                this.turn({direction:opts.direction});
                //if (x and y are not set, then just move in the current direction)
                var d = Math.round(((currentJabe.direction % 100) / 100) * (2 * Math.PI) * 1000) / 1000; //the rounding (keeping 4 digits) seems necessary for the sin() and cos() function...
                opts.x = Math.round(Math.sin(d));
                opts.y = Math.round(Math.cos(d));
                currentJabe.direction = dir;
            }
            if (!isset(opts.x)) { opts.x = 0; }
            if (!isset(opts.y)) { opts.y = 0; }
            return world.getAreaAtXY((currentJabe.x + opts.x * 1), (currentJabe.y + opts.y * 1)).walkable;
        },
        isOccupied: function(opts) {
            //the Jabe that is currently under investigation can always be found in currentJabe
            if (isset(opts.direction)) {
                var dir = currentJabe.direction;
                this.turn({direction:opts.direction});
                //if (x and y are not set, then just move in the current direction)
                var d = Math.round(((currentJabe.direction % 100) / 100) * (2 * Math.PI) * 1000) / 1000; //the rounding (keeping 4 digits) seems necessary for the sin() and cos() function...
                opts.x = Math.round(Math.sin(d));
                opts.y = Math.round(Math.cos(d));
                currentJabe.direction = dir;
            }
            if (!isset(opts.x)) { opts.x = 0; }
            if (!isset(opts.y)) { opts.y = 0; }
            return world.getAreaAtXY((currentJabe.x + opts.x * 1), (currentJabe.y + opts.y * 1)).occupied;
        },
        checkJabe : function(opts) {
            //the Jabe that is currently under investigation can always be found in currentJabe
            if (!opts.x) { opts.x = 0; }
            if (!opts.y) { opts.y = 0; }
            if (world.getAreaAtXY((currentJabe.x + opts.x), (currentJabe.y + opts.y)).occupied == true) {
                var jabe = world.getAreaAtXY((currentJabe.x + opts.x * 1), (currentJabe.y + opts.y * 1)).occupiedBy;
                return { name: jabe.name, x: jabe.x, y: jabe.y }; //just x,y and tribename are exposed
            } else {
                return null;
            }
        },
        checkActionsLeft: function(opts) {
            return (settings.jabeActionsPerTurn - currentJabe.actionsExecuted);
        },
        setDirection: function(opts) {
            if (opts.direction == "west") {
                currentJabe.direction = 75;
            } else if (opts.direction == "north") {
                currentJabe.direction = 0;
            } else if (opts.direction == "east") {
                currentJabe.direction = 25;
            } else if (opts.direction == "south") {
                currentJabe.direction = 50;
            } else {
                currentJabe.direction = opts.direction;
            }
        },
        turn: function(opts) {
            if (opts.direction == "left") {
                currentJabe.direction -= 25;
            } else if (opts.direction == "right") {
                currentJabe.direction += 25;
            } else if (opts.direction == "back" || opts.direction == "backwards") {
                currentJabe.direction += 50;
            }
        },

        move: function(opts) {
            if(this.checkActionsLeft() > 0) {
                currentJabe.actionsExecuted++;
                if (!opts) { opts = {}; }
                var targetx = currentJabe.x;
                var targety = currentJabe.y;
                //check if opts.x or opts.y are set, as to move in a certain 'absolute' direction
                if (opts.x && (opts.x > 0 || opts.x < 0)) {
                    targetx = currentJabe.x + opts.x;
                } else if (opts.y && (opts.y > 0 || opts.y < 0)) {
                    targety = currentJabe.y + opts.y;
                } else {
                    //if (x and y are not set, then just move in the current direction)
                    var d = Math.round(((currentJabe.direction % 100) / 100) * (2 * Math.PI) * 1000) / 1000; //the rounding (keeping 4 digits) seems necessary for the sin() and cos() function...
                    targetx = currentJabe.x + Math.round(Math.sin(d)); //direction 25 (to the right) will yield a d of (0,25 * 2 PI) of which the sin() will yield 1 (thus one x to the right)
                    targety = currentJabe.y + Math.round(Math.cos(d)); //direction 25 (to the right) will yield a d of (0,25 * 2 PI) of which the cos() will yield 0 (thus no y movement)
                }
                //check whether the move is allowed, in that the field is walkable and not a border
                if (world.getAreaAtXY(targetx,targety).type != "border" && world.getAreaAtXY(targetx,targety).walkable == true) {
                    //now check if the field is not already occupied
                    if (world.getAreaAtXY(targetx,targety).occupied == true) {
                        //you can't just 'move' to an occupied space. You should 'attack' to do so
                    } else {
                        //clear the field that the jabe is currently on
                        world.getAreaAtXY(currentJabe.x,currentJabe.y).occupied = false;
                        world.getAreaAtXY(currentJabe.x,currentJabe.y).occupiedBy = {};
                        //move
                        currentJabe.x = targetx;
                        currentJabe.y = targety;
                        //set that the currentJabe has entered the worldArea
                        world.getAreaAtXY(targetx,targety).occupied = true;
                        world.getAreaAtXY(targetx,targety).occupiedBy = currentJabe;
                    }
                }
            }
        },
        attack: function(opts) {
            if(this.checkActionsLeft() > 0) {
                currentJabe.actionsExecuted++;
                if (!opts) { opts = {}; }
                var targetx = currentJabe.x;
                var targety = currentJabe.y;
                //check if opts.x or opts.y are set, as to move in a certain 'absolute' direction
                if (opts.x && (opts.x > 0 || opts.x < 0)) {
                    targetx = currentJabe.x + opts.x;
                } else if (opts.y && (opts.y > 0 || opts.y < 0)) {
                    targety = currentJabe.y + opts.y;
                } else {
                    //if (x and y are not set, then just move in the current direction)
                    var d = Math.round(((currentJabe.direction % 100) / 100) * (2 * Math.PI) * 1000) / 1000; //the rounding (keeping 4 digits) seems necessary for the sin() and cos() function...
                    targetx = currentJabe.x + Math.round(Math.sin(d));
                    targety = currentJabe.y + Math.round(Math.cos(d));
                }
                //check whether the move is allowed, in that the field is walkable and not a border
                if (world.getAreaAtXY(targetx,targety).type != "border" && world.getAreaAtXY(targetx,targety).walkable == true) {
                    //now check if the field is not already occupied. If so, we will fight
                    if (world.getAreaAtXY(targetx,targety).occupied == true) {
                        //attack
                        //decide on the winner
                        if (world.getAreaAtXY(targetx,targety).occupiedBy.energy > currentJabe.energy) {
                            //defender wins, currentJabe loses
                            world.getAreaAtXY(targetx,targety).occupiedBy.energy -= currentJabe.energy;
                            //clear the space of the currentJabe
                            world.getAreaAtXY(currentJabe.x,currentJabe.y).occupied = false;
                            world.getAreaAtXY(currentJabe.x,currentJabe.y).occupiedBy = {};
                            //remove currentJabe
                            jabes.remove(currentJabeId);
                            currentJabeId--;
                            currentJabe = null;
                        } else {
                            //attacker (=currentJabe) wins
                            currentJabe.energy -= world.getAreaAtXY(targetx,targety).occupiedBy.energy;
                            //remove the losing jabe
                            l = jabes.length-1;
                            for(die=l;die>=0;die--) {
                                if (jabes[die].x == targetx && jabes[die].y == targety) {
                                    jabes.remove(die);
                                    if (die <= currentJabeId) {
                                        currentJabeId--;
                                    }
                                }
                            }
                            //clear the space
                            world.getAreaAtXY(targetx,targety).occupied = false;
                            world.getAreaAtXY(targetx,targety).occupiedBy = {};
                        }
                    } else {
                        //nothing to attack, so do nothing
                    }
                }
            }
        },
        eat: function(opts) {
            if(this.checkActionsLeft() > 0) {
                currentJabe.actionsExecuted++;
                // Check how much the Jabe will eat
                if (!opts.amount) 
                {
                    // Eat as much as Jabe can
                    opts.amount = settings.jabeMaxEatPerTurn;
                }
                else
                {
                    // Level off the amount of food eaten to the max amount per turn
                    opts.amount = Math.min(opts.amount, settings.jabeMaxEatPerTurn);
                }
                var takenfood = Math.min(opts.amount, world.getAreaAtXY(currentJabe.x, currentJabe.y).food);
                currentJabe.energy += takenfood;
                // While eating, a certain amount of plants are eaten in order to get the required energy/food
                // Thus, calculate the average plants/food (or food / plant), and then remove so much plants as needed for the required energy
                var plantsperfood = world.getAreaAtXY(currentJabe.x, currentJabe.y).plants / world.getAreaAtXY(currentJabe.x, currentJabe.y).food;
                world.getAreaAtXY(currentJabe.x, currentJabe.y).plants -= Math.round(takenfood * plantsperfood);
                world.getAreaAtXY(currentJabe.x, currentJabe.y).food -= takenfood;
            }
        },
        reproduce: function(opts) {
            if (this.checkActionsLeft() > 0){
                currentJabe.actionsExecuted++;
                //create another Jabe of the same kind. It takes 1000 energy to produce a Jabe. Then, the rest of the energy is transfered to the new Jabe
                //TODO: transfering energy costs a turn
                currentJabe.energy -= opts.energy;
                var newJabe = eval("new " + currentJabe.name + "({jabeFunctions: this })");
                jabes.push(newJabe);
                newJabe.x = currentJabe.x;
                newJabe.y = currentJabe.y;
                newJabe.actionsExecuted = 0;
                newJabe.energy = (opts.energy - 1000);
            }
        }
    };


    //Klass that represents the world, and has actions to ie get a certain world-block at a certain x,y; or a Jabe at x,y; or a 'color' (for the renderer) at certain x,y etc.
    var World = $.klass({

	    jabeWorldSizeX : 100,
	    jabeWorldSizeY : 100,
	    jabeWorldAreas : {},
        //Klass that represents an area of the world (might be a big/small block, that depends on how the World Klass wants to represent the world
        jabeWorldArea : $.klass({
            walkable: true,
            type: "crops",
            occupied: false,
            occupiedBy: {},
            plants: 0, //1000 plants on a field is a maximum
            food: 0, //if every plant is fullgrown, there are 1000 plants with 1 'food' per plant, so 1000 food is a maximum
            weed: 0,
            initialize: function(args) {
                if (isset(args.walkable)) { this.walkable = args.walkable; }
                if (isset(args.type)) { this.type = args.type; }
                if (isset(args.plants)) { this.plants = args.plants; }
                if (isset(args.food)) { this.food = args.food; }
                if (isset(args.weed)) { this.weed = args.weed; }
            }
        }),

        initialize: function() {
            for(x=0;x<this.jabeWorldSizeX;x++) {
                this.jabeWorldAreas[x] = {};
                for(y=0;y<this.jabeWorldSizeY;y++) {
                    //if we are at the borders (x=0, y=0, y=worldsizey-1, x=worldsizex-1), then create a 'border' area
                    if (x==0 || y==0 || x==this.jabeWorldSizeX-1 || y==this.jabeWorldSizeY-1) {
                        this.jabeWorldAreas[x][y] = new this.jabeWorldArea({food: -10, type: "border", walkable: false});
                    } else {
                        this.jabeWorldAreas[x][y] = new this.jabeWorldArea({plants: random(400), food: random(1000), type: "crops", walkable: true});
                    }
                }
            }
        },

        round: function() {
            //let the food grow!
            for(x in this.jabeWorldAreas) {
                for(y in this.jabeWorldAreas[x]) {
                    var area = this.jabeWorldAreas[x][y];
                    if (area.type != "border") {
                        //the growth of food on a field is determined by the amount of existing plants that grow naturally
                        //this amount of existing plants can however also grow, depending on:
                        //1. how much 'space' there is for new plants (the less crops on a field, the more growth potential)
                        //2. how many seeds get to the field (seeds come from adjacent fields and the field itself) 
                        //first, calculate the amount of seeds that come from the field itself and the surrounding fields
                        seeds = 0;
                        for (dx = -1; dx<=1; dx++) {
                            for(dy = -1; dy<=1; dy++) {
                                //skip when field is a border
                                //the line below is commented to speed up the app
                                //instead, the check (if(fieldseeds>0)) is added, as borders and such always have negative amount of food
                                //if (this.jabeWorldAreas[(x*1)+dx][(y*1)+dy].type != "border") {
                                    //the amount of seeds is determined by the amount of plants that are available and the mean age of the plants (the older the plants, the more seeds)
                                    //the amount of seeds per plant varies from 0 - 10: a small plant (0 food) has 0 seeds, a fullgrown plant (1 food) has 10 seeds
                                    //thus, seeds = .plants * ( .food / .plants) * 10 = .food * 10
                                    var fieldseeds = this.jabeWorldAreas[(x*1)+dx][(y*1)+dy].food * 10;
                                    //at a field, 8/10 seeds are blown away, 2/10 stays in the same field
                                    if(fieldseeds > 0) {
                                        if (dx == 0 && dy == 0) {
                                            //from the field itself, 2/10 actually hit the x,y field
                                            seeds += 2/10 * (fieldseeds);
                                        } else {
                                            //every plant of adjacent fields gives 1/10 of their seedproduction to the x,y field in question
                                            seeds += 1/10 * (fieldseeds);
                                        }
                                    }
                                //}
                            }
                        }
                        //now, from the seeds that come to this field, they only turn into plants when there is space for them to grow (and where they don't die etc)...
                        //max 10 000 seeds can come onto a field, of which a max of 10 will turn into plants
                        if (seeds > 0) {
                            currentPlants = area.plants;
                            newPlants = Math.round(seeds / 1000 * (1 - (currentPlants / 1000)) );
                            area.plants = currentPlants + newPlants;
                        }
                        //and now, let the plants grow!!
                        //every plant gets 0.1 food per turn
                        currentFood = area.food;
                        newFood = Math.round((currentPlants + newPlants) * 0.05);
                        if (currentFood+newFood > 1000) {
                            area.food = 1000;
                        } else {
                            area.food = currentFood+newFood;
                        }
                    }
                }
            }
        },

        getAreaAtXY: function(x,y) {
            return this.jabeWorldAreas[x][y];
        },

        getColorAtXY: function(x,y) {
            //food-amount ranges from 0 to 1000
            rgbval = Math.round(this.getAreaAtXY(x,y).food * 255 / 1000);
            //to speed up the simulation, round the value to 26 shades
            //then, more subsequent values will have the same color, so that setColor on the canvas does not need to be called
            rgbval = Math.round(rgbval / 10) * 10;
            return "rgb(0," + rgbval + ",0)"; //food is green
        }

    });
    var world;

    //The 2D renderer, toolkit used for drawing the world
    var Renderer = $.klass({

        canvasElm : "",
        context2D : "",
        canvasSizeX : 0, //the real size of the canvas element on-screen
        canvasSizeY : 0,
        drawingSizeX : 0, //the size of the drawed elements alltogether (how many pixels wide the drawing is)
        drawingSizeY : 0, 
        fitDrawingToCanvas : true,
        initialize: function(canvasElm) {
            this.canvasElm = canvasElm;
            //make the canvas have 'real' width and height instead of arbitrary CSS width and height
            $(worldBackground).attr("width",$(canvasElm).width());
            $(worldBackground).attr("height",$(canvasElm).height());
            //now store the sizes
            this.canvasSizeX = $(canvasElm).width();
            this.canvasSizeY = $(canvasElm).height();         
            this.context2D = canvasElm.getContext('2d');
        },

        clear: function() {
            this.context2D.clearRect(0,0,this.canvasSizeX,this.canvasSizeY); //clear that part of the canvas that is on-screen
        },

        translateCoords: function() {
            //(assuming x,y,width,height as arguments)
            //first, reverse the Y Axis (!)
            //canvas sees y=0 at top, while we see y=0 at bottom. So simply reverse
            args = arguments;
            args[1] = (this.drawingSizeX - 1 - args[1]); //flipzor
            //translate the coords from the drawing to the canvas
            //if fitDrawingToCanvas is enabled, then fit the drawing on how wide/high the canvas is
            if (this.fitDrawingToCanvas == true) {
                //find out whether Width of Height is the most restraining factor
                //thus if the translation should be on basis of Width or Height
                if (this.drawingSizeX / this.canvasSizeX > this.drawingSizeY / this.drawingSizeY) {
                    //restraint on height
                    factor = this.canvasSizeX / this.drawingSizeX;
                    return Array(arguments[0] * factor, args[1] * factor, args[2] * factor, args[3] * factor, args[4] * factor);
                } else {
                    //restraint on width
                    factor = this.canvasSizeY / this.drawingSizeY;
                    return Array(arguments[0] * factor, args[1] * factor, args[2] * factor, args[3] * factor, args[4] * factor);
                }
            } else {
                //otherwise, just return
                return args;
            }
            
        },

        //set  the fill in either 
        //- one string (CSS3 format, = #fff or rgb(255,255,255) or rgba(255,255,255,1))
        //- two values, hex and alpha (0-1)
        //- three values, r,g,b
        //- four values, r,g,b and alpha (0-1)
        setFill: function() {
            if (arguments.length == 1) {
                //one string
                this.context2D.fillStyle = arguments[0];
            } else if (arguments.length == 2) {
                //two strings, hex and alpha
                rgb = hexToRGB(arguments[0]);
                this.context2D.fillStyle = "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + "," + arguments[1] + ")";
            } else if (arguments.length == 3) {
                //three strings, rgb
                this.context2D.fillStyle = "rgb(" + arguments[0] + "," + arguments[1] + "," + arguments[2] + ")";
            } else if (arguments.length == 4) {
                //r,g,b,a
                this.context2D.fillStyle = "rgba(" + arguments[0] + "," + arguments[1] + "," + arguments[2] + "," + arguments[3] + ")";
            }
        },

        setGlobalAlpha: function() {
            this.context2D.globalAlpha = arguments[0];
        },

        //drawing functions
        drawRect: function() {
            this.drawFillRect.apply(this, arguments);
        },
        drawFillRect: function() {
            arguments = this.translateCoords.apply(this,arguments);
            this.context2D.fillRect(arguments[0], arguments[1], arguments[2], arguments[3]);
        },
        drawCircle: function() {
            this.drawFillCircle.apply(this. arguments);
        }, 
        drawFillCircle: function() {
            args = this.translateCoords.apply(this,arguments);
            this.context2D.beginPath();
            this.context2D.arc(args[0] + Math.round(args[2] / 2),args[1] + Math.round(args[2] / 2),Math.round(args[2] / 2),0,(2 * Math.PI), false);
            this.context2D.fill();
        }

    });
    var renderer;
    
    this.getJabeTribes = function() {
        return jabeTribes;
    }

    this.loadJabe = function(name) {
        //NOTE: name of Jabe Klass and the Jabe filename should be identical!
        
        //load Jabe, if it does not yet exists
        if(typeof(jabeTribes[name]) != "object") {
            //check if we need to include the Javascript class-file
            if (eval("typeof(" + name +")") != "function") {
                $("body").append("<script src='jabes/" + name + ".js'></script>");
            }
            jabeTribes[name] = { name: name, ancestor: eval(name + ".ancestor") };
        }
    }

    this.unloadJabe = function(name) {
        //remember that the included javascript file is not 'unloaded'!
        delete jabeTribes[name];
    }
    
    this.unloadAllJabes = function() {
        jabeTribes = {};
    }

    this.start = function() {
        //reset some values
        world = new World();
        jabes = [];
        roundCount = 0;
        roundFlag = false;
        //create initially a Jabe of every kind
        tribeCounter = 0;
        //create random offset for starting positions
        var offset = Math.random() * 2 * Math.PI;
        for(jabeName in jabeTribes) {
            tribeCounter++;
            newJabe = eval("new " + jabeName + "({jabeFunctions: this.jabeFunctions})");
            jabes.push(newJabe);
            newJabe.energy = settings.jabeInitialEnergy;
            //calculate starting locations
            //jabes start in a circle, evenly distributed on it
            newJabe.x = Math.round( Math.sin(Math.round(tribeCounter / Object.size(jabeTribes) * 2 * Math.PI * 10000) / 10000 + offset) * (settings.worldSizeX / 3) + (settings.worldSizeX / 2) );
            newJabe.y = Math.round( Math.cos(Math.round(tribeCounter / Object.size(jabeTribes) * 2 * Math.PI * 10000) / 10000 + offset) * (settings.worldSizeY / 3) + (settings.worldSizeY / 2) );
        }
        //start the simulation by setting a timer to fire every 1/100 second
        var ref = this;
        startTime = new Date().getTime(); //for benchmarking
        delete(this.timer);
        this.timer = setInterval(function() { ref.round(); }, 10);
    }
    
    this.pauseresume = function() {
        if (isset(this.timer)) {
            clearInterval(this.timer);
            delete(this.timer);
        } else {
            var ref = this;
            this.timer = setInterval(function() { ref.round(); }, 10);
        }
    }

    this.stop = function() {
        clearInterval(this.timer);
        delete(this.timer);
    }

    this.round = function() {
        //only execute round if previous round has been executed
        if (roundFlag == false) {
            roundFlag = true;
            //if (roundCount < 100) { //Simple benchmarking of 100 turns
                //increase round counter
                roundCount++;
                //------------
                // WORLD
                //------------
                //let the world make the food grow, etc
                var sTime = new Date().getTime();
                world.round();
                //draw the world
                for(x=0;x<world.jabeWorldSizeX;x++) {
                    for(y=0;y<world.jabeWorldSizeY;y++) {
                        var prevcolor = color;
                        var color = world.getColorAtXY(x,y);
                        //--the next rendering part takes 90% of the round-time. Disable to speed-up simulation
                        if (prevcolor != color) {
                            renderer.setFill(color); //this costs 40% of the round-time
                        }
                        //for rendering, the canvas has y=0 at the bottom (while we want y=0 to be at top)
                        
                        renderer.drawFillRect(x,y,1,1); //this costs 50% of the round-time.
                        //--end rendering part
                    }
                }
                //document.title += "na tekenen wereld:" + (new Date().getTime() - sTime); //for benchmarking
                //alert('klaar');
                //------------
                // JABES
                //------------
                //now run all the jabes...
                for(currentJabeId=jabes.length-1;currentJabeId>=0;currentJabeId--) {
                    currentJabe = jabes[currentJabeId];
                    currentJabe.actionsExecuted = 0;
                    currentJabe.energy -= settings.jabeEnergyCostPerTurn;
                    if (currentJabe.energy < 0) {
                        //de-occupy the Area the jabe is on and remove the Jabe
                        if (world.getAreaAtXY(currentJabe.x, currentJabe.y).occupiedBy == currentJabe) {
                            world.getAreaAtXY(currentJabe.x, currentJabe.y).occupied = false;
                            world.getAreaAtXY(currentJabe.x, currentJabe.y).occupiedBy = {};
                        }
                        jabes.remove(currentJabeId);
                        currentJabeId--;
                        continue;
                    } else {
                    globalvar.beforeCurrentJabeId = currentJabeId;
                        actionJabe = Object.clone(currentJabe);
                        actionJabe.action(); //this will place the Jabe in a sandbox, so that the Jabe can do this.x = 50, but that will not work,
                                             //as only the .x of the actionJabe is changed, not the 'real x' of the currentJabe
                                             //when a function like this.move() is called however, the jabeFunctions will work on the currentJabe, NOT on the actionJabe
                        //this should be done with SVG, and made interactive...
                        //if jabe still exists (i.e. didn't die), then draw it
                        if (currentJabe != null) {
                            counter = 0;
                            for(tribeName in jabeTribes) {
                                counter++;
                                if (currentJabe.name == tribeName) {
                                    break;
                                }
                            }
                            if (counter == 1) { 
                                renderer.setFill("rgb(0,0,255)"); //blue
                            } else if (counter == 2) {
                                renderer.setFill("rgb(255,255,0)"); //yellow
                            } else if (counter == 3) {
                                renderer.setFill("rgb(255,255,255)"); //white
                            } else {
                                renderer.setFill("rgb(200,0,200)"); //red
                            }
                            renderer.drawFillCircle(currentJabe.x,currentJabe.y,1,1);
                         }
                     }
                }
                //-------------
                // STATS
                //-------------
                /*
                var occupiedAreas = 0;
                for(x=0;x<world.jabeWorldSizeX;x++) {
                    for(y=0;y<world.jabeWorldSizeY;y++) {
                         if (world.getAreaAtXY(x,y).occupied == true) {
                            occupiedAreas++;
                         }
                    }
                }*/
                
                //mark the end of the turn, so that a new one can be started
                roundFlag = false;
            //} else {
            //    clearInterval(this.timer);
            //    stopTime = new Date().getTime();
            //    alert(stopTime - startTime);
            //}
        }
    }

    //init
    //first, initialize the background (non-interactive part of the UI) with a fast 2D renderer on the <canvas> element
    renderer = new Renderer(worldBackground);
    renderer.clear();
	//second, initialize the interactive part of the UI (the svgWorld, using the Raphael SVG engine)
    //svgWorld = new Raphael(worldInteraction.id);
    //svgWorld.clear();
    //now load the default jabe
    this.loadJabe("Jabe_default");
    //set up the world
    var world = new World();
    renderer.drawingSizeX = world.jabeWorldSizeX;
    renderer.drawingSizeY = world.jabeWorldSizeY;    
    //now wait untill the simulation is started

	return this; //return this JQuery object
};
