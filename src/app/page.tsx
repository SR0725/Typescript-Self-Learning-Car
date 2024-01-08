"use client";
import Canvas from "@/modules/canvas";
import { CarManager, creareCarManager } from "@/modules/car-manager";
import { CarCore, Weights } from "@/modules/car/core";
import Car from "@/modules/car/view";
import Line from "@/modules/line";
import { WallDesigner } from "@/modules/wall-desinger";
import { WallManager, createWallManager } from "@/modules/wall-manager";
import { WallCore } from "@/modules/wall/core";
import Wall from "@/modules/wall/view";
import { useEffect, useRef, useState } from "react";

const DEFAULT_CAR_COUNT = 1024;

export default function Sence() {
  const carManager = useRef<CarManager>(creareCarManager());
  const wallManager = useRef<WallManager>(createWallManager());
  const [cars, setCars] = useState<CarCore[]>([]);
  const [bestWeights, setBestWeights] = useState<Weights | null>();
  const [walls, setWalls] = useState<WallCore[]>([]);
  const [generation, setGeneration] = useState(0);
  const [time, setTime] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [historyBestScore, setHistoryBestScore] = useState(0);
  const [isShowBestCar, setIsShowBestCar] = useState(false);
  const [geneEvolutionTimes, setGeneEvolutionTimes] = useState(0);

  useEffect(() => {
    carManager.current.setCarsCount(DEFAULT_CAR_COUNT);
    carManager.current.generateRandomCars();
    wallManager.current.generateWalls();
    setWalls(wallManager.current.getWalls());
  }, []);

  const handleNextGeneration = () => {
    carManager.current.nextGeneration();
    setGeneration((prev) => prev + 1);
    setTime(0);
  };

  useEffect(() => {
    handleNextGeneration();
  }, []);

  useEffect(() => {
    const tick = () => {
      carManager.current.nextTick(
        wallManager.current.getCarView,
        wallManager.current.isCarHitWall
      );

      const liveCars = carManager.current.cars.filter((car) => !car.isDied);

      if (time >= 40) {
        liveCars.forEach((car) => {
          if (!car.isDied) {
            const distanceToBirthPlace = Math.sqrt(
              Math.pow(car.x - 100, 2) + Math.pow(car.y - 100, 2)
            );

            if (distanceToBirthPlace < 128) {
              car.isDied = true;
            }
          }
        });
      }

      if (time >= 80) {
        liveCars.forEach((car) => {
          if (!car.isDied) {
            const distanceToBirthPlace = Math.sqrt(
              Math.pow(car.x - 100, 2) + Math.pow(car.y - 100, 2)
            );

            if (distanceToBirthPlace < 256) {
              car.isDied = true;
            }
          }
        });
      }

      if (time >= 150) {
        liveCars.forEach((car) => {
          if (!car.isDied) {
            const distanceToBirthPlace = Math.sqrt(
              Math.pow(car.x - 100, 2) + Math.pow(car.y - 100, 2)
            );

            if (distanceToBirthPlace < 360) {
              car.isDied = true;
            }
          }
        });
      }

      if (time >= 300) {
        liveCars.forEach((car) => {
          if (!car.isDied) {
            const distanceToBirthPlace = Math.sqrt(
              Math.pow(car.x - 100, 2) + Math.pow(car.y - 100, 2)
            );

            if (distanceToBirthPlace < 720) {
              car.isDied = true;
            }
          }
        });
      }

      const bestCar = carManager.current.getBestCar();

      const distanceToBirthPlace = Math.sqrt(
        Math.pow(bestCar.x - 100, 2) + Math.pow(bestCar.y - 100, 2)
      );

      setBestScore(distanceToBirthPlace);
      if (distanceToBirthPlace > historyBestScore) {
        setHistoryBestScore(distanceToBirthPlace);
        if (distanceToBirthPlace > 128) {
          const secondBestCar = carManager.current.getBestCar(
            (car) => car.id !== bestCar.id
          );
          setGeneEvolutionTimes((prev) => prev + 1);
          carManager.current.setBestWeights(bestCar.weights);
          carManager.current.setSecondBestWeights(secondBestCar.weights);
          carManager.current.setBestScore(distanceToBirthPlace);
          setBestWeights(bestCar.weights);
        }
      }

      carManager.current.cars.forEach((car) => {
        car.color = "red";
      });
      bestCar.color = "white";

      if (!carManager.current.someCarAlive() || time > 600) {
        handleNextGeneration();
      } else {
        setCars(carManager.current.getCars());
        setTime((prev) => prev + 1);
      }
    };

    const interval = setInterval(tick, 1);

    return () => {
      clearInterval(interval);
    };
  }, [time]);

  return (
    <>
      <main className="w-screen h-screen relative">
        <div className="z-20 fixed top-0 right-0 bg-black px-2 py-1 text-white">
          <span>Generation: {generation}</span>
          <span>Time: {time}</span>
          <span>
            Current Best Score:
            {bestScore.toFixed(2)}
          </span>
          <span>Gene Evolution Times: {geneEvolutionTimes}</span>
        </div>
        <div className="z-20 fixed top-8 right-0 bg-black px-2 py-1 text-white">
          <button
            className="px-2 py-1 bg-green-600 text-white"
            onClick={() => setIsShowBestCar((prev) => !prev)}
          >
            {isShowBestCar ? "Show All Cars" : "Show Best Car"}
          </button>
        </div>
        {/* <div className="z-20 fixed bottom-16 right-0 bg-black px-2 py-1 text-white">
          <WallDesigner />
        </div>  */}
        <div className="z-20 fixed top-16 right-0 bg-black px-2 py-1 text-white w-64 overflow-hidden">
          <span>Best Weights: {JSON.stringify(bestWeights)}</span>
        </div>

        <Canvas>
          {isShowBestCar ? (
            <Car {...cars[cars.length - 1]} />
          ) : (
            cars.map((car) => <Car key={car.id} {...car} />)
          )}
          {walls.map((wall, index) => (
            <Wall key={wall.id} {...wall} index={index} />
          ))}
          <Line />
        </Canvas>
      </main>
    </>
  );
}
