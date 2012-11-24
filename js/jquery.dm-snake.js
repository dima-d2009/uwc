(function($) {
  
  /**
   * Scores
   */
  
  function DmScores(div_container) {
    this.divContainer = div_container;
    this.spanScoresC = this.divContainer.find('.dm-snake-scores-current > span');
    this.spanScoresT = this.divContainer.find('.dm-snake-scores-total > span');
    this.score = 0;
  }
  
  /**
   * Increment scores
   */
  DmScores.prototype.add = function(score) {
    this.score += score;
    this.spanScoresC.text(this.score);
    this.spanScoresC.fadeOut(200, function() {
      $(this).fadeIn(400);
    });
    if (this.score > parseInt(this.spanScoresT.text(), 10)) {
      this.spanScoresT.text(this.score);
    }
  };
  
  /**
   * Reset
   */
  DmScores.prototype.reset = function(score) {
    this.score = 0;
    this.spanScoresC.text(this.score);
  };
  
  /**
   * Load
   */
  DmScores.prototype.load = function(score) {
    if (typeof localStorage != 'undefined') {
      var total_score = localStorage.getItem('dmSnakeTotalScore');
      if (total_score) {
        this.spanScoresT.text(total_score);
      }
    }
  };
  
  /**
   * Save
   */
  DmScores.prototype.save = function(score) {
    if (typeof localStorage != 'undefined') {
      localStorage.setItem('dmSnakeTotalScore', parseInt(this.spanScoresT.text(), 10));
    }
  };
  
  
  /**
   * Food
   */
  function DmFood(div_container) {
    this.divContainer = div_container;
    this.divField = this.divContainer.find('.dm-snake-field');
    this.divFood = null;
  }
  
  /**
   * Add food
   */
  DmFood.prototype.add = function() {
    var l = 0, t = 0;
    
    if (this.divFood !== null) {
      return;
    }
    
    this.divFood = $('<div class="dm-snake-food"></div>').css('display', 'none');
    this.divContainer.find('.dm-snake-field').append(this.divFood);
    
    l = Math.ceil(Math.random() * this.divField.width() - this.divFood.width()),
    t = Math.ceil(Math.random() * this.divField.height() - this.divFood.height());
    
    if (l < 0) { l = 0; }
    if (t < 0) { t = 0; }
    
    this.divFood.css({
      left: l + 'px',
      top: t + 'px'
    }).fadeIn(300);
  };
  
  /**
   * Hide food
   */
  DmFood.prototype.hide = function() {
    if (this.divFood !== null) {
      this.divFood.detach().remove();
      this.divFood = null;
    }
  };
  
  /**
   * Detect collision with food
   */
  DmFood.prototype.detectCollision = function(dir, obj_w, obj_h, l, t) {
    if (!this.divFood) {
      return;
    }
    
    var food_l = this.divFood.position().left,
        food_t = this.divFood.position().top
        food_w = this.divFood.width(),
        food_h = this.divFood.height();
    
    if (l > (food_l - food_w) && l < (food_l + food_w)
      && t > (food_t - food_h) && t < (food_t + food_h)) {
      return true;
    }
    
    return false;
  };
  
  
  /**
   * Field
   */
  function DmField(div_container) {
    this.divContainer = div_container;
    this.divField = this.divContainer.find('.dm-snake-field');
    this.w = this.divField.width();
    this.h = this.divField.height();
  }
  
  /**
   * Add element to the field
   */
  DmField.prototype.add = function(object) {
    this.divField.append(object);
  };
  
  /**
   * Detect collision
   */
  DmField.prototype.detectCollision = function(dir, obj_w, obj_h, l, t) {
    if (dir == 'right') { l += obj_w; }
    if (dir == 'down') { t += obj_h; }
   
    if (l > this.w || l < 0 || t > this.h || t < 0) {
      return true;
    }
    
    return false;
  };
  
  
  /**
   * Snake
   */
  function DmSnake(div_container_selector) {
    var that = this;
    this.divContainer = $(div_container_selector);
    if (!this.divContainer.length) { return; }
    this.objects = [];
    this.scores = new DmScores(this.divContainer);
    this.food = new DmFood(this.divContainer);
    this.field = new DmField(this.divContainer);
    this.turn = false;
    this.dir = 'right';
    this.movementPoints = 3;
    this.movementTime = 70;
    this.scores.load();
    this.setupControls();
  }
  
  /**
   * Init
   */
  DmSnake.prototype.init = function() {
    var that = this;
    
    this.movementPoints = 4;
    this.movementTime = 70;
    this.dir = 'right';
    $('#dm-snake-trigger').text('Start!');
    
    this.grow();
    this.grow();
    this.grow();
    
    this.movement = setInterval(function() {
      that.move();
    }, this.movementTime);
    
    this.foodInterval = setInterval(function() {
      that.food.add();
    }, 2000);
    
    this.divContainer.removeClass('dm-snake-gameover');
    this.divContainer.find('.dm-snake-gameover-screen').fadeOut(300);
  }
  
  /**
   * Grow the snake
   */
  DmSnake.prototype.grow = function() {
    var div_object = $('<div class="dm-snake-object"></div>'),
        last_snake_obj = this.objects[this.objects.length - 1],
        l = 50,
        t = 50;
    
    if (typeof last_snake_obj != 'undefined') {
      l = last_snake_obj.position().left;
      t = last_snake_obj.position().top;
      
      switch (this.dir) {
        case 'up':
          t += last_snake_obj.height();
          break;
          
        case 'down':
          t -= last_snake_obj.height();
          break;
          
        case 'left':
          l += last_snake_obj.width();
          break;
          
        case 'right':
          l -= last_snake_obj.width();
          break;
      }
    }
    
    div_object.css({
      left: l + 'px',
      top: t + 'px'
    });
    
    div_object.appendTo(this.field.divField);
    this.objects.push(div_object);
  };
  
  /**
   * Setup controls
   */
  DmSnake.prototype.setupControls = function() {
    var that = this;
    
    $('body').on('keydown', function(e) {
      switch(e.which){
        case 37:
          if (that.dir != 'right') {
            that.dir = 'left';
          }
          break;
          
        case 38:
          if (that.dir != 'down') {
            that.dir = 'up';
          }
          break;
          
        case 39:
          if (that.dir != 'left') {
            that.dir = 'right';
          }
          break;
          
        case 40:
          if (that.dir != 'up') {
            that.dir = 'down';
          }
          break;
      }
      
      e.preventDefault();
    });
  }
  
  /**
   * Detect snake collision with itself
   */
  DmSnake.prototype.detectCollision = function(from_obj) {
    var i,
        obj,
        obj_l,
        obj_t,
        obj_w,
        obj_h,
        l = from_obj.position().left,
        t = from_obj.position().top;
    
    if (this.dir == 'right') { l += from_obj.width(); }
    if (this.dir == 'down') { t += from_obj.height(); }
    
    for (i = 1; i < this.objects.length; ++i) {
      obj = this.objects[i];
      obj_l = obj.position().left,
      obj_t = obj.position().top
      obj_w = obj.width(),
      obj_h = obj.height();
      
      if (l > (obj_l - obj_w) && l < (obj_l + obj_w)
        && t > (obj_t - obj_h) && t < (obj_t + obj_h)) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Move
   */
  DmSnake.prototype.move = function() {
    var i,
        obj,
        l_new,
        t_new,
        obj_w,
        obj_h,
        offset,
        duration = 50;
    
    for (i = 0; i < this.objects.length; ++i) {
      obj = this.objects[i];
      
      if (i === 0) {
        obj_w = obj.width();
        obj_h = obj.height();
        l_new = obj.position().left;
        t_new = obj.position().top;
        
        switch(this.dir) {
          case 'down':
            t_new += this.movementPoints;
            break;
            
          case 'right':
            l_new += this.movementPoints;
            break;
            
          case 'left':
            l_new -= this.movementPoints;
            break;
            
          case 'up':
            t_new -= this.movementPoints;
            break;
        }
        
        // Detect collision for snake itself
        if (this.detectCollision(obj)) {
          this.gameOver();
        }
        
        // Detect collision with walls
        if (this.field.detectCollision(this.dir, obj_w, obj_h, l_new, t_new)) {
          this.gameOver();
        }
        
        // Detect collision with food
        if (this.food.detectCollision(this.dir, obj_w, obj_h, l_new, t_new)) {
          this.grow();
          this.food.hide();
          this.scores.add(1);
          if (this.movementPoints < 12) {
            this.movementPoints += 1;
          }
        }
      } else {
        l_new = this.objects[i - 1].position().left;
        t_new = this.objects[i - 1].position().top;
        offset = this.movementPoints - 1;
        
        switch(this.dir) {
          case 'down':
            t_new -= obj_h - offset;
            break;
            
          case 'right':
            l_new -= obj_w - offset;
            break;
            
          case 'left':
            l_new += obj_w - offset;
            break;
            
          case 'up':
            t_new += obj_h - offset;
            break;
        }
      }
      
      obj.animate({
        left: l_new + 'px',
        top: t_new + 'px'
      }, {
        duration: duration
      });
    }
  };
  
  /**
   * Game over
   */
  DmSnake.prototype.gameOver = function() {
    var i;
    clearInterval(this.movement);
    clearInterval(this.foodInterval);
    for (i = 0; i < this.objects.length; ++i) {
      this.objects[i].detach().remove();
    }
    this.objects = [];
    this.divContainer.addClass('dm-snake-gameover');
    this.scores.reset();
    this.food.hide();
    this.scores.save();
    this.divContainer.find('.dm-snake-gameover-screen').fadeIn(300);
    this.divContainer.animate({
      left: '-10px'
    }, {
      duration: 200,
      complete: function() {
        $(this).animate({ left: '15px' }, { duration: 200, complete: function() {
          $(this).animate({ left: 0 }, { duration: 100 });
        }});
      }
    });
    $('#dm-snake-trigger').text('Try again!');
  };
  
  
  /**
   * Initialize
   */
  $(document).ready(function() {
    var dm_snake = new DmSnake('.dm-snake');;
    
    $('#dm-snake-trigger').on('click', function(e) {
      dm_snake.init();
      e.preventDefault();
    });
  });
  
}(jQuery));