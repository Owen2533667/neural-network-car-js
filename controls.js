class Controls {
    // Constructor for the Controls class
    // Parameter: type - the type of controls ("KEYS", "DUMMY")
    constructor(type) {
        // Initialise control flags to false
        this.forward = false;
        this.left = false;
        this.right = false;
        this.reverse = false;

        // Based on the specified control type, set up controls
        switch (type) {
            case "KEYS":
                // If control type is "KEYS", add keyboard event listeners
                this.#addKeyboardListeners();
                break;
            case "DUMMY":
                // If control type is "DUMMY", set the forward control to true
                this.forward = true;
                break;
        }
    }

    // Private method to add keyboard event listeners
    #addKeyboardListeners() {
        // Add keydown event listener to respond to key presses
        document.onkeydown = (event) => {
            switch (event.key) {
                case "ArrowLeft":
                    this.left = true;
                    break;
                case "ArrowRight":
                    this.right = true;
                    break;
                case "ArrowUp":
                    this.forward = true;
                    break;
                case "ArrowDown":
                    this.reverse = true;
                    break;
            }
        };

        // Add keyup event listener to respond to key releases
        document.onkeyup = (event) => {
            switch (event.key) {
                case "ArrowLeft":
                    this.left = false;
                    break;
                case "ArrowRight":
                    this.right = false;
                    break;
                case "ArrowUp":
                    this.forward = false;
                    break;
                case "ArrowDown":
                    this.reverse = false;
                    break;
            }
        };
    }
}
