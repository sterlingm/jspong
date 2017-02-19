
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
    this.pos.x = this.home.x;
    this.pos.y = this.home.y;
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

    // Set some variables for the game
    this.ball_theta_limit = 1.0472; // 60 degrees
    this.ball_speed_min   = 200;
    this.ball_speed_max   = 450;

    // Create the players
    this.player1 = new Player(true);
    this.player2 = new Player(false);


    // Create the numbers...
    // Create a new canvas (for each number) to draw them on
    this.CHAR_PIXEL = 10;
    this.numbers = [
      '111101101101111',
      '010010010010010',
      '111001111100111',
      '111001111001111',
      '101101111001001',
      '111100111001111',
      '111100111101111',
      '111101001001001',
      '111101111101111',
      '111101111001001'
      ].map(str => {
        // Create canvas and get context
        const can = document.createElement('canvas');
        can.height = this.CHAR_PIXEL * 5;
        can.width = this.CHAR_PIXEL * 3;
        const context = can.getContext('2d');
        context.fillStyle = '#fff';

        // Iterate through numbers
        str.split('').forEach((fill, i) => {
          if(fill === '1') {
            context.fillRect((i % 3) * this.CHAR_PIXEL, 
              (i / 3 | 0) * this.CHAR_PIXEL,
              this.CHAR_PIXEL, this.CHAR_PIXEL);
          }
        });

        return can;
      });
    
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

    // Reset ball position
    this.reset();

    // Set AI movement
    this.player2.vel.y = 200;

    // Start the callbacks
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


  drawScore()
  {
    const align = this._canvas.width / 3;
    const CHAR_WIDTH = this.CHAR_PIXEL * 4;

    var players = [this.player1, this.player2];

    players.forEach((player, i) => {
      const chars = player.score.toString().split('');
      const offset = align * (i+1) - (CHAR_WIDTH * chars.length / 2) * this.CHAR_PIXEL / 2;

      this._context.drawImage( this.numbers[player.score], offset + (i+1) * CHAR_WIDTH, 20);
    });

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

    // Draw the score
    this.drawScore();
  }

 

  /*
   * Start the game by assigning the ball a random vector
   */
  start()
  {
    if(this.ball.vel.x == 0)
      {
      // Get angle for ball vector direction
      var theta = (Math.random() * 2 * this.ball_theta_limit) - this.ball_theta_limit;

      // Unit vector based on theta
      var unit = new Vec2(Math.cos(theta), Math.sin(theta));

      // Get random ball speed
      var speed = Math.floor((Math.random() * this.ball_speed_min) + this.ball_speed_max);

      // Set ball velocity vector
      this.ball.vel.x = speed * unit.x;
      this.ball.vel.y = speed * unit.y;

      // See which player goes first
      // If speed was even, make left player go first
      // Default ball vector will be in positive x direction so only one check is needed
      if(speed % 2 == 0)
      {
        this.ball.vel.x = -this.ball.vel.x;
      }
    }
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

    // Seems to still be some jittering errors with this one
    // Check for collision against player 2
    if(this.ball.right > this.player2.left &&
        this.ball.bottom < (this.player2.bottom+25) &&
        this.ball.top > this.player2.top)
    {
      this.ball.vel.x *= -1;
    }
        
    // Check for collision against player 1
    if(this.ball.left < this.player1.right &&
        this.ball.bottom < this.player1.bottom &&
        this.ball.top > this.player1.top)
    {
      this.ball.vel.x *= -1;
    }
        
    // Check for collision against boundaries      
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
   * Callback for mouse up events
   * Starts a game if ball is not currently in motion
   */
  handleMouseUp(event)
  {
    this.start();
  }


  /*
   * Starts the Pong game
   */
  go()
  {
    this.callback();
  }
}
  


function main()
{
  // Initialize canvas and context
  canvas = document.getElementById('mycanvas');

  const pong = new Pong(canvas);
  canvas.addEventListener('mousemove', pong.handleMouseMove.bind(pong));
  canvas.addEventListener('mouseup', pong.handleMouseUp.bind(pong));
}






main();
