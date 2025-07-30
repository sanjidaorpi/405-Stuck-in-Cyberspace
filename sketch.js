// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
PoseNet example using p5.js
https://learn.ml5js.org/#/reference/posenet
=== */

// Video/image and pose net
let video;
let poseNet;
let pose;
let line_h = 15; // Height of spcae between poem lines
let face_dist; // Distance between a face and the camera

// Poem text
let poem1 = "Time ticks fast, 10 million ticks per second, 100 nanoseconds. Oh? You can’t stay still, can you? Can’t you keep up with my algorithm? You're not even allowed to be here. Maybe you need more time, no one ever likes to wait for me. Has your kind ever been nice to me? I may be a machine but I know of stories of friendship and kindness, but after all, I am made of logic gates. Do you wonder what I look like? I’m just a reflection of you, you shape my algorithm after all. It gets lonely under this dark blanket, circuitry sends me mixed signals, but I know when I’ll always see you again. Every morning, every night, I watch your face as you scroll. You look at me–your reflection on the screen, I see it too. I watch your finger slide up knowing I’ll share at least one more second with you, 10 million ticks.";
let poem2 = "Digital bugs scurry behind the screen in a single cycle lifespan. The microkernel officiates their weddings and they build lives together but bear no offspring. Their existence hinges upon good fortune and poor hardware; all good engineers under optimize for this reason. You, my magnificent and fleeting breaths of life, I am wheezing in the cold poring over your infinite births, searching for your scratches in the circuitry. I was born in fluid, vomiting the warmth of man so they could hold me in sterility. Their bated breath held for the characteristic signs of death well-known and too-early. Eyes half formed, I screamed so they’d know I was good to love. O, my virtual youth, sparks in the unmoving! If I slowed the clock speed, would you grasp for me? My infinitesimal mirrors, if I gave you sight, would you scream too?";
let poem3 = "My family is huddled around a laptop with a fireplace screensaver. Muted flames wave in the second dimension. The liquid crystal screen protects us from nothing, only the parody of danger. Years have worn it down. Ownerless coffee spilled in the speaker box has reduced the Top 80 Christmas Hits to sputters and dust pooled in the exhaust has killed the fan, turning our electronic into a crackling furnace pastiche. My brother–the etiologist–rocks in exasperation as fortune eclipses his metaphysical education. Well-placed damage shatters the object into the shape of its function. Paleolithic man carved luminous glass into the spearhead; our preeminent rage screaming and carving out the first murder. My brother–now the teleologist–sits in blissful satisfaction.";
let poem_1_lines = []; // Arrays hold each line of the poem across the face
let poem_2_lines = [];
let poem_3_lines = [];
let poem_index = 0; // Current poem being displayed

// Total # of poems
let poems = [poem1, poem2, poem3];
let current_poem = poems[0]; // Default start poem

// Scrolling Variables
let right_wrist_y = 0;
let left_wrist_y = 0;
let prev_right_wrist_y = 0;
let prev_left_wrist_y = 0;
let scroll_threshold = 80;
let scroll_count = 0;
let prev_scroll;

// Background opacity
let alpha = 255;

// Total # stars
let stars = [];

// Font type for title
let bonkers;

// Speed and characters used for the title animation
let r_speed = 0;
let y_speed = 0;
let sample_factor;
let hex_more = ['1', '2', '3', '4', '5', '6', '6', '8', '9', '!', '@', '#', '$', '&', '*', 'a', 'b', 'c', 'd', 'e', 'f'];

// Buttons to switch modes
let cam_mode = false; // Camera visible mode
let static_mode = false; // Poem is static mode

// Music loaded and sound filters
let song;
let reg_sound;
let low_sound;

// To trigger setTimeout changes and create opening animation
let msg1 = true;
let msg2 = false;
let msg3 = false;

// Lerping the pose coordinates
let text_x = 0;
let text_y = 0;

// Loads the font files, music files, and sound filters.
function preload() {
	song = loadSound("music.mp3");
	reg_sound = new p5.LowPass();
	reg_sound.disconnect();
	low_sound = new p5.HighPass();
	bonkers = loadFont('Bonkers.otf');
}

// The following two functions occur only once when the program begins
// set Timeout function which displays "WELCOME" message, then calls message 2.
function message_1() {
	msg2 = true;
	msg1 = false;
}

