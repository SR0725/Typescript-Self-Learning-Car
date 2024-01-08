import uuid from "@/utils/uuid";

export interface Weights {
  [layer: number]: Layer;
}

interface Layer {
  layer: number;
  weight: number[][];
}

export type View = [number, number, number, number, number];

export interface CarCore {
  id: string;
  isDied?: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  view: View;
  color: string;
  direction: number;
  weights: Weights;
  next: (view: View) => CarCore;
}
function relu(x: number) {
  return Math.max(0, x);
}

function calculateForwardNeuralNetworkLayer({
  input,
  weights,
  layer,
}: {
  input: number[];
  weights: Weights;
  layer: number;
}) {
  const layerWeights = weights[layer];

  const nextRawLayer = input.map((inputValue, inputIndex) => {
    const layerWeight = layerWeights.weight[inputIndex];

    const nextLayer = layerWeight.map((weight, weightIndex) => {
      const nextLayerValue = weight * inputValue;
      return nextLayerValue;
    });

    return nextLayer;
  });

  const nextLayer = nextRawLayer[0]
    .map((_, index) => {
      const sum = nextRawLayer.reduce((acc, layer) => {
        return acc + layer[index];
      }, 0);
      return sum;
    })
    .map(relu);

  return nextLayer;
}

function calculateNeuralNetwork({
  input,
  weights,
}: {
  input: number[];
  weights: Weights;
}) {
  const layers = Object.keys(weights).length;

  let nextLayer = input;
  for (let layer = 0; layer < layers; layer++) {
    nextLayer = calculateForwardNeuralNetworkLayer({
      input: nextLayer,
      weights,
      layer,
    });
  }

  return nextLayer;
}

function getRandomWeights(layerSize: number[]) {
  const weights: Weights = {};

  const getRandomWeight = () => (0.5 - Math.random()) * 2;

  for (let i = 0; i < layerSize.length - 1; i++) {
    const layer = i;
    const weight: number[][] = [];
    for (let j = 0; j < layerSize[i]; j++) {
      const neuronWeight: number[] = [];
      for (let k = 0; k < layerSize[i + 1]; k++) {
        neuronWeight.push(getRandomWeight());
      }
      weight.push(neuronWeight);
    }
    weights[layer] = {
      layer,
      weight,
    };
  }

  return weights;
}

function next(carCore: CarCore) {
  const newCarCore = { ...carCore };
  const { weights, view } = carCore;

  const nextLayer = calculateNeuralNetwork({ input: view, weights });

  const direction = nextLayer[0];
  const speed = nextLayer[1];

  newCarCore.direction = direction;
  newCarCore.speed = speed > 10 ? 10 : speed < -10 ? -10 : speed;

  newCarCore.x += Math.cos(newCarCore.direction) * newCarCore.speed;
  newCarCore.y += Math.sin(newCarCore.direction) * newCarCore.speed;

  return newCarCore;
}

export function createCarCore(defaultWeights?: Weights) {
  const weights = defaultWeights
    ? { ...defaultWeights }
    : getRandomWeights([5, 8, 6, 2]);

  const carCore: CarCore = {
    id: uuid(),
    isDied: false,
    x: 100,
    y: 100,
    width: 0,
    height: 0,
    speed: 0,
    view: [0, 0, 0, 0, 0],
    color: "#000",
    direction: 0,
    weights,
    next: (view) => {
      if (carCore.isDied) return carCore;
      const nextCar = next({
        ...carCore,
        view,
      });
      carCore.view = view;
      carCore.x = nextCar.x;
      carCore.y = nextCar.y;
      carCore.direction = nextCar.direction;
      carCore.speed = nextCar.speed;
      return carCore;
    },
  };

  return carCore;
}
