import useFrame from "@/hooks/useFrame";

export interface WallViewProps {
  start: [number, number];
  end: [number, number];
  index: number;
}

export default function WallView(props: WallViewProps) {
  useFrame(({ ctx }) => {
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = "#aaa";
    ctx.lineWidth = 4;
    ctx.moveTo(...props.start);
    ctx.lineTo(...props.end);
    ctx.stroke();
    ctx.restore();
    ctx.closePath();

    // draw text index
    // ctx.save();

    // ctx.fillStyle = "#fff";
    // ctx.font = "16px serif";
    // ctx.fillText(
    //   `${props.index}`,
    //   (props.start[0] + props.end[0]) / 2,
    //   (props.start[1] + props.end[1]) / 2
    // );
    // ctx.restore();
  }, []);

  return null;
}
