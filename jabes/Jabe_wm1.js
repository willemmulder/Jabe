Jabe_wm1 = $.klass(Jabe_v1, {

    name: "Jabe_wm1",
    ancestor: "Jabe_v1",

    //is called when this jabe has its turn in the round
    action: function() {
        // ALWAYS SCREAM AROUND THE STARTING LOCATION
        // Check memory and set startlocation, if this is the first Jabe 
        if (!this.memory.startLocation)
        {
            this.memory.startLocation = {x: this.x, y: this.y}; 
        }
        // KEEP SELF ALIVE
        // Every turn costs 100 energy
        // If we really need energy, eat, eat, eat!
        if (this.energy < 100 && this.checkFood({x:0,y:0}) > 110)
        {
            this.eat(); // Eat all you can
        }
        // ACTION BASED ON LOCATION
        // Become a 'raider' if we are out of our base, and a 'farmer' if we are inside our base
        var dx = this.x - this.memory.startLocation.x;
        var dy = this.y - this.memory.startLocation.y;
        var food = this.checkFood({x:0,y:0});
        if (Math.abs(dx) > 10 || Math.abs(dy) > 10)
        {
            var role = "raider";
            if (this.energy > 2000 && this.checkJabe({x:-1,y:-1}) == null && this.checkJabe({x:1,y:-1}) == null && this.checkJabe({x:1,y:1}) == null && this.checkJabe({x:-1,y:1}) == null ) { //if the jabe has some energy and there is no other jabe next to him, then reproduce
                //reproduce
                this.reproduce({energy:1500}); // Reproduction costs 1000, so we keep 500 and the child gets 500
            }
            // If there is more than 200 food, eat it!
            // Note: we take a value above 100... : The max food that regenerates is 100 / turn! Thus, if a Jabe eats with less than 100 food, it will stay on the square forever...
            if (food > 210) 
            {
                this.eat(); // Eat all the food!
            }
            else
            {
                // Go to field with most food 
                var maxDirections = [];
                var maxDirectionFood = -1;
                var minDirectionFood = 9999;
                for(x=-1;x<=1;x++) {
                    for(y=-1;y<=1;y++) {
                        // Only check directly adjacent blocks (i.e. with dx = 0 xor dy = 0)
                        if (x != y && (x==0 || y==0)) {
                            // Don't go to an occupied block 
                            if (this.isOccupied({x:x,y:y}) == true) 
                            {
                                continue; // Go to next block 
                            }                            
                            if (this.checkFood({x:x,y:y}) < minDirectionFood) 
                            {
                                minDirectionFood = this.checkFood({x:x,y:y});
                            }
                            if (this.checkFood({x:x,y:y}) > maxDirectionFood) 
                            {
                                maxDirectionFood = this.checkFood({x:x,y:y});
                                maxDirections = [{x:x, y:y}];
                            }
                            // If there is just as much food as on maxDirectionFood, then add this to the 'maxDirections' array
                            if (this.checkFood({x:x,y:y}) == maxDirectionFood)
                            {
                                maxDirections.push({x:x, y:y});
                            }
                        }
                    }
                }
                if (maxDirectionFood < 10)
                {
                    this.move(); // Go, if there is no food around
                    return;
                }
                else // More than 10 food
                {
                    if (maxDirectionFood < (this.checkFood({x:0,y:0})+100) ) 
                    {
                        // There is less food around, than on this very spot
                        // Then better eat right here, instead of spending a turn (i.e. 100 energy)
                        this.eat();
                    }
                    else
                    {
                        // Move in any direction with most food
                        var randomDirection = Math.floor(Math.random() * maxDirections.length);
                        this.move(maxDirections[randomDirection]);
                    }
                    // All blocks around have the same amount of food
                    /*
                    if (minDirectionFood == maxDirectionFood) {
                        this.move(); // Continue forward in the same direction
                        return;
                    }*/
                }
            }
        }
        else
        {
            var role = "farmer";
            // Keep some blocks around that have food on them, so that they can seed the adjacent blocks
            
            if (food > 210) {
                this.eat({amount: food-10}); // maximum eating within 1 turn is 250, but never eat all the food...
            } 
            if (this.energy > 11000 && this.checkJabe({x:-1,y:-1}) == null && this.checkJabe({x:1,y:-1}) == null && this.checkJabe({x:1,y:1}) == null && this.checkJabe({x:-1,y:1}) == null ) { //if the jabe has lots of energy and there is not another jabe next to him, then reproduce
                //reproduce
                this.reproduce({energy:6000}); // Reproduction costs 1000, so the child gets 5000 energy and we keep 5000 as well
            } else {
                // check the food around, and go to the place with most food
                var maxDirection = {};
                var maxDirectionFood = -1;
                var minDirectionFood = 9999;
                for(x=-1;x<=1;x++) {
                    for(y=-1;y<=1;y++) {
                        if (x != y && (x==0 || y==0)) {
                            //check if there is an enemy, and if so, attack
                            if (this.isOccupied({x:x,y:y}) == true && this.checkJabe({x:x,y:y}).name != this.name && this.energy > 2000) {
                                this.attack({x:x,y:y});
                                return; //done
                            }   
                            //if the field is occupied or not walkable, or it is a 'farmfield' (and energy is not extremely low), do not attempt to go there
                            if (this.isWalkable({x:x,y:y}) == false || ( ((this.x+x) % 2 == 0) && ((this.y+y) % 2 == 0) && this.energy > 300 ) ) {
                                continue;
                            }
                            if (this.checkFood({x:x,y:y}) < minDirectionFood) {
                                minDirectionFood = this.checkFood({x:x,y:y});
                            }
                            if (this.checkFood({x:x,y:y}) > maxDirectionFood) {
                                maxDirectionFood = this.checkFood({x:x,y:y});
                                maxDirection = {x:x, y:y};
                            }
                        }
                    }
                }
                if (minDirectionFood == maxDirectionFood) {
                    //it does not matter which side we go
                    this.move(); //just go as we were
                }
                if (maxDirectionFood > 0) {
                    this.move(maxDirection);
                } else {
                    //walk straight ahead
                    this.move();
                }
            }
        }
    }
    
});