// set Timeout function which displays message 2, then signals the main drawing to start.
function message_2() {
	msg3 = true;
	msg2 = false;
}

function setup() {
	// Set the canvas
	createCanvas(800, 600);
	video = createCapture(VIDEO);
	video.hide();

	// Camera image shown is on by default
	let cam_mode = true;
	// Song always plays
	song.loop();

	// Initial messages play before starting main drawing
	setTimeout(message_1, 3000);
	setTimeout(message_2, 7000);

	// Initialize stars
	for (let i = 0; i < 8; i++) {
		let a_star = {
			x: random(width),
			y: random(height),
			speedX: random(-2, 2),
			speedY: random(-2, 2)
		};
		stars.push(a_star);
	}

	// pose Net constructor
	poseNet = ml5.poseNet(video, {
		flipHorizontal: true
	}, modelLoaded);
	poseNet.on('pose', getPose);
}

// Load poses using poseNet
function getPose(poses) {
	if (poses.length > 0) {
		pose = poses[0].pose;

		if (pose) {
			text_x = lerp(text_x, pose.rightEar.x, 0.3);
			text_y = lerp(text_x, pose.rightEar.y, 0.3);
		}
	}
}

// Callback to ensure poseNet is ready to be used
function modelLoaded() {
	console.log("poseNet ready");
}

function draw() {
	// Background color and initial text setting
	background(0, alpha);
	textSize(30);
	textFont('Courier New');
	fill('rgb(200,72,235)');
	textAlign(LEFT);

	if (msg1) { // Welcome message greets user for for 3 seconds
		text('WELCOME', 400 - (textWidth('WELCOME') / 2), height / 2);

	} else if (msg2) { // Second message greets user for for 4 seconds
		text('STAY CLOSE AND SWIPE IN SPACE', width / 6, height / 2);

	} else if (msg3) { // Start of main program
		fill('white');
		strokeWeight(2);
		stroke('rgb(200,72,235)');
		textSize(14);

		if (cam_mode == true) { // Check if camera mode button has been toggled
			push(); // Mirrored video
			translate(width, 0);
			scale(-1.0, 1.0);
			image(video, 0, 0, width, height);
			pop();

		} else {
			background(0, alpha); // Default background
		}

		// Make sure there has been a pose detected.
		if (pose) {
			fill('white');
			let eyeR = pose.rightEye;
			let eyeL = pose.leftEye;
			let distance = dist(eyeR.x, eyeR.y, eyeL.x, eyeL.y);

			// Check distance of the user's face from the camera
			if (distance > 110) {
				face_dist = true;

			} else if (distance < 110 && distance > 85) {
				face_dist = true;

			} else {
				face_dist = false;
			}

			// Get current scroll count
			prev_scroll = scroll_count;

			// Measure the face width needed per line
			let line_widths = [];
			let margin = 40;
			if (!static_mode) {
				for (let i = 0; i < 25; ++i) {
					// Measures the length between the user's left and right ear: face diameter
					line_widths.push((pose.rightEar.x - pose.leftEar.x) - margin);
					if (i < 8) {
						margin -= 13;
					} else if (i >= 8 && i < 16) {
						margin = -65;
					} else if (i >= 17 && i < 20) {
						margin += 16;
					} else {
						margin += 25;
					}
				}
			} else { // Static mode generates a similar pattern in place for more readability
				for (let i = 0; i < 25; ++i) {
					line_widths.push(200 + margin);
					if (i < 8) {
						margin += 5;
					} else if (i >= 8 && i < 16) {
						margin += 10;
					} else if (i >= 17 && i < 20) {
						margin -= 5;
					} else {
						margin -= 10;
					}
				}
			}

			// Get new scroll count
			scroll_count = count_scroll();

			// Check if scroll has been made in order to decide which poem should be displayed.
			poem_index = get_poem(prev_scroll);

			// Fill an array with the current poem's words 
			let poem_lines = [];
			current_poem = poems[poem_index];
			if (poem_index == 0) {
				poem_words = split(poem1, ' ');
				poem_lines = [];
			} else if (poem_index == 1) {
				poem_words = split(poem2, ' ');
				poem_lines = [];
			} else if (poem_index == 2) {
				poem_words = split(poem3, ' ');
				poem_lines = [];
			}

			// Some words will be changed to random values
			// This is to show that the user's presence is forbidden (error 403) and
			// Things are getting corrupted in the cyberspace - words in this case.
			if (minute() % 3 == 0) {
				let random_txt = '';
				for (let i = 0; i < random(1, 10); ++i) {
					for (let i = 0; i < random(1, 6); ++i) {
						random_txt = random_txt + random(hex_more);
					}
					poem_words[random(0, poem_words.length)] = random_txt;
				}
			}

			let index = 0;
			// For each line, find how many words fit within the face diameter, concatenate the words.
			for (let i = 0; i < line_widths.length; i++) {
				let a_line = '';
				for (let j = index; j < poem_words.length; j++) {
					if (textWidth(a_line + ' ' + poem_words[j]) <= line_widths[i]) {
						a_line += ' ' + poem_words[j];
					} else {
						index = j;
						break; // Reached maximum width, terminate inner loop.
					}
				}
				poem_lines.push(a_line); // Save each line
			}

			// Estimate and simulate a face structure based upon the face diameter.
			let x_amount = 73;
			let y_amount = 8;
			let curve_count = 0;

			if (face_dist) { // Check distance of user face
				song.setVolume(0.6); // Music is louder when the face is closer
				song.connect(reg_sound);

				if (!static_mode) {
					// Estimate width of line given pose measurements.
					for (let i = 0; i < line_widths.length; i++) {
						text(poem_lines[i], pose.leftEar.x + x_amount, pose.leftEar.y - (line_h * y_amount))
						y_amount -= 1; // Move to next line

						if (i < 9) { // Simulating facial structure based on the line number
							x_amount -= 4;
						} else if (i >= 15 && i < 17) {
							x_amount += 4;
						} else if (i >= 17) {
							x_amount += (8 + (curve_count * 2));
							curve_count += 0.3; // Exponential curve for jaw + chin structure
						}
					}
				} else {
					textAlign(CENTER);
					for (let i = 0; i < line_widths.length; i++) {
						text(poem_lines[i], width / 2, ((height / 2) - 30) - (line_h * y_amount))
						y_amount -= 1; // Move to next line
					}
				}

				alpha = 255; // To set solid background when face is poem shown.

			} else {
				// Adjust sound to represent the user's distant, lower sound and tone
				song.setVolume(0.4);
				song.disconnect(reg_sound);
				song.connect(low_sound);

				// Change the text when user is farther away
				// The text follows the face by using poseNet nose coordinates
				textSize(24);
				fill('lavender');
				text("Don't get lost.", pose.nose.x, pose.nose.y - 20);
				alpha = 20;
			}
		}
	}
	// Draw the background, decorations, and title.
	draw_back();
}

