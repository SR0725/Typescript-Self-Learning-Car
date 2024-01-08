import uuid from "@/utils/uuid";

export interface WallCore {
  id: string;
  start: [number, number];
  end: [number, number];
}

export function createWallCore(
  start: [number, number],
  end: [number, number]
): WallCore {
  return {
    id: uuid(),
    start,
    end,
  };
}
