class Road {
    // Constructor for Road class
    // Parameters: x - center x-coordinate of the road, width - width of the road, laneCount - number of lanes (default is 3)
    constructor(x, width, laneCount = 3) {
        // Initialise properties based on constructor parameters
        this.x = x;
        this.width = width;
        this.laneCount = laneCount;

        // Calculate left and right boundaries of the road
        this.left = x - width / 2;
        this.right = x + width / 2;

        // Set top and bottom boundaries of the road to positive and negative infinity
        const infinity = 1000000;
        this.top = -infinity;
        this.bottom = infinity;

        // Define corner points of the road for creating borders
        const topLeft = { x: this.left, y: this.top };
        const topRight = { x: this.right, y: this.top };
        const bottomLeft = { x: this.left, y: this.bottom };
        const bottomRight = { x: this.right, y: this.bottom };

        // Create an array of borders using the corner points
        this.borders = [
            [topLeft, bottomLeft],
            [topRight, bottomRight]
        ];
    }

    // Method to calculate the center of a specified lane
    // Parameter: laneIndex - the index of the lane
    getLaneCenter(laneIndex) {
        // Calculate the width of each lane
        const laneWidth = this.width / this.laneCount;
        // Calculate and return the center of the specified lane
        return this.left + laneWidth / 2 + Math.min(laneIndex, this.laneCount - 1) * laneWidth;
    }

    // Method to get the number of lanes in the road
    getNumLanes() {
        return this.laneCount;
    }

    // Method to draw the road on a canvas context
    // Parameter: ctx - the canvas rendering context
    draw(ctx) {
        // Set the line properties for lane markings
        ctx.lineWidth = 5;
        ctx.strokeStyle = "white";

        // Loop through lanes and draw lane markings
        for (let i = 1; i <= this.laneCount - 1; i++) {
            // Calculate x-coordinate for each lane marking using linear interpolation
            const x = lerp(this.left, this.right, i / this.laneCount);

            // Set line dash for a dashed effect
            ctx.setLineDash([20, 20]);
            // Draw a vertical dashed line for each lane marking
            ctx.beginPath();
            ctx.moveTo(x, this.top);
            ctx.lineTo(x, this.bottom);
            ctx.stroke();
        }

        // Reset line dash to solid for drawing road borders
        ctx.setLineDash([]);

        // Loop through road borders and draw them
        this.borders.forEach(border => {
            ctx.beginPath();
            ctx.moveTo(border[0].x, border[0].y);
            ctx.lineTo(border[1].x, border[1].y);
            ctx.stroke();
        });
    }
}
