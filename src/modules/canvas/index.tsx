"use client";
import { useEffect, useRef } from "react";
import { create } from "zustand";

export interface RenderProps {
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
}

type RequestFrameCallback = (data: RenderProps) => void;

interface CanvasStore {
  canvas: HTMLCanvasElement | null;
  ctx: CanvasRenderingContext2D | null;
  requestFrameList: { fn: RequestFrameCallback; id: string }[];
  addRequestFrame: (callback: RequestFrameCallback, id: string) => void;
  removeRequestFrame: (callback: RequestFrameCallback, id: string) => void;
}

export const useCanvasStore = create<CanvasStore>((set) => ({
  canvas: null,
  ctx: null,
  requestFrameList: [],
  addRequestFrame: (callback, id) =>
    set((state) => ({
      requestFrameList: [...state.requestFrameList, { fn: callback, id }],
    })),

  removeRequestFrame: (callback, id) =>
    set((state) => ({
      requestFrameList: state.requestFrameList.filter((item) => item.id !== id),
    })),
}));

export default function Canvas({ children }: { children: React.ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (!window) return;

    const resize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
    };

    resize();

    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
    };
  }, []);

  useEffect(() => {
    useCanvasStore.setState({
      canvas: canvasRef.current,
      ctx: canvasRef.current?.getContext("2d"),
    });
  }, []);

  useEffect(() => {
    const render = () => {
      const { canvas, ctx, requestFrameList } = useCanvasStore.getState();

      if (!canvas) return;
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      requestFrameList.forEach((cb) => {
        ctx.save();
        cb.fn({ ctx, canvas });
        ctx.restore();
      });

      window.requestAnimationFrame(render);
    };

    render();
  }, []);

  return (
    <canvas className="w-full h-full" ref={canvasRef}>
      {children}
    </canvas>
  );
}
