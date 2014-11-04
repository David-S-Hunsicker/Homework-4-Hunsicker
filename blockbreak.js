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
//      this._super(dt);       // no need for this call anymore
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
   Q.audio.play('fire.mp3');
    } else if(p.x > Q.width - p.w) { 
   p.dx = -1;
   p.x = Q.width - p.w;
   Q.audio.play('fire.mp3');
    }

    if(p.y < 0) {
   p.y = 0;
   p.dy = 1;
    } else if(p.y > Q.height) {
   //see if all lives are lost, keep track of how many are lost here, if no more lose, otherwise drop ball    
   Q.stageScene('lose');
    }
   });
    },
 
 collision: function(col) {                // collision method
  if (col.obj.isA("Paddle")) {
//   alert("collision with paddle");
   Q.audio.play('jump.mp3');
   this.p.dy = -1;
  } else if (col.obj.isA("Block")) {
//   alert("collision with block");
   col.obj.destroy();
   this.p.dy *= -1;
   Q.stage().trigger('removeBlock');
  }
 }
  });

  Q.Sprite.extend("Block", {
    init: function(props) {
      this._super(_(props).extend({ 
  sheet: 'block'   
   }));
      this.on('collision',function(ball) { 
         // Increment the score.
  this.destroy();
  //increase score by 10
  //Q.state.inc("score", 10);
        ball.p.dy *= -1;
        Q.stage().trigger('removeBlock');
      });
    },
 destroyed: function() {
      Q.state.inc("score",100);
 }
  });
  
   Q.UI.Text.extend("Score",{
    init: function() {
      this._super({
        label: "score: 0",
        align: "left",
  color: "white",
        x: 50,
        y: Q.height - 10,
        weight: "normal",
        size:18
      });

      Q.state.on("change.score",this,"score");
    },

    score: function(score) {
      this.p.label = "score: " + score;
    }
  });
  
 

//  Q.load(['blockbreak.png','blockbreak.json'], function() {
  Q.load(['blockbreak.png', 'fire.mp3', 'jump.mp3', 'coin.mp3'], function() {
    // Q.compileSheets('blockbreak.png','blockbreak.json');  
 Q.sheet("ball", "blockbreak.png", { tilew: 20, tileh: 18, sy: 0, sx: 0 });
 Q.sheet("block", "blockbreak.png", { tilew: 40, tileh: 18, sy: 20, sx: 0 });
 //Q.sheet("block1", "blockbreak.png", { tilew: 40, tileh: 18, sy: 20, sx: 40 });
 //Q.sheet("block2", "blockbreak.png", { tilew: 40, tileh: 18, sy: 20, sx: 80 });
 //Q.sheet("block3", "blockbreak.png", { tilew: 40, tileh: 18, sy: 20, sx: 120 });
 //Q.sheet("block4", "blockbreak.png", { tilew: 40, tileh: 18, sy: 20, sx: 160 });
 //Q.sheet("block5", "blockbreak.png", { tilew: 40, tileh: 18, sy: 20, sx: 200 });
 Q.sheet("paddle", "blockbreak.png", { tilew: 60, tileh: 20, sy: 40, sx: 0 });      
 Q.scene('hud',function(stage) {
  stage.insert(new Q.Score());
  //stage.insert(new Q.Lives());
  //stage.insert(new Q.Level());
 }, { stage: 1 });
    Q.scene('win',new Q.Scene(function(stage) {
  var container = stage.insert(new Q.UI.Container({
  fill: "black",
  border: 5,
  y: 60,
  x: Q.width/2 }));
   
   stage.insert(new Q.UI.Text({ 
  label: "You Win!!!!!",
  color: "white",
  x: 5,
  y: 20 }),container);
   
   container.fit(50,50);
   
   stage.insert(new Q.UI.Button({
  label: "Play Again",
  y: 200,
  x: Q.width/2,
  fill: "white",
  border: 5,
  shadow: 10,
  shadowColor: "rgba(0,0,0,0.5)",}, function() {
  Q.clearStages();
  Q.stageScene('start');
      }));
 
 }));
 Q.scene('lose',new Q.Scene(function(stage) {
  var container = stage.insert(new Q.UI.Container({
  fill: "black",
  border: 5,
  y: 60,
  x: Q.width/2 }));
   
   stage.insert(new Q.UI.Text({ 
  label: "You Lose!!!!!",
  color: "white",
  x: 5,
  y: 20 }),container);
   
   container.fit(50,50);
   
   stage.insert(new Q.UI.Button({
  label: "Play Again",
  y: 200,
  x: Q.width/2,
  fill: "white",
  border: 5,
  shadow: 10,
  shadowColor: "rgba(0,0,0,0.5)",}, function() {
  Q.clearStages();
  Q.stageScene('start');
      }));
 
 }));
 Q.scene('start',new Q.Scene(function(stage) {
      var container = stage.insert(new Q.UI.Container({
  fill: "black",
  border: 5,
  y: 60,
  x: Q.width/2 }));
   
   stage.insert(new Q.UI.Text({ 
  label: " BLOCK BREAKER \n David Hunsicker \n Directions: Use the left \n and  right arrow keys \n to move the paddle.",
  color: "blue",
  x: 5,
  y: 20 }),container);
   
   container.fit(50,50);
   
   stage.insert(new Q.UI.Button({
  label: "Play Block Breaker",
  y: 200,
  x: Q.width/2,
  fill: "blue",
  border: 5,
  shadow: 10,
  shadowColor: "rgba(0,0,0,0.5)",}, function() {
   Q.reset({ score: 0, lives: 3 });
   Q.stageScene('game');
      }));
    })); 
 Q.scene('game',new Q.Scene(function(stage) {
      Q.state.reset({ score: 0, lives: 3, level: 1 });
    
    // Add the hud in 
   Q.stageScene("hud"); 
   stage.insert(new Q.Paddle());
      stage.insert(new Q.Ball());
 //  Q.stageScene('hud',3, Q('Block'));

      var blockCount=0;
      for(var x=0;x<6;x++) {
        for(var y=0;y<5;y++) {
          stage.insert(new Q.Block({ x: x*50+35, y: y*30+10 }));
          blockCount++;
        }
      }
      stage.on('removeBlock',function() {
        blockCount--;
  Q.audio.play('coin.mp3');
        if(blockCount == 0) {
          Q.stageScene('win');
        }
      });
 
   }));
 
    Q.stageScene('start');
 
  });  
});