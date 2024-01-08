import useFrame from "@/hooks/useFrame";

export default function Line() {
  useFrame(({ ctx }) => {
    // 以 100 100 為中心繪製一個 256 的圓形
    ctx.beginPath();
    ctx.arc(100, 100, 256, 0, Math.PI * 2);
    ctx.strokeStyle = "#444";
    ctx.stroke();

    // 以 100 100 為中心繪製一個 720 的圓形
    ctx.beginPath();
    ctx.arc(100, 100, 720, 0, Math.PI * 2);
    ctx.strokeStyle = "#444";
    ctx.stroke();
  }, []);

  return null;
}