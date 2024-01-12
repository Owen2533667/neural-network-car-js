class Sensor{
    constructor(car){
        // Initialise the Sensor with the associated car, ray parameters, and empty arrays for rays and readings
        this.car = car;
        this.rayCount = 5; // Number of rays emitted by the sensor
        this.rayLength = 150; // Length of each ray
        this.raySpread = Math.PI/2; // Spread of rays in radians

        this.rays = []; // Array to store the cast rays
        this.readings = []; // Array to store the readings obtained from ray intersections
    }

    update(roadBorders, traffic){
        // Update the sensor state by casting rays and obtaining readings from intersections
        this.#castRays();
        this.readings = [];

        // Iterate through all cast rays and obtain readings
        for(let i = 0; i < this.rays.length; i++){
            this.readings.push(
                this.#getReading(
                    this.rays[i],
                    roadBorders,
                    traffic
                )
            );
        }
    }

    #getReading(ray, roadBorders, traffic){
        // Obtain readings by checking intersections with road borders and traffic polygons
        let touches = [];

        // Check intersections with road borders
        for(let i = 0; i < roadBorders.length; i++){
            const touch = getIntersection(
                ray[0],
                ray[1],
                roadBorders[i][0],
                roadBorders[i][1]
            );
            if(touch){
                touches.push(touch);
            }
        }

        // Check intersections with traffic polygons
        for(let i = 0; i < traffic.length; i++){
            const poly = traffic[i].polygon;
            for(let j = 0; j < poly.length; j++){
                const value = getIntersection(
                    ray[0],
                    ray[1],
                    poly[j],
                    poly[(j + 1) % poly.length]
                );
                if(value){
                    touches.push(value);
                }
            }
        }

        // Determine the closest intersection point
        if(touches.length == 0){
            return null;
        }else{
            // Calculate the minimum offset and find the corresponding intersection point
            const offsets = touches.map(e => e.offset);
            const minOffset = Math.min(...offsets);
            return touches.find(e => e.offset == minOffset);
        }
    }

    #castRays(){

        // Cast rays in a spread around the car's angle and store them in the rays array
        this.rays = [];

        for(let i = 0; i < this.rayCount; i++){
            // Calculate the angle of the current ray based on the spread and car's angle
            const rayAngle = lerp(
                this.raySpread/2,
                -this.raySpread/2,
                this.rayCount == 1 ? 0.5 : i / (this.rayCount - 1)
            )+this.car.angle;

            // Define the start and end points of the ray
            const start = {x:this.car.x, y:this.car.y};
            const end = {
                x:this.car.x-
                    Math.sin(rayAngle)*this.rayLength,
                y:this.car.y-
                    Math.cos(rayAngle)*this.rayLength
            };
            this.rays.push([start, end]);
        }
    }

    draw(ctx){
        // Draw rays on the canvas for visualisation
        for(let i = 0; i < this.rayCount; i++){
            let end = this.rays[i][1];
            if(this.readings[i]){
                // If there is a reading, adjust the end point to the reading's position
                end = this.readings[i];
            }

            // Draw the yellow ray
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "yellow";
            ctx.moveTo(
                this.rays[i][0].x,
                this.rays[i][0].y
            );
            ctx.lineTo(
                end.x,
                end.y
            );
            ctx.stroke();

            // Draw a black line to the end point
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "black";
            ctx.moveTo(
                this.rays[i][1].x,
                this.rays[i][1].y
            );
            ctx.lineTo(
                end.x,
                end.y
            );
            ctx.stroke();
        }
    }        
}