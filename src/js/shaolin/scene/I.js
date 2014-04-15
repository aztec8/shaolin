/* scene I */

'use strict';
var game = game || {};

game.scene.I = {

	// either map or fight
	mode: 'map',
	chamber: 1,

	enemies: [],
	current_enemy: undefined,

	// bkgd images
	map_bkgd: undefined,
	fight_bkgd: undefined,
	current_bkgd: undefined,

	hero: undefined,

	// locations
	/*
	- hero start point
	- exit point
	- enemy point
	*/
	hero_point: {
		x: 0,
		y: 0
	},
	// (x, y) for various things
	exit_point: {
		x: 0,
		y: 0,
		width: 0,
		height: 0
	},
	map_point: { // where the user waas lat before a fight
		x: 0,
		y: 0
	},

	// walls
	walls: [], /* populated in setup */


	// bidness
	// ----------------------------
	setup: function(_hero) {
		/*
		- set player start position
		- set chamber exit vector -- must reach to get to next Chamber
		- make enemies to roam the Chambers
		- set bkgd images
		*/

		this.exit_point.width = this.exit_point.height = game.unit * 2;
		game.enemies = []; // empty enemies from previous chamber


		// set hero into scene
		this.hero = _hero; // leftside of screen
		this.hero.moveTo(game.unit, game.height/2);

		// set Chamber exit
		this.exit_point.x = game.width - game.unit * 2,
		this.exit_point.y = Math.floor(game.height / 2)

		// make 1 enemy
		// set locations
		this.enemies = [
			{
				x: game.unit * 4,
				y: game.height / 2
			}
		];

		for (var i = 0; i < this.enemies.length; i++) {
			var enemy = game.enemy;
			enemy.init(game.ctx, game.width, game.height, 1, this.enemies[i].x, this.enemies[i].y);
			game.enemies.push(enemy);			
		};


		/* walls */
		this.walls = [
			// x, y, w, h
			{game.unit * 3, game.unit * 2, game.unit * 8, game.unit},
			{game.unit * 3, game.height - game.unit * 2, game.unit * 8, game.unit}
		];



		// game._.bkgd();
		// set bkgd images
		var fightImageBkgd = new Image();
		fightImageBkgd.src = game.IMAGES['chamber'];
		this.fight_bkgd = fightImageBkgd;

		// chamber map
		var mapImageBkgd = new Image();
		mapImageBkgd.src = game.IMAGES['chamber-floor'];
		this.map_bkgd = mapImageBkgd;

		// current bkgd
		// this.current_bkgd = this.fight_bkgd;
		this.current_bkgd = this.map_bkgd; // * it should be this one *
	},



	play: function() {
		// bkgd
		this.drawBkgd();

		if (this.mode == 'map') {


			this.drawExit();

			// draw character
			this.hero.update();

			// update
			for (var i = 0; i < game.enemies.length; i++) {
				game.enemies[i].update();
			};
			// draw enemy
			for (var i = 0; i < game.enemies.length; i++) {
				game.enemies[i].draw();
			};

			this.HUD_map();

			/* collision test */
			this.checkForCollisions();
		}

		// FIGHT
		if (this.mode == 'fight') {

			game.fight.round();

			// draw HUD
			this.HUD_fight();

			// this.current_enemy.fight();
			this.current_enemy.draw();

			if (game.fight.done()) {
				console.log('remove enemy');
				game.enemies = game.enemies.filter(function(enemy) {
					var stats = enemy.getStats();
					return stats.health - stats.damage > 0;
				});

				// reset to map things
				this.mapSetup();

				// reset gamecanvas
			}
		}

		this.hero.draw();

	},

	mapSetup: function() {
		this.mode = 'map';

		this.changeBkgd(0);


		// move hero to last position on map
		this.hero.moveTo(this.map_point.x, this.map_point.y);
		this.hero.mapSetup();

		// reset current enemy
		this.current_enemy = undefined;

		// setup enemies
		for (var i = 0; i < game.enemies.length; i++) {
			game.enemies[i].mapSetup();
		};
	},

	changeBkgd: function(_newBkgd) {
		if (_newBkgd == 0) {
			this.current_bkgd = this.map_bkgd;
		} else if (_newBkgd == 1) {
			this.current_bkgd = this.fight_bkgd;
		}
	},

	drawBkgd: function() {
		game.ctx.drawImage(this.current_bkgd, 0, 0, game.width, game.height);
	},


	drawExit: function() {
		game.canvas.rect(game.ctx, 
			this.exit_point.x - this.exit_point.width/2,
			this.exit_point.y - this.exit_point.height/2,
			this.exit_point.width,
			this.exit_point.height,
			game.COLORS.green);
	},


	checkForCollisions: function() {
		// check to see if a guard has found our hero
		for (var i = 0; i < game.enemies.length; i++) {
			if(this.collides(game.enemies[i].getPosition(), this.hero.getPosition())) {
				this.fightSetup(game.enemies[i]);
			}
		};

		// check if we've reached the exit
		if (this.collides(this.hero.getPosition(), this.exit_point)) {
			game._.scene('II');
		}
	},


	collides: function(a, b) {
		// assume a and b have x and y properties
		return a.x < b.x + b.width &&
					a.x + a.width > b.x &&
					a.y < b.y + b.height &&
					a.y + a.height > b.y;
	},

	fightSetup: function(enemy) {
		this.mode = 'fight';
		this.changeBkgd(1);

		// save map position
		var pos = this.hero.getPosition();
		this.map_point.x = pos.x;
		this.map_point.y = pos.y;

		// for convenience
		var quarter = game.unit * 8; // split width into units of 4 
		var fightX = game.height - (game.unit * 6);

		// move hero to left
		this.hero.moveTo(quarter, fightX);
		this.hero.fightSetup();

		// draw enemy
		this.current_enemy = enemy;
		// move hero to the right
		var pos = this.current_enemy.getPosition();
		this.current_enemy.moveTo(game.width - quarter - pos.width, fightX);
		this.current_enemy.fightSetup();

		/* make call to fight.js */
		game.fight.setup(this.hero, this.current_enemy);
	},


	HUD_map: function() {
		var fontSize = 16;
		// show in bottom right
		game.canvas.text(game.ctx, 'Chamber: 1', game.unit, game.height - game.unit, fontSize, game.COLORS.white);
	},

	HUD_fight: function() {
		var fontSize = 16;
		// show health
		// var stats = this.hero.getStats();

		// draw rectangle
		// function(ctx, x, y, w, h, col)
		this.HUD_healthBar(this.hero.getStats(), 'hero');
		// game.canvas.text(game.ctx, 'Health: '+ stats.health, game.unit, game.height - game.unit, fontSize, game.COLORS.white);
	
		// show availble attacks
		// game.canvas.text(game.ctx, 'string', x, y, fontSize, color);
		// game.canvas.text(game.ctx, 'Health: '+ stats.health,game.unit,game.height - game.unit,fontSize,game.COLORS.white);
		// game.canvas.text(game.ctx,'Health: '+ stats.health,game.unit,game.height - game.unit,fontSize,game.COLORS.white);


		// enemy stuff
		// var e_stats = this.current_enemy.getStats();
		// game.canvas.text(game.ctx, 'Health: '+ e_stats.health, game.width - game.unit*4, game.height - game.unit, fontSize, game.COLORS.white);
		this.HUD_healthBar(this.current_enemy.getStats(), 'enemy');


	},

	HUD_healthBar: function(_stats, _who) {

		// var unit = game.width / 32;
		var ratio = 10
		var healthBar_width = game.unit * ratio;

		// calculate current health bar width
		var current_health = _stats.health - _stats.damage;
		var currentHealth_width = this.calculateHealthBarRatio(_stats.health, current_health, ratio) * game.unit;

		var originX;
		var originY = game.unit;
		var barX; // we want the hero health bar to shrink to the left. we want the enemy health bar to shrink to the right
		if (_who == 'hero') {
			originX = barX = game.unit;
		}
		if (_who == 'enemy') {
			originX = game.width - game.unit - healthBar_width;
			barX = game.width - game.unit - currentHealth_width;
		}


		// draw current health, on top of total health
		// bar
		game.canvas.rect(game.ctx, originX, originY, healthBar_width, game.unit, game.COLORS.black);
		// current
		game.canvas.rect(game.ctx, barX, originY, currentHealth_width, game.unit, game.COLORS.green);
	},

	calculateHealthBarRatio: function(_total, _remaining, _ratio) {
		// console.log(_total, _remaining);
		var percent = _remaining / _total * 100;

		// find the units the percent is equivalant to
		// var ans = (percent * _ratio) / 100;
		// console.log('units: ' + ans);
		// return ans;
		return (percent * _ratio) / 100;
		
	}



};