"use client";
import useFrame from "@/hooks/useFrame";
import { View } from "../core";

export interface CarViewProps {
  x: number;
  y: number;
  direction: number;
  view: View;
  color: string;
  isDied?: boolean;
}

export default function CanvasCar({
  x,
  y,
  direction,
  view,
  isDied,
  color,
}: CarViewProps) {
  // 繪製車子本體
  useFrame(
    ({ ctx }) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(direction);
      ctx.fillStyle = isDied ? "gray" : color;
      ctx.fillRect(-10, -10, 20, 20);
      ctx.restore();
    },
    [x, y, direction]
  );

  //繪製車子的感測器
  useFrame(
    ({ ctx }) => {
      if (isDied) return;
      if (color !== "white") return;
      const directorVectors = [
        [Math.cos(direction + Math.PI / 2), Math.sin(direction + Math.PI / 2)],
        [Math.cos(direction + Math.PI / 4), Math.sin(direction + Math.PI / 4)],
        [Math.cos(direction), Math.sin(direction)],
        [Math.cos(direction - Math.PI / 4), Math.sin(direction - Math.PI / 4)],
        [Math.cos(direction - Math.PI / 2), Math.sin(direction - Math.PI / 2)],
      ];

      directorVectors.forEach(([dx, dy], index) => {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - dx * view[index], y - dy * view[index]);
        ctx.strokeStyle = "green";
        ctx.stroke();
      });
    },
    [x, y, direction, view, color, isDied]
  );

  return null;
}
