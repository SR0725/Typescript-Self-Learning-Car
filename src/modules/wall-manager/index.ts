import uuid from "@/utils/uuid";
import { CarCore, View } from "../car/core";
import { WallCore } from "../wall/core";

export interface WallManager {
  walls: WallCore[];
  generateWalls: () => void;
  getCarView: (car: CarCore) => View;
  getWalls: () => WallCore[];
  isCarHitWall: (car: CarCore) => boolean;
}

const DEFAULT_WALLS: {
  start: [number, number];
  end: [number, number];
}[] = [
  { start: [73, 25], end: [6, 90] },
  { start: [46, 26], end: [349, 55] },
  { start: [195, 24], end: [160, 135] },
  { start: [9, 53], end: [17, 325] },
  { start: [304, 143], end: [111, 284] },
  { start: [116, 258], end: [122, 385] },
  { start: [12, 296], end: [65, 539] },
  { start: [108, 354], end: [172, 462] },
  { start: [326, 23], end: [454, 187] },
  { start: [429, 164], end: [616, 226] },
  { start: [368, 190], end: [455, 454] },
  { start: [470, 269], end: [534, 487] },
  { start: [465, 279], end: [709, 334] },
  { start: [601, 226], end: [918, 120] },
  { start: [746, 260], end: [1022, 177] },
  { start: [752, 242], end: [945, 369] },
  { start: [709, 314], end: [696, 360] },
  { start: [156, 448], end: [463, 446] },
  { start: [72, 505], end: [41, 662] },
  { start: [29, 639], end: [142, 667] },
  { start: [117, 686], end: [692, 778] },
  { start: [125, 649], end: [127, 691] },
  { start: [900, 132], end: [989, 50] },
  { start: [960, 45], end: [1271, 69] },
  { start: [1012, 208], end: [1035, 130] },
  { start: [1014, 128], end: [1185, 145] },
  { start: [1258, 24], end: [1398, 842] },
  { start: [1174, 106], end: [1236, 553] },
  { start: [233, 531], end: [209, 610] },
  { start: [224, 539], end: [456, 542] },
  { start: [427, 521], end: [477, 670] },
  { start: [183, 588], end: [526, 659] },
  { start: [558, 543], end: [631, 726] },
  { start: [513, 461], end: [740, 483] },
  { start: [694, 341], end: [762, 467] },
  { start: [768, 446], end: [729, 487] },
  { start: [567, 549], end: [801, 567] },
  { start: [587, 544], end: [557, 559] },
  { start: [786, 554], end: [823, 600] },
  { start: [824, 574], end: [790, 727] },
  { start: [623, 704], end: [805, 712] },
  { start: [908, 435], end: [872, 470] },
  { start: [900, 437], end: [1071, 544] },
  { start: [913, 369], end: [1084, 363] },
  { start: [1062, 333], end: [1250, 559] },
  { start: [1013, 447], end: [1029, 419] },
  { start: [1014, 418], end: [1091, 437] },
  { start: [1072, 411], end: [1095, 474] },
  { start: [994, 438], end: [1117, 480] },
  { start: [858, 443], end: [1012, 671] },
  { start: [1074, 518], end: [989, 661] },
  { start: [890, 676], end: [872, 730] },
  { start: [864, 687], end: [937, 683] },
  { start: [915, 659], end: [946, 771] },
  { start: [857, 734], end: [992, 763] },
  { start: [673, 749], end: [732, 903] },
  { start: [690, 872], end: [1121, 960] },
  { start: [1428, 791], end: [1325, 902] },
  { start: [1035, 978], end: [1246, 912] },
  { start: [1219, 895], end: [1339, 1006] },
  { start: [1331, 866], end: [1503, 1066] },
  { start: [1448, 1061], end: [1461, 1052] },
];

const generateWalls = (wallManager: WallManager) => () => {
  const walls: WallCore[] = [];

  DEFAULT_WALLS.forEach((wall) => {
    const wallCore: WallCore = {
      id: uuid(),
      start: wall.start,
      end: wall.end,
    };
    walls.push(wallCore);
  });

  wallManager.walls = walls;
  return walls;
};

