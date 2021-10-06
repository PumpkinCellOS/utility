class TlfPlot
{
    // mapFunction: function(number): number, the function 
    // config: {
    //   mode: string, the plot mode (currently supported: 'line')
    //   xRange: Array[2], the X axis range of plot (e.g. [0, 100])
    //   yRange: Array[2], the Y axis range of plot (e.g. [0, 100])
    //   step: number, the distance between individual points
    //   xLabelStep: number, the distance between labels on X axis in pixels
    //   yLabelStep: number, the distance between labels on Y axis in pixels
    //   xAxisDst: number, the distance of X axis from left border
    //   yAxisDst: number, the distance of Y axis from bottom border
    // }
    constructor(mapFunction, config = {})
    {
        this.config = config;
        // DEFAULTS
        this.config.xRange =     this.config.xRange ?? [0, 1];
        this.config.yRange =     this.config.yRange ?? [0, 1];
        this.config.step =       this.config.step ?? 1;
        this.config.xLabelStep = this.config.xLabelStep ?? 40;
        this.config.yLabelStep = this.config.yLabelStep ?? 20;
        this.config.xAxisDst =   this.config.xAxisDst ?? 15;
        this.config.yAxisDst =   this.config.yAxisDst ?? 30;
        this.mapFunction = mapFunction;
        this.pan = [0, 0];
    }

    map(coord, in_, out)
    {
        const in_min = in_[0];
        const in_max = in_[1];
        const out_min = out[0];
        const out_max = out[1];
        return (coord - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    }

    mapCoords(coords, outArea)
    {
        // Invert Y axis
        return [this.map(coords[0], this.config.xRange, [this.pan[0] + this.config.yAxisDst, this.pan[0] + outArea[0]]),
                this.map(coords[1], this.config.yRange, [this.pan[1] + outArea[1] - this.config.xAxisDst, this.pan[1]])];
    }

    mapPixels(pixels, inArea)
    {
        // Invert Y axis
        return [this.map(pixels[0], [this.pan[0] + this.config.yAxisDst, this.pan[0] + inArea[0]], this.config.xRange),
                this.map(pixels[1], [this.pan[1] + inArea[1] - this.config.xAxisDst, this.pan[1]], this.config.yRange)];
    }

    moveToMapped(context, size, x, y)
    {
        const coord = this.mapCoords([x, y], size);
        console.log(coord);
        context.moveTo(coord[0], coord[1]);
    }

    lineToMapped(context, size, x, y)
    {
        const coord = this.mapCoords([x, y], size);
        console.log(coord);
        context.lineTo(coord[0], coord[1]);
    }

    drawInto(canvas)
    {
        this.doDrawInto(canvas);
        // TODO: events
        canvas.addEventListener("mousedown", ()=> {
            console.log("DRAGGING=true");
            this.dragging = true;
        });
        canvas.addEventListener("mousemove", (ev)=> {
            if(this.dragging)
            {
                this.pan[0] += ev.movementX;
                this.pan[1] += ev.movementY;
                this.doDrawInto(canvas);
            }
        });
        canvas.addEventListener("mouseup", ()=> {
            console.log("DRAGGING=false");
            this.dragging = false;
        });
        canvas.addEventListener("mouseleave", ()=> {
            console.log("DRAGGING=false");
            this.dragging = false;
        });
    }

    doDrawInto(canvas)
    {
        const size = [canvas.width, canvas.height];

        let context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Axises
        context.beginPath();
        context.moveTo(this.config.yAxisDst, canvas.height);
        context.lineTo(this.config.yAxisDst, 0);
        context.moveTo(0, canvas.height - this.config.xAxisDst);
        context.lineTo(canvas.width, canvas.height - this.config.xAxisDst);
        context.closePath();
        context.stroke();

        // TODO: Make precision configurable
        // Axis labels X
        for(let i = this.config.yAxisDst + this.config.xLabelStep; i < canvas.width; i += this.config.xLabelStep)
        {
            context.moveTo(i, canvas.height - this.config.xAxisDst - 5);
            context.lineTo(i, canvas.height - this.config.xAxisDst + 5);
            const x = Number(this.mapPixels([i, 0], size)[0], 2).toFixed(2);
            context.fillText(x, i - 15, canvas.height);
        }
        context.stroke();

        // Axis labels Y
        for(let i = this.config.xAxisDst + this.config.yLabelStep; i < canvas.height; i += this.config.yLabelStep)
        {
            context.moveTo(this.config.yAxisDst - 5, i);
            context.lineTo(this.config.yAxisDst + 5, i);
            const y = Number(this.mapPixels([0, i], size)[1], 2).toFixed(2);
            context.fillText(y, this.config.yAxisDst - 30, i + 5);
        }
        context.stroke();

        // Data
        let first = true;
        const mapStart = this.mapPixels([this.config.yAxisDst, 0], size);
        const mapEnd = this.mapPixels([canvas.width, 0], size);
        for(let i = mapStart[0]; i < mapEnd[0]; i += this.config.step)
        {
            if(first)
            {
                this.moveToMapped(context, size, i, this.mapFunction(i));
                first = false;
            }
            else
                this.lineToMapped(context, size, i, this.mapFunction(i));
        }
        context.stroke();
    }
}

window.TlfPlot = TlfPlot;
