class Car {
    // Constructor for the Car class
    // Parameters: x, y - initial position, width, height - dimensions of the car,
    // controlType - type of control ("AI", "DUMMY"), maxSpeed - maximum speed (default is 3),
    // color - color of the car (default is "blue")
    constructor(x, y, width, height, controlType, maxSpeed = 3, color = "blue") {
        // Initialise properties based on constructor parameters
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        // Properties related to car movement
        this.speed = 0;
        this.acceleration = 0.2;
        this.maxSpeed = maxSpeed;
        this.friction = 0.05;
        this.angle = 0;
        this.damaged = false;

        // Determine if the car uses an AI brain for control
        this.useBrain = controlType == "AI";

        // Initialise sensor and brain if car controlType is not "DUMMY"
        if (controlType != "DUMMY") {
            this.sensor = new Sensor(this);
            this.brain = new NeuralNetwork([this.sensor.rayCount, 6, 4]);
        }

        // Initialise controls based on controlType
        this.controls = new Controls(controlType);

        // Load car image and create a mask for collision detection
        this.img = new Image();
        this.img.src = "car.png";

        this.mask = document.createElement("canvas");
        this.mask.width = width;
        this.mask.height = height;

        const maskCtx = this.mask.getContext("2d");
        this.img.onload = () => {
            // Draw a filled rectangle in the mask with the specified color
            maskCtx.fillStyle = color;
            maskCtx.rect(0, 0, this.width, this.height);
            maskCtx.fill();

            // Use the car image as a mask
            maskCtx.globalCompositeOperation = "destination-atop";
            maskCtx.drawImage(this.img, 0, 0, this.width, this.height);
        };
    }

    // Method to update the car's position and state
    update(roadBorders, traffic) {
        // If the car is not damaged, update its position, create a polygon for collision detection,
        // and check for damage based on collisions with road borders and traffic
        if (!this.damaged) {
            this.#move();
            this.polygon = this.#createPolygon();
            this.damaged = this.#assessDamage(roadBorders, traffic);
        }

        // If the car has a sensor, update the sensor and use its readings for AI control
        if (this.sensor) {
            this.sensor.update(roadBorders, traffic);
            const offsets = this.sensor.readings.map(s => (s == null ? 0 : 1 - s.offset));
            const outputs = NeuralNetwork.feedForward(offsets, this.brain);

            // If the car uses AI control, update control values based on neural network outputs
            if (this.useBrain) {
                this.controls.forward = outputs[0];
                this.controls.left = outputs[1];
                this.controls.right = outputs[2];
                this.controls.reverse = outputs[3];
            }
        }
    }

    // Private method to assess damage based on collisions with road borders and traffic
    #assessDamage(roadBorders, traffic) {
        for (let i = 0; i < roadBorders.length; i++) {
            if (polysIntersect(this.polygon, roadBorders[i])) {
                return true;
            }
        }
        for (let i = 0; i < traffic.length; i++) {
            if (polysIntersect(this.polygon, traffic[i].polygon)) {
                return true;
            }
        }
        return false;
    }

    // Private method to create a polygon representing the car's shape for collision detection
    #createPolygon() {
        const points = [];
        const rad = Math.hypot(this.width, this.height) / 2;
        const alpha = Math.atan2(this.width, this.height);

        // Calculate corner points of the car's bounding box
        points.push({
            x: this.x - Math.sin(this.angle - alpha) * rad,
            y: this.y - Math.cos(this.angle - alpha) * rad
        });
        points.push({
            x: this.x - Math.sin(this.angle + alpha) * rad,
            y: this.y - Math.cos(this.angle + alpha) * rad
        });
        points.push({
            x: this.x - Math.sin(Math.PI + this.angle - alpha) * rad,
            y: this.y - Math.cos(Math.PI + this.angle - alpha) * rad
        });
        points.push({
            x: this.x - Math.sin(Math.PI + this.angle + alpha) * rad,
            y: this.y - Math.cos(Math.PI + this.angle + alpha) * rad
        });

        return points;
    }

    // Private method to handle car movement
    #move() {
        // Adjust speed based on control inputs
        if (this.controls.forward) {
            this.speed += this.acceleration;
        }
        if (this.controls.reverse) {
            this.speed -= this.acceleration;
        }

        // Limit speed to maximum speed and handle friction
        if (this.speed > this.maxSpeed) {
            this.speed = this.maxSpeed;
        }
        if (this.speed < -this.maxSpeed / 2) {
            this.speed = -this.maxSpeed / 2;
        }

        if (this.speed > 0) {
            this.speed -= this.friction;
        }
        if (this.speed < 0) {
            this.speed += this.friction;
        }
        if (Math.abs(this.speed) < this.friction) {
            this.speed = 0;
        }

        // Update angle and position based on speed and controls
        if (this.speed != 0) {
            const flip = this.speed > 0 ? 1 : -1;
            if (this.controls.left) {
                this.angle += 0.03 * flip;
            }
            if (this.controls.right) {
                this.angle -= 0.03 * flip;
            }
        }

        this.x -= Math.sin(this.angle) * this.speed;
        this.y -= Math.cos(this.angle) * this.speed;
    }

    // Method to draw the car on a canvas context
    // Parameters: ctx - the canvas rendering context, drawSensor - whether to draw the sensor
    draw(ctx, drawSensor = false) {
        // If the car has a sensor and drawSensor is true, draw the sensor
        if (this.sensor && drawSensor) {
            this.sensor.draw(ctx);
        }

        // Save the current transformation state
        ctx.save();
        // Translate and rotate the context based on the car's position and angle
        ctx.translate(this.x, this.y);
        ctx.rotate(-this.angle);

        // If the car is not damaged, draw the car's mask with a color overlay and multiply blending
        if (!this.damaged) {
            ctx.drawImage(
                this.mask,
                -this.width / 2,
                -this.height / 2,
                this.width,
                this.height
            );
            ctx.globalCompositeOperation = "multiply";
        }

        // Draw the car image on the canvas
        ctx.drawImage(
            this.img,
            -this.width / 2,
            -this.height / 2,
            this.width,
            this.height
        );

        // Restore the transformation state
        ctx.restore();
    }
}
