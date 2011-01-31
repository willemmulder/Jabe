Jabe_hp1 = $.klass(Jabe_v1, {

    name: "Jabe_hp1",
    ancestor: "Jabe_v1",

    //is called when this jabe has its turn in the round
    action: function() {
    
        var maxDirection = {};
        var maxDirectionFood = -1;
        var minDirectionFood = 9999;
        var fly = false;
        for(x=-1;x<=1;x++) {
            for(y=-1;y<=1;y++) {
                if (x != y && (x==0 || y==0)) {
                    if (this.isOccupied({x:x,y:y}) == true && this.checkJabe({x:x,y:y}).name != this.name) {
                        if (this.energy > 4000) {
                            // enough energy: attack
                            this.attack({x:x,y:y});
                            return; 
                        } else if (this.energy <2000) {
                            // little energy: fly
                            fly = true;
                            minDirectionFood = -1;
                        }
                    }
                    if (!this.isWalkable({x:x,y:y})) {
                        // Out of bounds
                        continue;
                    }
                    // Check not only for this field but also for the fields surrounding it
                    var foodInThisDirection = 4*this.checkFood({x:x,y:y}) + this.checkFood({x:x+1,y:y}) + this.checkFood({x:x-1,y:y}) + this.checkFood({x:x,y:y+1}) + this.checkFood({x:x+1,y:y-1}); 
                    //alert( ' ' + x + ' ' +  y + ' ' + foodInThisDirection );
                    if (foodInThisDirection < minDirectionFood) {
                        minDirectionFood = foodInThisDirection;
                    }
                    if (foodInThisDirection > maxDirectionFood) {
                        maxDirectionFood = foodInThisDirection;
                        maxDirection = {x:x, y:y};
                    }
                }
            }
        }
        

        //if the jabe has lots of energy and there is not another jabe next to him, then reproduce
        if (this.energy > 5000 && this.checkJabe({x:-1,y:-1}) == null && this.checkJabe({x:1,y:-1}) == null && 
                                  this.checkJabe({x:1,y:1}) == null && this.checkJabe({x:-1,y:1}) == null ) { 
            //reproduce
            this.reproduce({energy:(this.energy-1000)/2});
            return
        }

        // If there's enough food and ant is not flying (or ant is strong enough not to fly after eating: eat 
        var food = this.checkFood({x:0,y:0});
        var eat = food-10;
        if (eat>250) { 
            eat=250; // All you can eat
        }
        if (food > 110) {
            if (!fly || fly && this.energy+eat>2000) {
                this.eat({amount:eat}); //maximum eating within 1 turn is 250
                return;
            }
        }

        // Move
        if (minDirectionFood == maxDirectionFood) {
            //it does not matter which side we go
            this.move(); //just go as we were
        } else if (maxDirectionFood > 0) {
            this.move(maxDirection);
        } else {
            //walk straight ahead
            this.move();
        }      
    }
    
});
