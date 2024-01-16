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
const N = 200; // Number of AI cars (change to add more or less ai cars)
const numCars = 200; // Total number of traffic cars (change to add more or less traffic cars)
const carWidth = 30;
const carHeight = 50;
const carSpeed = 2; // Speed of the traffic cars

// Initialise an array to hold traffic cars
const traffic = [];

// Generate AI cars
const cars = generateCars(N);
let bestCar = cars[0];

// Current best trained values
let bestBrain = {"levels":[{"inputs":[0.5092933631844418,0.44660591506270286,0,0,0.17552444634336573],"outputs":[0,1,0,0,1,0],"biases":[0.03159073004203495,-0.06026699872473279,0.01054896346690918,0.11173677895213184,-0.026674977331308695,-0.092009479264685],"weights":[[-0.13673174938237403,0.12145798312618827,-0.020740585890485143,-0.07007487924899397,0.11892750177110202,-0.06332148403607543],[-0.04371316367185888,0.28604559698817805,0.09249182143960578,-0.05377102070590145,-0.033709621060445415,-0.19450352798640752],[0.07496501775678746,-0.10540829222129353,-0.06872275795555244,-0.09258384955528466,0.15371553700653512,-0.14563225155880197],[0.05429462774212245,0.2466971532100913,0.14960364025340406,0.08619325052191495,-0.0451892063667233,0.22980129147519932],[0.2063983186801709,-0.035872193679046135,-0.1557718668145082,0.2323697508994061,-0.09527764010557718,-0.012559848877462552]]},{"inputs":[0,1,0,0,1,0],"outputs":[1,0,1,1],"biases":[-0.17738162541238994,0.2064112842001497,-0.10690318806519374,0.13154836645422557],"weights":[[-0.02555511371268191,0.14083247274587143,-0.21470272422476644,-0.10492874459517024],[0.12982691587883524,-0.10158804870666586,0.0625383662971383,0.28168938374195784],[-0.014787694572152128,-0.07912032385791733,0.08998242514585365,0.04047992316833022],[0.023463781461394988,0.23747644408882274,-0.2598093126400415,-0.02576071247367608],[-0.12980505248404672,0.2695903353026547,0.0640320985550441,-0.11024759284734244],[0.12874959813773434,0.11070386903269978,-0.12754779215018996,-0.19094332512608225]]}]}


// Function to save the best car's brain to local storage
function save() {
    localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain));
}

// Function to save const bestBrain, values of an already trained brain, to ensure that best car is best
// saves time trying to train brain if it has been removed from local storage.
function best() {
    localStorage.setItem("bestBrain", JSON.stringify(bestBrain));
}

// Load the best brain from local storage if available
if (localStorage.getItem("bestBrain")) {
    for (let i = 0; i < cars.length; i++) {
        cars[i].brain = JSON.parse(localStorage.getItem("bestBrain"));
        if (i != 0) {
            NeuralNetwork.mutate(cars[i].brain, 0.02); // Update the value of mutation amount (changes to a value 0...3 the smaller the value the less mutation between ai cars)
        }
    }
}

// Function to discard the saved best car's brain from local storage
function discard() {
    localStorage.removeItem("bestBrain");
}

/*
    Download the current brain value from the best car
*/
async function download() {
    // const bestBrainBlob = new Blob([JSON.stringify(bestCar.brain)], { type: 'application/json' });
    // const a = document.createElement('a');
    // a.href = URL.createObjectURL(bestBrainBlob);
    // a.download = 'bestBrain.json';
    // a.click();
    try {
        const fileHandle = await window.showSaveFilePicker();
        const writableStream = await fileHandle.createWritable();
        await writableStream.write(JSON.stringify(bestCar.brain));
        await writableStream.close();
    } catch (err) {
        console.error('Error saving file:', err);
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
