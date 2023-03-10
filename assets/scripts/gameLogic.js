document.documentElement.style.setProperty(
  '--screenWidth',
  `-${document.body.offsetWidth}px`
);



class Helper {
  constructor() {

    // the mess down here is for making it balacend for all screens........


    this.freeSpace = 18;
    this.mult = 5;

    
    if (parseInt(getComputedStyle(document.documentElement).getPropertyValue('--isHeightSmall')) == 1 &&
    parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--isWidthSmall')) == 1) {
      this.freeSpace = 35;
      this.mult = 3
    } if (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--isHeightSmall')) == 0.5 &&
    parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--isWidthSmall')) == 1) {
      this.freeSpace = 25;
      this.mult = 4;
    } if (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--isHeightSmall')) == 0 &&
    parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--isWidthSmall')) == 1) {
      this.freeSpace = 20;
      this.mult = 5;
    } if (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--isHeightSmall')) == 1 &&
    parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--isWidthSmall')) == 0.5) {
      this.freeSpace = 25;
      this.mult = 4;
    } if (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--isHeightSmall')) == 0.5 &&
    parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--isWidthSmall')) == 0.5) {
      this.freeSpace = 21;
      this.mult = 4;
    }

  }

  // end of if hell ------------------------------

  elementLocation(element) {
    return {
      x: element.getClientRects()[0].x,
      y: element.getClientRects()[0].y,
    };
  }

  get sound() {
    return {
      jump: new Howl({
        src: ['assets/audio/Retro Jump Classic 08.wav'],
      }),
      death: new Howl({
        src: ['assets/audio/Boss hit 1.wav'],
      }),
      score: new Howl ({
        src: ['assets/audio/Retro PickUp Coin 07.wav']
      })
    };
  }
}

class UpperObstacle {
  constructor(lowerObstacleHeight, freeSpace) {
    this.height = 100 - (lowerObstacleHeight + freeSpace);
    if (this.height < 0) {
      this.height = 0;
    }
  }
}

class LowerObstacle {
  constructor() {
    this.height = (Math.random() * (.7-.1) + .1)*100;
  }
}

class FullObstacle extends Helper {
  constructor() {
    super();
    this.lowerObstacle = new LowerObstacle();
    this.upperObstacle = new UpperObstacle(this.lowerObstacle.height, this.freeSpace);
    this.render();
  }

  render() {
    this.obstacleElement = document.createElement('div');
    this.lowerObstaclePart = document.createElement('div');
    this.upperObstaclePart = document.createElement('div');
    this.obstacleElement.className = 'full-obstacle';
    this.lowerObstaclePart.className = 'obstacle lower';
    this.lowerObstaclePart.style = `height: ${this.lowerObstacle.height}vh;`;
    this.lowerObstaclePart.innerHTML = `<img src="assets/img/IndustrialTile_04.png" alt="" class="obstacle-img">`;
    this.upperObstaclePart.className = 'obstacle upper';
    this.upperObstaclePart.style = `height: ${this.upperObstacle.height}vh;`;
    this.upperObstaclePart.innerHTML = `<img src="assets/img/IndustrialTile_13.png" alt="" class="obstacle-img">`;
    this.obstacleElement.append(this.lowerObstaclePart, this.upperObstaclePart);
    document.body.append(this.obstacleElement);
    setTimeout(() => {
      this.obstacleElement.remove();
    }, 2900);
  }
}

class Pigeon extends Helper {
  constructor() {
    super();

    this.pigeonElement = document.getElementById('pigeon');
    this.pigeonElement.classList.toggle('visable');
    this.didGameEnd = false;
    this.linkJump();
  }

  linkJump() {
    const clickArea = document.body;
    clickArea.addEventListener('click', () => {
      this.jump();
    });
  }

  jump() {
    if (
      !this.didGameEnd &&
      this.pigeonElement.offsetTop + this.pigeonElement.offsetHeight > 0
    ) {
      this.pigeonElement.style = `transition: 0.3s cubic-bezier(0,.03,.48,1.66) top;
      top: ${
        this.pigeonElement.offsetTop -
       this.mult * 14 }px;`;
      this.sound.jump.play();
    }
  }

  fall() {
    if (
      !this.didGameEnd &&
      !this.pigeonElement.getAnimations()[0] &&
      document.querySelector('.min-height').getClientRects()[0].y >=
      this.pigeonElement.getClientRects()[0].y +
      this.pigeonElement.offsetHeight &&
      this.pigeonElement.getAnimations
    ) {
      this.pigeonElement.style = `transition: none;
       top: ${this.pigeonElement.offsetTop + this.mult}px;`;
    }
  }
}

