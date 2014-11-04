$(function() {
  var Q = window.Q = Quintus({audioSupported: [ 'wav','mp3','ogg' ]})
                     .include('Input,Sprites,Scenes,UI,Touch,Audio')
                     .setup().touch().enableSound();

  Q.input.keyboardControls();
  Q.input.touchControls({ 
            controls:  [ ['left','<' ],[],[],[],['right','>' ] ]
  });

  Q.Sprite.extend("Paddle", {     // extend Sprite class to create Q.Paddle subclass
    init: function(p) {
      this._super(p, {
        sheet: 'paddle',
        speed: 200,
        x: 0,
      });
      this.p.x = Q.width/2 - this.p.w/2;
      this.p.y = Q.height - this.p.h;
      if(Q.input.keypad.size) {
        this.p.y -= Q.input.keypad.size + this.p.h;
      }
    },

    step: function(dt) {
      if(Q.inputs['left']) { 
        this.p.x -= dt * this.p.speed;
      } else if(Q.inputs['right']) {
        this.p.x += dt * this.p.speed;
      }
      if(this.p.x < 0) { 
        this.p.x = 0;
      } else if(this.p.x > Q.width - this.p.w) { 
        this.p.x = Q.width - this.p.w;
      }
//      this._super(dt);	      // no need for this call anymore
    }
  });

  Q.Sprite.extend("Ball", {
    init: function() {
      this._super({
        sheet: 'ball',
        speed: 200,
        dx: 1,
        dy: -1,
      });
      this.p.y = Q.height / 2 - this.p.h;
      this.p.x = Q.width / 2 + this.p.w / 2;
	  
	  this.on('hit', this, 'collision');  // Listen for hit event and call the collision method
	  
	  this.on('step', function(dt) {      // On every step, call this anonymous function
		  var p = this.p;
		  Q.stage().collide(this);   // tell stage to run collisions on this sprite

		  p.x += p.dx * p.speed * dt;
		  p.y += p.dy * p.speed * dt;

		  if(p.x < 0) { 
			p.x = 0;
			p.dx = 1;
			Q.audio.play('hit.mp3');
		  } else if(p.x > Q.width - p.w) { 
			p.dx = -1;
			p.x = Q.width - p.w;
			Q.audio.play('hit.mp3');
		  }

		  if(p.y < 0) {
			p.y = 0;
			p.dy = 1;
		  } else if(p.y > Q.height) 
		  { 
			//logic to test how many lives are left, then select lose scene or drop a ball
			Q.stageScene('lose');
		  }
	  });
    },
	
	collision: function(col) {                // collision method
		if (col.obj.isA("Paddle")) {
//			alert("collision with paddle");
			Q.audio.play('fire.mp3');
			this.p.dy = -1;
		} else if (col.obj.isA("Block")) {
//			alert("collision with block");
			col.obj.destroy();
			this.p.dy *= -1;
			Q.stage().trigger('removeBlock');
		}
	}
  });

  Q.Sprite.extend("Block", {
    init: function(props) {
      this._super(_(props).extend({ sheet: 'block'}));
      this.on('collision',function(ball) { 
        this.destroy();
		//increase score by 10
		Q.state.inc("score", 10);
		console.log(Q.score);
        ball.p.dy *= -1;
        Q.stage().trigger('removeBlock');
      });
    }
  });
//Q.Sprite.extend golden block

 Q.load(['blockbreak.png','fire.mp3','hit.mp3','heart.mp3' ], function() { 
 Q.sheet("ball", "blockbreak.png", { tilew: 20, tileh: 18, sy: 0, sx: 0 });
 Q.sheet("block", "blockbreak.png", { tilew: 40, tileh: 18, sy: 20, sx: 0 });
 Q.sheet("paddle", "blockbreak.png", { tilew: 60, tileh: 20, sy: 40, sx: 0 });      
 Q.scene('win',new Q.Scene(function(stage) {
  var container = stage.insert(new Q.UI.Container({
  fill: "black",
  border: 5,
  y: 60,
  x: Q.width/2 }));
   
   stage.insert(new Q.UI.Text({ 
  label: "Think you're \n pretty special,\n don't you?",
  color: "blue",
  x: 5,
  y: 20 }),container);
   
   container.fit(50,50);
   
   stage.insert(new Q.UI.Button({
  label: "Play Again",
  y: 200,
  x: Q.width/2,
  fill: "blue",
  border: 5,
  shadow: 10,
  shadowColor: "rgba(0,0,0,0.5)",}, function() {
  Q.clearStages();
  Q.stageScene('game');
      }));
 
 }));
 Q.scene('lose',new Q.Scene(function(stage) {
  var container = stage.insert(new Q.UI.Container({
  fill: "black",
  border: 5,
  y: 60,
  x: Q.width/2 }));
   
   stage.insert(new Q.UI.Text({ 
  label: "you coulda had a V8",
  color: "blue",
  x: 5,
  y: 20 }),container);
   
   container.fit(50,50);
   
   stage.insert(new Q.UI.Button({
  label: "Play Again",
  y: 200,
  x: Q.width/2,
  fill: "blue",
  border: 5,
  shadow: 10,
  shadowColor: "rgba(0,0,0,0.5)",}, function() {
  Q.clearStages();
  Q.stageScene('game');
      }));
 
 }));
 Q.scene('start',new Q.Scene(function(stage) {
      var container = stage.insert(new Q.UI.Container({
  fill: "black",
  border: 5,
  y: 60,
  x: Q.width/2 }));
   
   stage.insert(new Q.UI.Text({ 
  label: " BLOCK BREAKER \n  David Hunsicker \n Directions: Use the left \n and  right arrow keys \n to move the paddle.",
  color: "white",
  x: 5,
  y: 20 }),container);
   
   container.fit(50,50);
   
   stage.insert(new Q.UI.Button({
  label: "Play Block Breaker",
  y: 200,
  x: Q.width/2,
  fill: "white",
  border: 5,
  shadow: 10,
  shadowColor: "rgba(0,0,0,0.5)",}, function() {
  Q.reset({ score: 0, lives: 3});
  Q.stageScene('game');
  //Q.stageScene('hud');
      }));
    })); 
 Q.scene('game',new Q.Scene(function(stage) {
	
 
 
      stage.insert(new Q.Paddle());
      stage.insert(new Q.Ball());
		///////////////////////experimental code here
		
		var scoreboard = stage.insert(new Q.UI.Container
			({
				fill: "gray", border: 3, x: 20, y:0
			}));
		//on score.incease
		stage.insert(new Q.UI.Text
			({
				label:"Score:", color:"white", x:20, y:10
			}), scoreboard);
			
		/* var points = stage.insert(new Q.UI.Text
		({
			label: "0", color: "white", x: 80, y:10
		}),scoreboard); */
		
		//update teh score
		Q.state.on("change.score", function()
		{
		var points = stage.insert(new Q.UI.Text
			({
			//console.log(points are being updated);
			label: Q.state("score"), color: "white", x: 80, y:10
			
			}),scoreboard);
		});
		
		//scoreboard.fit(Q.width, 20);
		///////////////////
      var blockCount=0;
      for(var x=0;x<6;x++) {
        for(var y=0;y<5;y++) {
          stage.insert(new Q.Block({ x: x*50+35, y: y*30+45 }));
          blockCount++;
        }
      }
      stage.on('removeBlock',function() {
        blockCount--;
  Q.audio.play('heart.mp3');
        if(blockCount == 0) {
          Q.stageScene('win');
        }
      });
		
    }));
   
   
   
   
Q.scene("hud",function(stage) {
    stage.insert(new Q.Score());
    stage.insert(new Q.Lives());
    stage.insert(new Q.game());
  });






   Q.stageScene('start');//start the game
  });
});