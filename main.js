// Get canvas elements and set their widths
const carCanvas = document.getElementById("carCanvas");
carCanvas.width = 200;
const networkCanvas = document.getElementById("networkCanvas");
networkCanvas.width = 300;

// Get 2D rendering contexts for the canvases
const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

// Create a road object with a specified center and width
const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);

// Constants for AI cars and traffic cars
const N = 1; // Number of AI cars
const numCars = 200; // Total number of traffic cars
const carWidth = 30;
const carHeight = 50;
const carSpeed = 2; // Speed of the traffic cars

// Initialise an array to hold traffic cars
const traffic = [];

// Generate AI cars
const cars = generateCars(N);
let bestCar = cars[0];

// Load the best brain from local storage if available
if (localStorage.getItem("bestBrain")) {
    for (let i = 0; i < cars.length; i++) {
        cars[i].brain = JSON.parse(localStorage.getItem("bestBrain"));
        if (i != 0) {
            NeuralNetwork.mutate(cars[i].brain, 0.01); // Update the value of mutation amount
        }
    }
}

// Initialise and populate the traffic array with dummy traffic cars
// Loop to create traffic cars
for (let i = 0; i < numCars; i++) {
    // Calculate the lane index based on the current iteration
    const laneIndex = i % 3;

    // Calculate the initial position of the traffic car along the y-axis
    const position = -200 * i;
    
    // Generate a random color for the traffic car
    const color = getRandomColor();

    // Create a new traffic car with "DUMMY" control type and specified attributes
    const car = new Car(road.getLaneCenter(laneIndex), position, carWidth, carHeight, "DUMMY", carSpeed, color);
    
    // Add the newly created traffic car to the 'traffic' array
    traffic.push(car);

    // Generate another lane index different from the current one
    let otherLaneIndex;
    do {
        otherLaneIndex = Math.floor(Math.random() * 3);
    } while (otherLaneIndex === laneIndex);

    // Create another traffic car in a different lane with "DUMMY" control type and random color
    const otherCar = new Car(road.getLaneCenter(otherLaneIndex), position, carWidth, carHeight, "DUMMY", carSpeed, getRandomColor());
    
    // Add the second traffic car to the 'traffic' array
    traffic.push(otherCar);
}


// Animation loop
animate();

// Function to save the best car's brain to local storage
function save() {
    localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain));
}

// Function to discard the saved best car's brain from local storage
function discard() {
    localStorage.removeItem("bestBrain");
}

// Function to generate AI cars
function generateCars(N) {
    const cars = [];
    for (let i = 1; i <= N; i++) {
        cars.push(new Car(road.getLaneCenter(1), 100, 30, 50, "AI", 4));
    }
    return cars;
}

// Animation function
function animate(time) {
    // Update and draw traffic cars
    for (let i = 0; i < traffic.length; i++) {
        traffic[i].update(road.borders, []);
    }

    // Update and draw AI cars
    for (let i = 0; i < cars.length; i++) {
        cars[i].update(road.borders, traffic);
    }

    // Find the best car based on the lowest y-coordinate
    bestCar = cars.find(
        (c) => c.y == Math.min(...cars.map((c) => c.y))
    );

    // Set canvas heights based on window size
    carCanvas.height = window.innerHeight;
    networkCanvas.height = window.innerHeight;

    // Translate the car canvas to focus on the best car
    carCtx.save();
    carCtx.translate(0, -bestCar.y + carCanvas.height * 0.7);

    // Draw road, traffic cars, and AI cars on the car canvas
    road.draw(carCtx);
    for (let i = 0; i < traffic.length; i++) {
        traffic[i].draw(carCtx);
    }
    carCtx.globalAlpha = 0.2;
    for (let i = 0; i < cars.length; i++) {
        cars[i].draw(carCtx);
    }
    carCtx.globalAlpha = 1;
    bestCar.draw(carCtx, false);

    // Restore the car canvas transformation
    carCtx.restore();

    // Adjust line dash offset for the network canvas and draw the neural network
    networkCtx.lineDashOffset = -time / 50;
    Visualizer.drawNetwork(networkCtx, bestCar.brain);

    // Request the next animation frame
    requestAnimationFrame(animate);
}
