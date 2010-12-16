Jabe_3 = $.klass(Jabe_v1, {

    name: "Jabe_3",
    ancestor: "Jabe_v1",

    //is called when this jabe has its turn in the round
    action: function() {
        food = this.checkFood({x:0,y:0});
        //if there is more than 10 food, eat
        if (food > 110) {
            this.eat({amount: (food-10)}); //maximum eating within 1 turn is 250
        } else if (this.energy > 5000 && this.checkJabe({x:-1,y:-1}) == null && this.checkJabe({x:1,y:-1}) == null && this.checkJabe({x:1,y:1}) == null && this.checkJabe({x:-1,y:1}) == null ) { //if the jabe has lots of energy and there is not another jabe next to him, then reproduce
            //reproduce
            this.reproduce({energy:3000});
        } else {
            //check the food around, and go to the place with most food
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
    
});
