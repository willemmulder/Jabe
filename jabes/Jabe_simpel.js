Jabe_simpel = $.klass(Jabe_v1, {

    name: "Jabe_simpel",
    ancestor: "Jabe_v1",

    //is called when this jabe has its turn in the round
    action: function() {
        if (this.checkFood({x:0,y:0}) > 500) {
            this.eat({amount: 250});
        } else {
            if (this.isWalkable({direction: "forward"}) == true) {
                this.move();
            } else {
                this.turn({direction:"left"});
                this.move();
            }
        }
    }
    
});
