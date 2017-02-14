
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
      super(0, 0, 10, 50);
    }
    else
    {
      super(WIDTH-10, 0, 10, 50);
    }
    this.vel = new Vec2;
  }
}

class Ball extends Rect
{
  constructor()
  {
    super(0, 0, 10, 10);
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
    this.ball.vel.x = 400;
    this.ball.vel.y = 400;

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

    callback();
  }



  /*
   * Updates entity positions
   * @param 0 numeric value for the elapsed time since the last call to this function
   */
  update(dt)
  {
    this.ball.pos.x += this.ball.vel.x * dt;
    this.ball.pos.y += this.ball.vel.y * dt;

    if(this.ball.right > canvas.width || this.ball.left < 0)
    {
      this.ball.vel.x *= -1;
    }

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
    
    
    // Create the black background rectangle
    this._context.fillStyle = '#000';
    this._context.fillRect(0, 0, canvas.width, canvas.height);

    // Create the this.ball
    this._context.fillStyle = '#fff';
    this._context.fillRect(this.ball.pos.x, this.ball.pos.y, this.ball.size.x, this.ball.size.y);

    // Create the this.players
    this._context.fillRect(this.player1.pos.x, this.player1.pos.y, this.player1.size.x, this.player1.size.y);
    this._context.fillRect(this.player2.pos.x, this.player2.pos.y, this.player2.size.x, this.player2.size.y);
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

function main()
{
  // Initialize canvas and context
  canvas = document.getElementById('mycanvas');

  const pong = new Pong(canvas);
}




function draw()
{
}

main();
