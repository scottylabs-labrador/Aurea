
export function drawLineRight(canvas: HTMLCanvasElement){
    const ctx = canvas.getContext("2d")
    if (ctx){
        ctx.strokeStyle = "black";
        ctx.lineWidth = 10;

  // Example: horizontal line in the middle
        ctx.beginPath();
        ctx.moveTo(0 + 50, 0);
        ctx.lineTo(0 + 50, canvas.height);
        ctx.stroke();
    }
    else{
        return;
    }
    
}