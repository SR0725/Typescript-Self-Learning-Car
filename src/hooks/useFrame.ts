import { useEffect } from "react";
import { RenderProps, useCanvasStore } from "@/modules/canvas";

const useFrame = (fn: (data: RenderProps) => void, deps: any[]) => {
  useEffect(() => {
    const { addRequestFrame, removeRequestFrame } = useCanvasStore.getState();
    const randomId = Math.random().toString(36).substr(2, 9);
    addRequestFrame(fn, randomId);

    return () => {
      return removeRequestFrame(fn, randomId);
    };
  }, [deps]);
};

export default useFrame;
