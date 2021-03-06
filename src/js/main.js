'use strict';

var game = game || {};

game.KEYBOARD = {
	'LEFT': 37,
	'RIGHT': 39,
	'UP': 38,
	'DOWN': 40,
	'SPACE': 32,
	'ENTER': 13,
	'SHIFT': 16,
	'A': 65,
	'S': 83,
	'D': 68,
	'P': 80,
	'1': 49,
	'2': 50,
	'3': 51,
	'4': 52,
	'ESC': 27
};

game.FIGHTKEYS = {
	'A': 65,
	'S': 83,
	'D': 68,
	'SPACE': 32,
	'SHIFT': 16
}

game.IMAGES = {
	'dark-night': 'assets/backgrounds/tMVGqP6h.jpg',
	'night': 'assets/backgrounds/nK8JAYqh.jpg',
	'dusk': 'assets/backgrounds/q7Uq7Tsh.jpg',
	'daytime': 'assets/backgrounds/Lsg8aD3h.jpg',
	'evening': 'assets/backgrounds/p00lPs6h.jpg',
	'chamber': 'assets/backgrounds/chamber.gif',
	'chamber-floor': 'assets/backgrounds/chamber-floor.jpg',
	'smoke': 'assets/spritesheets/smoke1.png'
};

game.COLORS = {
	'white': '#ebebeb',
	'yellow': '#f6cb1a',
	'black': '#2f2f2f',
	'blue': '#00f',
	'red': '#b92d19',
	'green': '#499224'
};

game.SOUNDS = {
	bell: {
		id: "bell",
		src: "assets/sounds/bell.mp3"
	},
	jab: {
		id: "jab",
		src: "assets/sounds/jab.mp3"
	},
	kick: {
		id: "kick",
		src: "assets/sounds/kick.mp3"
	},
	punch: {
		id: "punch",
		src: "assets/sounds/punch.mp3"
	},
	sword: {
		id: "sword",
		src: "assets/sounds/sword-swing.mp3"
	},
	thud: {
		id: "thud",
		src: "assets/sounds/thud.mp3"
	},
	introMusic: {
		id: "introMusic",
		src: "assets/sounds/intro.mp3"
	},
	endCredits: {
		id: "end",
		src: "assets/sounds/wu-tang-clan.mp3"
	},
	soundtrack: {
		id: "soundtrack",
		src: "assets/sounds/oh-the_rza.mp3"
	},
	fightingMusic: {
			id: "fightingMusic",
			src: "assets/sounds/afros-father.mp3"
		}
}
game.soundtrack = undefined;

game.width = 0;
game.height = 0;
game.unit = 0; // game.width / 32 (min-size: 10) [set in canvas.init()]
game.ctx = undefined;
game.animationID = undefined;
game.paused = false;
game.enemies = [];

game.keyPressed = [];

// load da things
Modernizr.load({
	load: [
		// js
		'js/shaolin/canvas.js',
		'js/shaolin/game.js',
		'js/shaolin/fight.js',
		'js/shaolin/characters/hero.js',
		'js/shaolin/characters/enemy.js',
		'js/shaolin/scene/master.js',
		'js/shaolin/scene/I.js',
		'js/shaolin/scene/II.js',
		'js/shaolin/scene/III.js',
		'js/shaolin/sprites/smoke.js',
		// images
		game.IMAGES['dark-night'],
		game.IMAGES['night'],
		game.IMAGES['dusk'],
		game.IMAGES['daytime'],
		game.IMAGES['evening'],
		game.IMAGES['chamber'],
		game.IMAGES['smoke']
	],

	complete: function() {
		
		/* event handlers */

		window.onblur = function() {
			game.paused = true;
			cancelAnimationFrame(game.animationID);
			game.keyPressed = [];
			game.soundtrack.volume = 0.15;
			game._.update();
		}
		window.onfocus = function() {
			game.paused = false;
			cancelAnimationFrame(game.animationID);
			game.soundtrack.volume = 0.8;
			game._.update();
		}

		// keyup/down
		window.onkeydown = function(e) {
			game.keyPressed[e.keyCode] = true;
		}
		window.onkeyup = function(e) {
			game.keyPressed[e.keyCode] = false;
		}



		/* sound stuff */

		// createjs.Sound.alternateExtensions = ["mp3"];
		createjs.Sound.registerSound(game.SOUNDS.introMusic);
		createjs.Sound.registerSound(game.SOUNDS.bell);
		createjs.Sound.registerSound(game.SOUNDS.soundtrack);
		createjs.Sound.registerSound(game.SOUNDS.fightingMusic);
		createjs.Sound.registerSound(game.SOUNDS.jab);
		createjs.Sound.registerSound(game.SOUNDS.kick);
		createjs.Sound.registerSound(game.SOUNDS.punch);
		createjs.Sound.registerSound(game.SOUNDS.sword);
		createjs.Sound.registerSound(game.SOUNDS.thud);
		createjs.Sound.registerSound(game.SOUNDS.endCredits);

		createjs.Sound.addEventListener("fileload", handleFileLoad);

		function handleFileLoad(e) {
			console.log('pre-loaded sound: ', e.id, e.src);
			if (e.src == game.SOUNDS.introMusic.src) game._.update_soundtrack(game.SOUNDS.introMusic.id);
		}
			


		/* do canvas things */
		game._.init();

		/* start the show */
		var startScreen = document.querySelector('#start');
		var storyScreen = document.querySelector('#story');
		
		startScreen.style.display = 'block';
		document.querySelector('#start span').onclick = function() {			
			createjs.Sound.play("bell");
			startScreen.style.display = 'none'; // hide start screen
			storyScreen.style.display = 'block'; // show story screen
		};

		document.querySelector('#story span').onclick = function() {
			storyScreen.style.display = 'none'; // hide screen
			game._.scene(1); // start game
		};

	}

});