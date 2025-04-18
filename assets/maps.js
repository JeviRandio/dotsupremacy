const Map = {
	Grid: class {
		x = 0;
		y = 0;
		score = 1;
		canvas = null;
		rankSmooth = false;
		fps = 12;
		ctx = null;
		width = null;
		height = null;
		constructor(canvas){
			if(!canvas) throw new Error("A canvas element is needed to be specified for constructing the grid map.");
			this.canvas = canvas;
			this.width = canvas.width;
			this.height = canvas.height;
			if(canvas.getContext("webgl"))
				this.ctx = canvas.getContext("webgl");
			else 
				throw new Error("Rendering Engine of the canvas has been disabled");
			
			//WEBGL ENGINE SPECS STARTER
			let vertexShaderSource = `attribute vec2 a_position;void main() {gl_Position = vec4(a_position, 0.0, 1.0);}`;
			let fragmentShaderSource = `precision mediump float;uniform vec4 u_color;void main() {gl_FragColor = u_color;}`;
			let createProgram = function(ctx, vShader, fShader){
				const program = ctx.createProgram();
				ctx.attachShader(program, vShader);
				ctx.attachShader(program, fShader);
				ctx.linkProgram(program);
				return program;
			}
			let createShader = function(gl, type, source) {
				const shader = gl.createShader(type);
				gl.shaderSource(shader, source);
				gl.compileShader(shader);
				return shader;
			}
			let vertexShader = createShader(this.ctx, this.ctx.VERTEX_SHADER, vertexShaderSource);
			let fragmentShader = createShader(this.ctx, this.ctx.FRAGMENT_SHADER, fragmentShaderSource);
			
			this.canvas.engine = {
				program: createProgram(this.ctx, vertexShader, fragmentShader)
			}
			this.ctx.useProgram(this.canvas.engine.program);
			this.ctx.enable(this.ctx.BLEND);
			this.ctx.blendFunc(this.ctx.SRC_ALPHA, this.ctx.ONE_MINUS_SRC_ALPHA);
		}
		render = function(x, y, score, canvas, rankSmooth){
			if(x == null) x = this.x;
			else this.x = x;
			if(y == null) y = this.y;
			else this.y = y;
			if(score == null) score = this.score;
			else this.score = score;
			if(canvas == null) canvas = this.canvas;
			else this.canvas = canvas;
			if(rankSmooth == null) rankSmooth = this.rankSmooth;
			else this.rankSmooth = rankSmooth;

			let colorLevel;
			if(score < 1000) colorLevel = 0 						//Beginning
			else if (score < 1000000) colorLevel = 1 				//Kingdom
			else if (score < 1000000000) colorLevel = 2 			//Medusa
			else if (score < 1000000000000) colorLevel = 3 			//Gigachad
			else if (score < 1000000000000000) colorLevel = 4 		//Titanium
			else if (score < Math.pow(10,18)) colorLevel = 5 	//Quantum
			else colorLevel = 6 									//Universe

			if(canvas.score == null) rankSmooth = false
			if(canvas.score != null){
				if(rankSmooth == true){
					if(canvas.oldColor != colorLevel){
						let i = this.colors[canvas.oldColor][0];
						let j = this.colors[colorLevel][0];
						this.drawBack(this.lap(i, j, (canvas.step + 1)/this.fps));
						this.drawGrid(canvas, score, x, y, this.lap(this.colors[canvas.oldColor][1], this.colors[colorLevel][1], (canvas.step + 1)/this.fps));
						
						if(canvas.step < this.fps - 1)
							canvas.step++;
						else {
							canvas.step = 0;
							canvas.oldColor = colorLevel;
						}
						return
					}
					else {
						canvas.score = score;
						canvas.step = 0;
						canvas.oldColor = colorLevel;
						this.drawBack(this.colors[colorLevel][0])
						this.drawGrid(this.ctx, score, x, y, this.colors[colorLevel][1]);
					}
					return
				}
				return
			}
			
			canvas.score = score;
			canvas.step = 0;
			canvas.oldColor = colorLevel;
			this.drawBack(this.colors[colorLevel][0])
			this.drawGrid(this.ctx, score, x, y, this.colors[colorLevel][1]);
		}
		colors = [ //Fill  //Lines
			["#6a70a0", "#aeaeae"],
			["#50587c", "#9c9c9c"],
			["#404360", "#888888"],
			["#333349", "#787878"],
			["#272938", "#696969"],
			["#16161e", "#494949"],
			["#000c15", "#282828"],
		]
		lap = function(color1, color2, percent){
			let oldies = [];
			let newies = [];
			
			color1 = color1.substring(1);
			color2 = color2.substring(1);
			
			oldies[0] = parseInt(color1.substr(0, 2), 16);
			oldies[1] = parseInt(color1.substr(2, 2), 16);
			oldies[2] = parseInt(color1.substr(4, 2), 16);
			
			newies[0] = parseInt(color2.substr(0, 2), 16);
			newies[1] = parseInt(color2.substr(2, 2), 16);
			newies[2] = parseInt(color2.substr(4, 2), 16);
			
			let finals = [];
			
			finals[0] = (oldies[0] + Math.round((newies[0] - oldies[0]) * percent)).toString(16)
			finals[1] = (oldies[1] + Math.round((newies[1] - oldies[1]) * percent)).toString(16)
			finals[2] = (oldies[2] + Math.round((newies[2] - oldies[2]) * percent)).toString(16)
			
			finals = "#" + finals[0] + finals[1] + finals[2];
			return finals;
		}
		arrayRGB = function(hex){
			hex = hex.replace(/^#/, '');

			if (hex.length === 3) 
				hex = hex.split('').map(c => c + c).join('');
			  
			const bigint = parseInt(hex, 16);
			const r = (bigint >> 16) & 255;
			const g = (bigint >> 8) & 255;
			const b = bigint & 255;

			return [r, g, b];
		}
		drawBack = function(hexcolor){
			let temp = this.arrayRGB(hexcolor);
			
			this.ctx.clearColor(temp[0]/255, temp[1]/255, temp[2]/255, 1);
			this.ctx.clear(this.ctx.COLOR_BUFFER_BIT);
		}
		drawGrid = function(canvas, score, posX, posY, color){
			let hypot = Math.hypot(this.width, this.height)
			let subs = 11 //Number of Player's Ball to fit the length of Hypotenuse
			let interval = hypot/subs //Length or pixels of Player's Ball on the actual screen
			let ratioX = canvas.width/hypot;
			let ratioY = canvas.height/hypot;
			let actual = Math.cbrt(score)
			let places = Math.floor(Math.log10(actual))
			let tens = Math.pow(10, places)
			let centerX = this.width/2
			let centerY = this.height/2;
			let drawLine = function(ctx, x1, y1, x2, y2, color, canvas){
				const cx = canvas.width / 2;
				const cy = canvas.height / 2;
				const clipX = x => (x - cx) / cx;
				const clipY = y => (cy - y) / cy;

				const positions = new Float32Array([
					clipX(x1), clipY(y1),
					clipX(x2), clipY(y2)
				]);

				const positionBuffer = ctx.createBuffer();
				ctx.bindBuffer(ctx.ARRAY_BUFFER, positionBuffer);
				ctx.bufferData(ctx.ARRAY_BUFFER, positions, ctx.STATIC_DRAW);
				
				const posLoc = ctx.getAttribLocation(canvas.engine.program, 'a_position');
				ctx.enableVertexAttribArray(posLoc);
				ctx.vertexAttribPointer(posLoc, 2, ctx.FLOAT, false, 0, 0);
				
				const colorLoc = ctx.getUniformLocation(canvas.engine.program, 'u_color');
				ctx.uniform4fv(colorLoc, color);
			}
			
			let trans = {
				posX: posX / tens,
				posY: posY / tens,
				score: actual / tens,
				interval: interval/(actual/tens)
			}

			let goer = centerX - ((trans.posX % 1) * trans.interval);
			let guideNum = Math.floor(trans.posX);

			while(goer - trans.interval >= 0){
				goer -= trans.interval;
				guideNum--;
			}
			let alphaer = (1 / Math.pow(trans.score, 1.5))-0.018;
			while(goer <= this.width){
				let x = goer;
				let alpha = 1;
				
				if(guideNum % 10 != 0) alpha = alphaer
				
				drawLine(this.ctx, x, 0, x, this.height, this.arrayRGB(color).concat(alpha), this.canvas)
				this.ctx.drawArrays(this.ctx.LINES, 0, 2);
				goer += trans.interval;
				guideNum++;
			}
			
			goer = centerY - ((trans.posY % 1) * trans.interval);
			guideNum = Math.floor(trans.posY);

			while(goer - trans.interval >= 0){
				goer -= trans.interval;
				guideNum--;
			}

			while(goer <= this.height){
				let y = goer;
				let alpha = 1;
				
				if(guideNum % 10 != 0) alpha = alphaer;
				
				
				drawLine(this.ctx, 0, y, this.width, y, this.arrayRGB(color).concat(alpha), this.canvas)
				this.ctx.drawArrays(this.ctx.LINES, 0, 2);
				goer += trans.interval;
				guideNum++;
			}
		}
	}
}