const getCarView =
  (wallManager: WallManager) =>
  (car: CarCore): View => {
    const walls = wallManager.getWalls();
    const direction = car.direction;
    const carX = car.x;
    const carY = car.y;

    // 取得車子正左方、左前方、前方、右前方、正右方、右後方、後方、左後方的向量
    const directorVectors = [
      [Math.cos(direction + Math.PI / 2), Math.sin(direction + Math.PI / 2)],
      [Math.cos(direction + Math.PI / 4), Math.sin(direction + Math.PI / 4)],
      [Math.cos(direction), Math.sin(direction)],
      [Math.cos(direction - Math.PI / 4), Math.sin(direction - Math.PI / 4)],
      [Math.cos(direction - Math.PI / 2), Math.sin(direction - Math.PI / 2)],
    ];

    const view: View = directorVectors.map((vector, vi) => {
      const [vectorX, vectorY] = vector;
      let minDistance = 99999;

      walls.forEach((wall, wi) => {
        // 計算線段方向
        const lineDir = [
          wall.end[0] - wall.start[0],
          wall.end[1] - wall.start[1],
        ];

        // 計算方向向量和線段方向的叉積
        const crossProduct = vectorX * lineDir[1] - vectorY * lineDir[0];
        if (crossProduct === 0) {
          // 如果叉積為0，表示方向向量和線段平行或共線
          return null;
        }

        // 計算向量之間的參數 t 和 u，用於找到交點
        const t =
          ((wall.start[0] - carX) * lineDir[1] -
            (wall.start[1] - carY) * lineDir[0]) /
          crossProduct;
        const u =
          ((wall.start[0] - carX) * vectorY -
            (wall.start[1] - carY) * vectorX) /
          crossProduct;

        // 檢查交點是否在線段上
        if (u < 0 || u > 1) {
          return null;
        }

        // 計算交點並返回距離
        const distance = Math.sqrt(
          t * t * (vectorX * vectorX + vectorY * vectorY)
        );

        if (distance < minDistance) {
          minDistance = distance;
        }
      });

      return minDistance;
    }) as View;

    return view;
  };

const isCarHitWall = (wallManager: WallManager) => (car: CarCore) => {
  const walls = wallManager.getWalls();
  const carX = car.x;
  const carY = car.y;

  const isHit = walls.some((wall) => {
    // 只要點距離線的最小距離小於 12 就視為撞牆
    const minDistance = 12;

    // 計算線段方向
    const lineDir = [wall.end[0] - wall.start[0], wall.end[1] - wall.start[1]];

    // 計算方向向量和線段方向的叉積
    const pointDir = [carX - wall.start[0], carY - wall.start[1]];

    const dot = lineDir[0] * pointDir[0] + lineDir[1] * pointDir[1];

    const lineLenSq = lineDir[0] * lineDir[0] + lineDir[1] * lineDir[1];

    const param = lineLenSq !== 0 ? dot / lineLenSq : -1;

    let nearestX, nearestY;

    if (param < 0) {
      nearestX = wall.start[0];
      nearestY = wall.start[1];
    } else if (param > 1) {
      nearestX = wall.end[0];
      nearestY = wall.end[1];
    } else {
      nearestX = wall.start[0] + param * lineDir[0];
      nearestY = wall.start[1] + param * lineDir[1];
    }

    const dx = carX - nearestX;
    const dy = carY - nearestY;

    const distance = Math.sqrt(dx * dx + dy * dy);

    return distance < minDistance;
  });

  return isHit;
};

export function createWallManager(): WallManager {
  const wallManager: WallManager = {
    walls: [],
    generateWalls: () => generateWalls(wallManager)(),
    getCarView: (car) => getCarView(wallManager)(car),
    getWalls: () => [...wallManager.walls],
    isCarHitWall: (car) => isCarHitWall(wallManager)(car),
  };

  return wallManager;
}
