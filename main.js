const START_ANGLE = 0
const ANGLE = Math.PI/4;
const SIZE = 500
const NB_RAYS = 25
const VERTICAL_VIEW = 70 // deg

// class

class Point {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
}

class Line {
	constructor(point1, point2) {
		this.point1 = point1;
		this.point2 = point2;
	}
}

// functions

let degToRad = function(deg) {
	return deg * Math.PI / 180;
}

let drawWalls = function(ctx, walls) {
	ctx.strokeStyle = "#FF0000";
	for (let nb in walls) {
		ctx.beginPath();
		ctx.moveTo(walls[nb].point1.x, walls[nb].point1.y);
		ctx.lineTo(walls[nb].point2.x, walls[nb].point2.y);
		ctx.stroke();
	}
}

let clearCanvas = function(ctx, color) {
	ctx.fillStyle = color;
	ctx.fillRect(0,0,SIZE, SIZE);
}

let collide = function(l1, l2) {
	a1 = l1.point2.y - l1.point1.y;
	b1 = l1.point1.x - l1.point2.x;
	c1 = a1 * l1.point1.x + b1 * l1.point1.y;

	a2 = l2.point2.y - l2.point1.y;
	b2 = l2.point1.x - l2.point2.x;
	c2 = a2 * l2.point1.x + b2 * l2.point1.y;

	determinant = a1 * b2 - a2 * b1;

	if (determinant == 0)  { 
		// parallel lines 
        return -1;
    } else { 
		x = (b2 * c1 - b1 * c2) / determinant; 
        y = (a1 * c2 - a2 * c1) / determinant;

        if ((((y >= l2.point1.y && y <= l2.point2.y ) || (y <= l2.point1.y && y >= l2.point2.y )) &&
        	((x >= l2.point1.x && x <= l2.point2.x ) || (x <= l2.point1.x && x >= l2.point2.x  ))) &&
        	(((y >= l1.point1.y && y <= l1.point2.y ) || (y <= l1.point1.y && y >= l1.point2.y )) &&
        	((x >= l1.point1.x && x <= l1.point2.x ) || (x <= l1.point1.x && x >= l1.point2.x  )))) {
        	return new Point(x, y);
        } else {
        	return -1;
        } 
    } 
}

let distance = function(p1, p2) {
	return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

let drawRay = function(ctx, ctx_render, point, walls) {
	ctx.strokeStyle = "#FFFFFF";
	let imageData = ctx_render.getImageData(0,0, SIZE, SIZE);
	for (let i=0; i<NB_RAYS; i++) {
		found = false;
		let angle = i / NB_RAYS * ANGLE;
		let v_x = Math.cos(angle);
		let v_y = Math.sin(angle);

		let end = new Point(parseInt(point.x + v_x*canvas.width*2), parseInt(point.y + v_y*canvas.height*2));


		let l1 = new Line(point, end);
		for (let nb in walls) {
			let wall = walls[nb];
			let l2 = new Line(wall.point1, wall.point2);
			collision = collide(l1, l2);
			if (collision != -1) {
				found = true;
				d1 = distance(point, collision);
				if (d1 < distance(end, point)) {
					end = collision;
				}
			}
		}
		if (found) {
			renderRay(point, end, angle, imageData.data);
		}

		ctx.beginPath();
		ctx.moveTo(point.x, point.y);
		ctx.lineTo(end.x, end.y);
		ctx.stroke();

	}
	ctx_render.putImageData(imageData, 0, 0);
}

let drawPixel = function(data, x, y, color) {
	base = 4 * (y * SIZE + x);
	for (let i=0; i<SIZE/NB_RAYS; i++) {
		pos = base + i*4
		data[pos] = color
		data[pos+1] = color
		data[pos+2] = color
	}
}

let calcWallSize = function(d) {
	angle = degToRad(VERTICAL_VIEW);
	real_size = SIZE * 4/5;

	/*
	in_vision = 2 * real_size / Math.tan(angle);
	if (in_vision > 500) {
		in_vision = 500
	}
	*/
	field = 2 * Math.tan(angle) * d;
	in_vision = Math.pow(real_size,2)/field;
	if (in_vision > 500) {
		in_vision = 500
	}
	return in_vision;
}

let renderRay = function(start, end, angle, data) {
	x = ((angle - START_ANGLE) / ANGLE) * SIZE; // is it possible ?
	dist = distance(start, end);
	diag = Math.sqrt(2 * Math.pow(SIZE,2));
	ratio = 1.9*dist/diag
	if (ratio > 1) {
		ratio = 1
	}

	color = (ratio * 255) ^ 255;
	
	decal = parseInt((SIZE - calcWallSize(dist))/2);

	for (let i=decal; i<SIZE-decal; i++) {
		drawPixel(data, x, i, color);
	}

}

// walls

var walls = [
	new Line(new Point(100,100), new Point(300,100)),
	new Line(new Point(300,160), new Point(210,300)),
	new Line(new Point(50,300), new Point(100,200)),
	new Line(new Point(150,450), new Point(300,370)),
	new Line(new Point(360,200), new Point(450,400))
]

// canvas

var canvas = document.querySelector("#canvas");
var ctx = canvas.getContext("2d");

clearCanvas(ctx, "#000000");

// render

var c_render = document.querySelector("#render");
var ctx_render = c_render.getContext("2d");

clearCanvas(ctx_render, "#000000");

// events

canvas.addEventListener('mousemove', function(e){

	let pos_x = e.clientX;
	let pos_y = e.clientY;
	
	// clear canvas
	clearCanvas(ctx, "#000000");
	clearCanvas(ctx_render, "#000000");

	// draw rays
	drawRay(ctx, ctx_render, new Point(pos_x, pos_y), walls);

	// draw walls	
	drawWalls(ctx, walls);

	// draw cursor
	ctx.fillStyle = "#0000FF";
	ctx.beginPath();
	ctx.arc(pos_x, pos_y, 5, 0, 2*Math.PI);
	ctx.fill();
});
