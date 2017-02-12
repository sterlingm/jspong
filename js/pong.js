
var WIDTH=700, HEIGHT=600, pi=Math.PI
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
}

class Ball extends Rect
{
  constructor()
  {
    super(0, 0, 10, 10);
    this.vel = new Vec2;
  }
}
  
ball = new Ball();
ball.pos.x = 100;
ball.pos.y = 100;
ball.vel.x = 400;
ball.vel.y = 400;


var canvas, context;

function main()
{
  // Initialize canvas and context
  canvas = document.getElementById('mycanvas');
  context = canvas.getContext('2d');
}


let lastTime;
function callback(millis)
{
  if(lastTime)
  {
    update((millis - lastTime) / 1000);
  }

  lastTime = millis;
  requestAnimationFrame(callback);
}

function update(dt)
{
  ball.pos.x += ball.vel.x * dt;
  ball.pos.y += ball.vel.y * dt;

  if(ball.pos.x >= canvas.width || ball.pos.x <= 0)
  {
    ball.vel.x *= -1;
  }
  if(ball.pos.y >= canvas.height || ball.pos.y <= 0)
  {
    ball.vel.y *= -1;
  }
  
  
  // Create the black background rectangle
  context.fillStyle = '#000';
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Create the ball
  context.fillStyle = '#fff';
  context.fillRect(ball.pos.x, ball.pos.y, ball.size.x, ball.size.y);
}

function draw()
{
}

main();
callback();
