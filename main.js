const carCanvas=document.getElementById("carCanvas");
// canvas.width = window.innerWidth / 2; // width of canvas set to half window width
carCanvas.width = 200; // width of canvas set to 200px

const networkCanvas = document.getElementById("networkCanvas");
networkCanvas.width = 300;

const carCtx = carCanvas.getContext("2d"); //Contains method to draw content e.g. car, road
const networkCtx = networkCanvas.getContext("2d"); 


const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);
// const car = new Car(road.getLaneCenter(1),100,30,50, "KEYS"); // driving using arrows
// const car = new Car(road.getLaneCenter(1),100,30,50, "AI"); // AI drives

const N = 150;
const cars = generateCars(N);
let bestCar = cars[0];

if(localStorage.getItem("bestBrain")) {
    for(let i = 0; i < cars.length; i++) {
        cars[i].brain = JSON.parse(localStorage.getItem("bestBrain"));
        if(i != 0){
            NeuralNetwork.mutate(cars[i].brain, 0.2);
        }
    }
}

const traffic = [
    new Car(road.getLaneCenter(1), -100, 30, 50, "DUMMY", 2),
    new Car(road.getLaneCenter(0), -300, 30, 50, "DUMMY", 2),
    new Car(road.getLaneCenter(2), -300, 30, 50, "DUMMY", 2),
    new Car(road.getLaneCenter(0), -500, 30, 50, "DUMMY", 2),
    new Car(road.getLaneCenter(1), -500, 30, 50, "DUMMY", 2),
    new Car(road.getLaneCenter(2), -700, 30, 50, "DUMMY", 2),
    new Car(road.getLaneCenter(0), -700, 30, 50, "DUMMY", 2),
    new Car(road.getLaneCenter(1), -900, 30, 50, "DUMMY", 2),
    new Car(road.getLaneCenter(0), -1100, 30, 50, "DUMMY", 2),
    new Car(road.getLaneCenter(2), -1100, 30, 50, "DUMMY", 2)
];

animate();

function save() {
    localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain));
}

function discard() {
    localStorage.removeItem("bestBrain");
}

function generateCars(N) { // serializing best brain in local storage
    const cars = [];
    for(let i = 1; i <= N; i++) {
        cars.push(new Car(road.getLaneCenter(1), 100, 30, 50, "AI"));
    }
    return cars;
}

function animate(time) {
    for(let i = 0; i < traffic.length; i++) {
        traffic[i].update(road.borders, []);
    }

    for(let i = 0; i< cars.length; i++) {
        cars[i].update(road.borders, traffic);
    }

    bestCar = cars.find(c => 
        c.y == Math.min(...cars.map(c => c.y))
        );

    carCanvas.height = window.innerHeight; //height of canvas set to window height
    networkCanvas.height = window.innerHeight; //height of canvas set to window height

    carCtx.save();
    carCtx.translate(0, -bestCar.y + carCanvas.height * 0.7);

    road.draw(carCtx); // draw road in context of canvas

    // draw others cr on road:
    for(let i = 0; i < traffic.length; i++) {
        traffic[i].draw(carCtx, "red");
    }

    carCtx.globalAlpha = 0.2;
    for(let i = 0; i < cars.length; i++) {
        cars[i].draw(carCtx, "blue"); // draw car in context of carCanvas
    }
    carCtx.globalAlpha = 1;
    bestCar.draw(carCtx, "blue", true);

    carCtx.restore();

    networkCtx.lineDashOffset = -time/50;
    Visualizer.drawNetwork(networkCtx, bestCar.brain);

    requestAnimationFrame(animate); // request animate method many time at the second creating illusion of animation
}