class Score extends Helper {
  constructor() {
    super();

    this.score = document.querySelector(".score");
    this.score.style.opacity = 1;
    this.score.textContent = "score: 0"
    this.scoreNum = 0;
  }

  scoreAdd() {
    this.sound.score.play();
    this.score.textContent = `score: ${++this.scoreNum}`
  }
}

class Playground {
  constructor() {
    this.pigeon = new Pigeon();
    this.gravity = setInterval(this.pigeon.fall.bind(this.pigeon),10);
    this.obstacle = new FullObstacle();
    this.score = new Score();

    this.obstacleGenerator = setInterval(() => {
      this.obstacle = new FullObstacle();
      this.score.scoreAdd();
    }, 2900);

    this.gameStateChecker = setInterval(() => {
      this.gameStateCheck();
    });
  }

  leftSideCheck(pigeonX,obstacleX) {
    if(pigeonX <=
      obstacleX + this.obstacle.upperObstaclePart.offsetWidth) {
      return true;
    } else {
      return false
    }
  }

  rightSideCheck(pigeonX,obstacleX) {
    if(pigeonX + this.pigeon.pigeonElement.offsetWidth >=
      obstacleX) {
      return true;
    } else {
      return false
    }
  }

  topSideCheck(pigeonY,obstacleY,obstacleElement) {
    if(pigeonY +
      (this.pigeon.pigeonElement.offsetHeight - 
      parseInt(getComputedStyle(document.documentElement).getPropertyValue('--pixelSize') * 16)) <=
      obstacleY +
      obstacleElement.offsetHeight) {
      return true;
    } else {
      return false
    }
  }

  bottomSideCheck(pigeonY,obstacleY) {
    if(pigeonY + this.pigeon.pigeonElement.offsetHeight >=
      obstacleY) {
      return true;
    } else {
      return false
    }
  }


  gameStateCheck() {
    const pigeonLocation = this.pigeon.elementLocation(
      this.pigeon.pigeonElement
    );
    const upperObstacleLocation = this.obstacle.elementLocation(
      this.obstacle.upperObstaclePart
    );
    const lowerObstacleLocation = this.obstacle.elementLocation(
      this.obstacle.lowerObstaclePart
    );

    if (
      (this.leftSideCheck(pigeonLocation.x,upperObstacleLocation.x) &&
        this.rightSideCheck(pigeonLocation.x,upperObstacleLocation.x) &&
        this.topSideCheck(pigeonLocation.y,upperObstacleLocation.y, this.obstacle.upperObstaclePart) &&
        this.bottomSideCheck(pigeonLocation.y,upperObstacleLocation.y)) ||
        (this.leftSideCheck(pigeonLocation.x,lowerObstacleLocation.x) &&
        this.rightSideCheck(pigeonLocation.x,lowerObstacleLocation.x) &&
        this.topSideCheck(pigeonLocation.y,lowerObstacleLocation.y, this.obstacle.lowerObstaclePart) &&
        this.bottomSideCheck(pigeonLocation.y,lowerObstacleLocation.y))
    ) {
      this.gameEnd();
    }
  }

  gameEnd() {
    this.pigeon.sound.death.play();
    this.pigeon.didGameEnd = true;
    this.pigeon.pigeonElement.classList.toggle('visable');
    this.pigeon.pigeonElement.style = 'top: 30vh;';
    this.obstacle.didGameEnd = true;
    this.obstacle.obstacleElement.style.opacity = 0;
    clearInterval(this.obstacleGenerator);
    clearInterval(this.gameStateChecker);
    clearInterval(this.gravity)
    const menu = document.querySelector('.menu');
    const menuBtn = document.querySelector(".menu-button");
    menuBtn.disabled = false;
    menu.classList.toggle('invisable');
    menu.querySelector('.menu-button-text').textContent = 'again ?';
    const ldmBtn = document.querySelector(".LDM");
    ldmBtn.disabled = false;

  }
}

class lowDetailMode {
  constructor() {
    this.ldmBtn = document.querySelector(".LDM");
    this.background = document.querySelectorAll(".background-holder > div");
    this.ldmBtn.addEventListener('click', () => {
      this.background.forEach(div => {
        div.style = "animation: none;"
      })
    })
  }
}

class App {
  constructor() {
    const ldm = new lowDetailMode();
    const startButton = document.querySelector('.menu-button');
    const menu = document.querySelector('.menu')
    startButton.addEventListener('click', () => {
      menu.classList.toggle('invisable');
      ldm.ldmBtn.disabled = true;
      startButton.disabled = true;
      this.gameStart();
    });
  }
  gameStart() {
    this.playArea = new Playground();
  }
}

const app = new App();
