class NeuralNetwork {
    // Constructor for the NeuralNetwork class
    // Parameter: neuronCounts - an array specifying the number of neurons in each layer
    constructor(neuronCounts) {
        // Initialise levels based on the specified neuron counts
        this.levels = [];
        for (let i = 0; i < neuronCounts.length - 1; i++) {
            this.levels.push(new Level(neuronCounts[i], neuronCounts[i + 1]));
        }
    }

    // Static method to perform feedforward propagation through the neural network
    // Parameters: givenInputs - input values, network - the neural network
    static feedForward(givenInputs, network) {
        // Perform feedforward for each level in the network
        let outputs = Level.feedForward(givenInputs, network.levels[0]);
        for (let i = 1; i < network.levels.length; i++) {
            outputs = Level.feedForward(outputs, network.levels[i]);
        }
        return outputs;
    }

    // Static method to mutate the weights and biases of a neural network
    // Parameters: network - the neural network, amount - the amount of mutation (default is 1)
    static mutate(network, amount = 1) {
        // Mutate biases and weights for each level in the network
        network.levels.forEach((level) => {
            for (let i = 0; i < level.biases.length; i++) {
                level.biases[i] = lerp(level.biases[i], Math.random() * 2 - 1, amount);
            }
            for (let i = 0; i < level.weights.length; i++) {
                for (let j = 0; j < level.weights[i].length; j++) {
                    level.weights[i][j] = lerp(
                        level.weights[i][j],
                        Math.random() * 2 - 1,
                        amount
                    );
                }
            }
        });
    }
}

class Level {
    // Constructor for the Level class
    // Parameters: inputCount - number of input neurons, outputCount - number of output neurons
    constructor(inputCount, outputCount) {
        // Initialise arrays for inputs, outputs, and biases
        this.inputs = new Array(inputCount);
        this.outputs = new Array(outputCount);
        this.biases = new Array(outputCount);

        // Initialise a 2D array for weights
        this.weights = [];
        for (let i = 0; i < inputCount; i++) {
            this.weights[i] = new Array(outputCount);
        }

        // Randomise weights and biases for the level
        Level.#randomize(this);
    }

    // Static private method to randomize weights and biases for a level
    static #randomize(level) {
        for (let i = 0; i < level.inputs.length; i++) {
            for (let j = 0; j < level.outputs.length; j++) {
                level.weights[i][j] = Math.random() * 2 - 1;
            }
        }

        for (let i = 0; i < level.biases.length; i++) {
            level.biases[i] = Math.random() * 2 - 1;
        }
    }

    // Static method to perform feedforward propagation through a level
    // Parameters: givenInputs - input values, level - the level
    static feedForward(givenInputs, level) {
        // Copy given inputs to the level's inputs
        for (let i = 0; i < level.inputs.length; i++) {
            level.inputs[i] = givenInputs[i];
        }

        // Calculate outputs based on inputs, weights, and biases
        for (let i = 0; i < level.outputs.length; i++) {
            let sum = 0;
            for (let j = 0; j < level.inputs.length; j++) {
                sum += level.inputs[j] * level.weights[j][i];
            }

            // If the sum is greater than the bias, set output to 1; otherwise, set it to 0
            if (sum > level.biases[i]) {
                level.outputs[i] = 1;
            } else {
                level.outputs[i] = 0;
            }
        }

        return level.outputs;
    }
}
