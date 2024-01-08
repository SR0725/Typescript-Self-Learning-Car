import { Cabin_Sketch } from "next/font/google";
import { CarCore, View, Weights, createCarCore } from "../car/core";
const target = [1448, 1061];

export interface CarManager {
  cars: CarCore[];
  bestWeights: Weights | null;
  secondBestWeights: Weights | null;
  bestScore: number;
  carsCount: number;
  setCarsCount: (count: number) => void;
  getCars: () => CarCore[];
  setBestWeights: (weights: Weights) => void;
  setSecondBestWeights: (weights: Weights) => void;
  setBestScore: (score: number) => void;
  getBestWeights: () => Weights | null;
  getBestScore: () => number;
  generateRandomCars: () => void;
  generateCarsWithWeightsBias: (weights: Weights) => void;
  nextTick: (
    getCarView: (car: CarCore) => View,
    isCarHitWall: (car: CarCore) => boolean
  ) => void;
  nextGeneration: () => void;
  someCarAlive: () => boolean;
  getBestCar: (filter?: (car: CarCore) => boolean) => CarCore;
}

function handleCarGeneration(carManager: CarManager) {
  if (carManager.bestWeights)
    carManager.generateCarsWithWeightsBias(carManager.bestWeights);
  else carManager.generateRandomCars();
}

function getBiasWeights(
  weights: Weights,
  learningRate: number,
  instableRate = 0.5
) {
  const newWeights = { ...weights };

  const getRandomBias = (rate = 1) => (0.5 - Math.random()) * 2 * rate;

  const isMutation = () => Math.random() > instableRate;

  for (const layer in newWeights) {
    const layerWeight = newWeights[layer];
    const newLayerWeight = { ...layerWeight };
    const newWeight = [...newLayerWeight.weight].map((neuronWeight) => {
      return [...neuronWeight].map((w) =>
        isMutation() ? w + getRandomBias(learningRate) : w
      );
    });

    const bias = newWeight.map(() => 1);
    newWeight.push(bias);
    newLayerWeight.weight = newWeight;

    newWeights[layer] = newLayerWeight;
  }

  return newWeights;
}

function getHybridGene(weights1: Weights, weights2: Weights) {
  const newWeights = { ...weights1 };

  const isMutation = () => Math.random() > 0.5;
  try {
    for (const layer in newWeights) {
      const layerWeight = newWeights[layer];
      const newLayerWeight = { ...layerWeight };
      const newWeight = [...newLayerWeight.weight].map((neuronWeight, i) => {
        return [...neuronWeight].map((w, j) =>
          isMutation() ? weights2[layer].weight[i][j] : w
        );
      });

      const bias = newWeight.map(() => 1);
      newWeight.push(bias);
      newLayerWeight.weight = newWeight;

      newWeights[layer] = newLayerWeight;
    }
  } catch (e) {
    console.log(e);
    console.log(weights1, weights2);
  }

  return newWeights;
}

export function creareCarManager() {
  const carManager: CarManager = {
    cars: [],
    bestWeights: null,
    secondBestWeights: null,
    bestScore: 0,
    carsCount: 0,
    setCarsCount: (count: number) => {
      carManager.carsCount = count;
    },
    getCars: () => {
      return [...carManager.cars];
    },
    setBestWeights: (weights: Weights) => {
      carManager.bestWeights = { ...weights };
    },
    setSecondBestWeights: (weights: Weights) => {
      carManager.secondBestWeights = { ...weights };
    },
    setBestScore: (score: number) => {
      carManager.bestScore = score;
    },
    getBestWeights: () => {
      return carManager.bestWeights;
    },
    getBestScore: () => {
      return carManager.bestScore;
    },
    generateRandomCars: () => {
      if (carManager.carsCount === 0) return;
      const cars = [...Array(carManager.carsCount)].map(() => {
        return createCarCore();
      });
      carManager.cars = cars;
    },
    generateCarsWithWeightsBias: (weights: Weights) => {
      if (carManager.carsCount === 0) return;

      const learningRate =
        carManager.bestScore > 720
          ? 0.0001
          : carManager.bestScore > 480
          ? 0.001
          : carManager.bestScore > 256
          ? 0.01
          : carManager.bestScore > 128
          ? 0.05
          : 0.1;

      const geneInstability =
        carManager.bestScore > 1080
          ? 0.05
          : carManager.bestScore > 720
          ? 0.1
          : carManager.bestScore > 480
          ? 0.3
          : carManager.bestScore > 256
          ? 0.5
          : carManager.bestScore > 128
          ? 0.7
          : 1.0;

      const biasCars = [
        ...Array(Math.floor((carManager.carsCount * 1) / 4)),
      ].map(() => {
        return createCarCore(
          getBiasWeights(weights, learningRate, geneInstability)
        );
      });

      const hybridCars = [
        ...Array(Math.floor((carManager.carsCount * 2) / 4)),
      ].map(() => {
        if (!carManager.secondBestWeights) {
          return createCarCore(
            getBiasWeights(weights, learningRate, geneInstability)
          );
        }
        return createCarCore(
          getHybridGene(weights, carManager.secondBestWeights)
        );
      });

      const randomCars = [
        ...Array(
          carManager.carsCount - hybridCars.length - biasCars.length - 1
        ),
      ].map(() => {
        return createCarCore();
      });

      const cars = [...biasCars, ...hybridCars, ...randomCars];
      cars.push(createCarCore(weights));
      carManager.cars = cars;
    },
    nextTick: (getCarView, isCarHitWall) => {
      carManager.cars.forEach((car) => {
        const view = getCarView(car);
        const isDied = car.isDied || isCarHitWall(car);
        if (isDied) {
          car.isDied = true;
          return;
        }
        car.next(view);
      });
    },
    nextGeneration: () => {
      [handleCarGeneration].forEach((handle) => handle(carManager));
    },
    someCarAlive: () => {
      return carManager.cars.some((car) => !car.isDied);
    },
    getBestCar: (filter) => {
      const cars = carManager.cars.filter(filter || (() => true));

      const distances = cars.map((car) => {
        const x = car.x - 100;
        const y = car.y - 100;
        return Math.sqrt(x * x + y * y);
      });

      const minDistance = Math.max(...distances);
      const minIndex = distances.findIndex((d) => d === minDistance);
      return cars[minIndex];
    },
  };

  return carManager;
}
