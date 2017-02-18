
var WIDTH=850, HEIGHT=400, pi=Math.PI
var canvas, context, keystate;
var player, ai, ball;


class Vec2
{
  constructor(x=0, y=0)
  {
    this.x = x;
    this.y = y;
  }
}

class Rect
{
  constructor(x=0, y=0, w, h)
  {
    this.pos = new Vec2(x, y);
    this.size = new Vec2(w, h);
  }

  get left()
  {
    return this.pos.x;
  }

  get right()
  {
    return this.pos.x + this.size.x;
  }

  get top()
  {
    return this.pos.y;
  }

  get bottom()
  {
    return this.pos.y + this.size.y;
  }
}

class Player extends Rect
{
  constructor(left)
  {
    if (left)
    {
      super(10, 0, 10, 100);
      this.home = new Vec2(10, (HEIGHT/2)-this.size.y/2);
    }
    else
    {
      super(WIDTH-20, 0, 10, 100);
      this.home = new Vec2(WIDTH-20, (HEIGHT/2)-this.size.y/2);
    }
    
    this.vel = new Vec2;
    this.score = 0;
  }

  /*
   * Sets the player's Rect back to the home position
   */
  reset()
  {
    this.pos = this.home;
  }
}

class Ball extends Rect
{
  constructor()
  {
    super(0, 0, 10, 10);
    this.vel = new Vec2;
    this.home = new Vec2((WIDTH/2) - (this.size.x/2), (HEIGHT/2)-(this.size.y/2));
  }

  reset()
  {
    console.log("In ball.reset()");
    this.pos.x = this.home.x;
    this.pos.y = this.home.y;
    this.vel = new Vec2;
  }
}


class Pong
{
  constructor(canvas)
  {
    this._canvas = canvas;
    this._context = canvas.getContext('2d');
  
    this.ball = new Ball();
    this.ball.pos.x = 100;
    this.ball.pos.y = 100;
    this.ball.vel.x = 200;
    this.ball.vel.y = 200;

    this.player1 = new Player(true);
    this.player2 = new Player(false);
    
    /*
     * Main callback to do animation
     */
    let lastTime;
    const callback = (millis) => {
      if(lastTime)
      {
        this.update((millis - lastTime) / 1000);
      }

      lastTime = millis;
      requestAnimationFrame(callback);
    };

    // Set AI movement
    this.player2.vel.y = 200;

    callback();
  }

  /*
   * Draws a rectangle in the context
   * @param 0 Rect object to draw
   */
  drawRect(rect)
  {
    this._context.fillStyle = '#fff';
    this._context.fillRect(rect.pos.x, rect.pos.y, rect.size.x, rect.size.y);
  }


  /*
   * Start the game by assigning the ball a random vector
   */
  start()
  {
    this.ball.vel.x = 200;
    this.ball.vel.y = 200;
  }

  /*
   * Updates entity positions
   * @param 0 numeric value for the elapsed time since the last call to this function
   */
  update(dt)
  {
    if (this.goalCheck())
    {
      console.log("Resetting");
      this.reset();
      this.start();
      console.log("Width: "+WIDTH+" Height: "+HEIGHT);
      console.log("ball pos:"+this.ball.pos.x+", "+this.ball.pos.y);
      console.log("ball vel:"+this.ball.vel.x+", "+this.ball.vel.y);
    }
    this.ball.pos.x += this.ball.vel.x * dt;
    this.ball.pos.y += this.ball.vel.y * dt;
    this.collisionCheck();
    this.updateAI(dt);
    this.draw();
  }

  /*
   * Checks if a goal has been scored
   */
  goalCheck()
  {
    if(this.ball.right < 0)
    {
      console.log("************ GOAL: Player 2 ****************");
      this.player2.score += 1;
      return true;
    }
    if(this.ball.left > canvas.width)
    {
      console.log("************ GOAL: Player 1 ****************");
      this.player1.score += 1;
      return true;
    }

    return false;
  }

  /*
   * Updates the AI's position and velocity
   */
  updateAI(dt)
  {
    this.player2.pos.y += this.player2.vel.y * dt;
    if(this.player2.pos.y <= 0 || this.player2.pos.y >= HEIGHT-this.player2.size.y)
    {
      this.player2.vel.y = -this.player2.vel.y;
    }
  }


  /*
   * Checks if the ball has collided with a player or with the boundaries
   */
  collisionCheck()
  {
    /*if(this.ball.right > canvas.width || this.ball.left < 0)
    {
      this.ball.vel.x *= -1;
    }*/

    // Seems to still be some jittering errors with this one
    if(this.ball.right > this.player2.left &&
        this.ball.bottom < (this.player2.bottom+25) &&
        this.ball.top > this.player2.top)
    {
      this.ball.vel.x *= -1;
    }
        
    if(this.ball.left < this.player1.right &&
        this.ball.bottom < this.player1.bottom &&
        this.ball.top > this.player1.top)
    {
      this.ball.vel.x *= -1;
    }
        
      
    if(this.ball.top > canvas.height || this.ball.bottom < 0)
    {
      this.ball.vel.y *= -1;
    }
  }


  /*
   * Resets the game 
   * Sets player paddles to home positions
   * Sets ball in center
   */
  reset()
  {
    this.player1.reset();
    this.player2.reset();
    this.ball.reset();
  }

  /*
   * Draws the ball, player paddles, player scores, and separating line
   */
  draw()
  {
    // Create the black background rectangle
    this._context.fillStyle = '#000';
    this._context.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the ball
    this.drawRect(this.ball);

    // Draw the players
    this.drawRect(this.player1);
    this.drawRect(this.player2);
  }

 
  /*
   * Callback for mouse move events
   * Moves the player1 paddle to the mouse y position
   */
  handleMouseMove(event)
  {
    var y = event.offsetY;
  
    console.log("this.player1.y: "+this.player1.pos.y);
    console.log("y "+y);

    if(y < HEIGHT-(this.player1.size.y-100))
    {
      this.player1.pos.y = y-(this.player1.size.y/2);
    }
  }


  /*
   * Starts the Pong game
   */
  go()
  {
    this.callback();
  }
}
  

var canvas, context;
var prev_x, prev_y;

function main()
{
  // Initialize canvas and context
  canvas = document.getElementById('mycanvas');

  const pong = new Pong(canvas);
  canvas.addEventListener('mousemove', pong.handleMouseMove.bind(pong));
}






main();
