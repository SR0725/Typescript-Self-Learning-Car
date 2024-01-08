import { useEffect, useState } from "react";
import { useCanvasStore } from "../canvas";
import useFrame from "@/hooks/useFrame";

export function WallDesigner() {
  const [walls, setWalls] = useState<
    {
      start: [number, number];
      end: [number, number];
    }[]
  >([]);
  const [drawingWall, setDrawingWall] = useState<{
    start: [number, number];
    end: [number, number];
  } | null>(null);

  useEffect(() => {
    const { canvas } = useCanvasStore.getState();
    if (!canvas) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setDrawingWall({
        start: [x, y],
        end: [x, y],
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!drawingWall) return;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setDrawingWall({
        start: drawingWall.start,
        end: [x, y],
      });
    };

    const handleMouseUp = () => {
      if (!drawingWall) return;
      setWalls((prev) =>
        [...prev, drawingWall].filter(
          (wall) =>
            wall.start[0] !== wall.end[0] && wall.start[1] !== wall.end[1]
        )
      );
      setDrawingWall(null);
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
    };
  }, [drawingWall]);

  useFrame(({ ctx }) => {
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = "#fff";
    walls.forEach((wall) => {
      ctx.moveTo(...wall.start);
      ctx.lineTo(...wall.end);
    });
    if (drawingWall) {
      ctx.moveTo(...drawingWall.start);
      ctx.lineTo(...drawingWall.end);
    }
    ctx.stroke();
    ctx.restore();
  }, []);

  return (
    <button
      onClick={() => {
        window.navigator.clipboard.writeText(JSON.stringify(walls));
      }}
    >
      Copy
    </button>
  );
}