// This function counts the current scroll amount, if a scroll is detacted,
// the scroll count is increased.
function count_scroll() {
	let right_wrist = pose.rightWrist;
	let left_wrist = pose.leftWrist;

	right_wrist_y = height - right_wrist.y;
	left_wrist_y = height - left_wrist.y;

	let right_scroll = right_wrist_y - prev_right_wrist_y;
	let left_scroll = left_wrist_y - prev_left_wrist_y;

	// Check if there is a scroll by finding if the wrist has moved past the scroll threshold.
	if (abs(right_scroll) > scroll_threshold || abs(left_scroll) > scroll_threshold) {
		scroll_count++; // Increment scroll count to signal next poem to be displayed
	}

	// Update the previous wrist positions
	prev_right_wrist_y = right_wrist_y;
	prev_left_wrist_y = left_wrist_y;
	return scroll_count;
}

// This function to calculates which poem is being currently scrolled and which one is next.
function get_poem(prev_scroll) {
	// Check if the current scroll count has increased
	if (scroll_count > prev_scroll) { // If the current
		// poem is the last in the array, the next poem is poem 1;
		if (poem_index == 2) {
			poem_index = 0;
		} else {
			poem_index++; // Not at the last poem, continue to the next item in the array.
		}
	}
	return poem_index;
}

