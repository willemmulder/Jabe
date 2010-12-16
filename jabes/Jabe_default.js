Jabe_default = $.klass(Jabe_v1, {

    name: "Jabe_default",
    ancestor: "Jabe_v1",

    //is called when this jabe has its turn in the round
    action: function() {
        food = this.checkFood({x:0,y:0});
        if (food > 100) {
            this.eat({amount: 250}); //maximum eating within 1 turn is 250
        } else if (this.energy > 1500) {
            //reproduce
            this.reproduce({energy:1300});
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
            //document.title = maxDirection.x + "y: " + maxDirection.y;
            this.move(maxDirection);
            //var direction = Array("left", "right");
            //this.turn({direction:direction[random(1)]});
            //this.move(); //moving without arguments is always forward
        }        
    }
    
});
