Jabe_2 = $.klass(Jabe_v1, {

    name: "Jabe_2",
    ancestor: "Jabe_v1",

    //is called when this jabe has its turn in the round
    action: function() {
        food = this.checkFood({x:0,y:0});
        if (food > 50) {
            this.eat({amount: 250}); //maximum eating within 1 turn is 250
        } else if (this.energy > 2500) {
            //reproduce
            this.reproduce({energy:1600});
        } else {
            //check the food around, and go to the place with most food
            var maxDirection = {};
            var maxDirectionFood = -1;
            for(x=-1;x<=1;x++) {
                for(y=-1;y<=1;y++) {
                    if (x != y && (x==0 || y==0)) {
                        if (this.checkFood({x:x,y:y}) > maxDirectionFood) {
                            maxDirectionFood = this.checkFood({x:x,y:y});
                            maxDirection = {x:x, y:y};
                        }
                    }
                }
            }
            this.move(maxDirection);
        }        
    }
    
});