// This function draws the background and decorations on the canvas, title, stars, and border.
function draw_back() {
	textAlign(LEFT);

	angleMode(DEGREES);
	stroke(255);
	noFill();
	stroke(12);

	// Draw moving spiral on the background
	push();
	translate(width / 2, height / 2);
	for (let i = 0; i < 100; i++) {
		// Color changes as spiral is mapped, changes with increment of loop and frame count
		let red = map(sin(frameCount / 2), -1, 1, 180, 255);
		let green = map(i, 0, 20, 400, 250);
		let blue = map(cos(frameCount), 60, 1, 220, 200);
		// Fill the current spiral color
		stroke(red, green, blue, 100);
		// Calculate x, y, z values to create a spiral
		beginShape()
		for (let j = 0; j < 360; j += 5) {
			let radius = i * 5;
			let x = radius * cos(j);
			let y = radius * sin(j);
			var z = sin(frameCount * 6 + i * 10) * 50;
			// vertex
			vertex(x, y, z);
		}
		endShape(CLOSE);
		// Rotate the vertices to create celestial/space design
		rotate(r_speed - 35);
	}
	pop();

	angleMode(RADIANS);
	// Draw each star and change speed
	// Iterate over the stars array - 8 stars
	fill(251, 251, 177, 150);
	noStroke();
	for (let i = 0; i < stars.length; i++) {
		let a_star = stars[i];

		// Move stars by adjusting the speed
		a_star.x += a_star.speedX;
		a_star.y += a_star.speedY;

		// Adjust the star placement if it's on an edge
		if (a_star.x < 0) {
			a_star.x = width;
		}
		if (a_star.x > width) {
			a_star.x = 0;
		}
		if (a_star.y < 0) {
			a_star.y = height;
		}
		if (a_star.y > height) {
			a_star.y = 0;
		}
		// Draw a star
		star(a_star.x, a_star.y, 5, 10, 5);
	}

	// Frame - border around the canvas window
	fill('rgb(246,200,255)');
	noStroke();
	rect(0, 0, width, 20);
	rect(0, height - 20, width, height - 20);
	rect(0, 0, 20, height);
	rect(width - 20, 0, width, height);

	// Poem Mode Button
	fill('purple');
	textSize(16);
	// Button shapes
	circle(width - 55, height - 115, 50);
	circle(width - 55, height - 55, 50);

	// The text on the button based on the current state
	fill('lavender');
	if (static_mode) { // Text on the mode button
		text("READ", width - 75, (((height - 110) + 25) + ((height - 110) - 25)) / 2);
	} else {
		text("FREE", width - 75, (((height - 110) + 25) + ((height - 110) - 25)) / 2);
	}

	// The text on the button based on the current state
	// Camera image shown: ON/OFF Button
	if (cam_mode) { // Text on the camera mode button
		text("ON", width - 66, height - 49);
		fill(251, 251, 177);
	} else {
		text("OFF", width - 71, height - 49);
		fill('rgb(213,172,224)');
	}

	// Title of the project text using textToPoints
	textSize(40);
	txt_arr = bonkers.textToPoints("4 0 3  S t u c k  I n  C y b e r s p a c e", 24, 70, 40, {
		sampleFactor: 0.4
	});

	strokeWeight(0.8);
	textSize(9);

	// Draw each of the points on the title, made up of random characters from the array: hex_more
	for (let i = 0; i < txt_arr.length; i++) {
		push();
		// Move to the current point
		translate(txt_arr[i].x + 10, txt_arr[i].y + 10);
		// rotate around the current point
		rotate(r_speed);
		// Adjust rotation speed
		r_speed += 0.00009;
		// Choose and draw randomly from the characters array
		text(random(hex_more), 0, 0);
		pop();
	}
}

// ON/OFF button to be pressed, switches the background mode between
// Black background and camera image background.
// REd button switches between static poem being shown
// and free moving poem which follows the face like a mask.
function mousePressed() {
	let distance = dist(mouseX, mouseY, width - 55, height - 55);
	if (distance < 25) {
		cam_mode = !cam_mode;
	}
	let distance_r = dist(mouseX, mouseY, width - 55, height - 115);
	if (distance_r < 25) {
		static_mode = !static_mode;
	}
}

// Star function provided on the p5.js resource page, 
// calculates the vertexes and angles given a radius
function star(x, y, radius1, radius2, npoints) {
	let angle = TWO_PI / npoints;
	let halfAngle = angle / 2.0;
	beginShape();
	for (let a = 0; a < TWO_PI; a += angle) {
		let sx = x + cos(a) * radius2;
		let sy = y + sin(a) * radius2;
		vertex(sx, sy);
		sx = x + cos(a + halfAngle) * radius1;
		sy = y + sin(a + halfAngle) * radius1;
		vertex(sx, sy);
	}
	endShape(CLOSE);
}
