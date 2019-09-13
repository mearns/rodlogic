const TAB_SIZE = 3;
const MARGIN = 1;

class RodArtist {
    constructor(ctx, rodCount) {
        this.ctx = ctx;
        this.rodCount = rodCount;
        this.spacing = 3;
        this.rodThickness = 0.3;
        this.rodLength = this.spacing * rodCount + TAB_SIZE;
        this.cellCount = this.rodLength + MARGIN + MARGIN + 0.5 * MARGIN;
    }

    withScale(scale, cb) {
        const width = this.cellCount;
        const offset = ((scale - 1) * -width) / 2;
        this.ctx.save();
        this.ctx.translate(offset, offset);
        this.ctx.scale(scale, scale);
        cb();
        this.ctx.restore();
    }

    /**
     * Given an orientation and a pair of vector components
     * along the length of the rod and the width of the rod, respectively,
     * returns an array of two values for the X dimension and the Y
     * dimension.
     */
    orientValues(orientation, a, b) {
        if (orientation) {
            return [a, b];
        }
        return [b, a];
    }

    /**
     * Get the starting position (minimum primary and secondary coordinates) of a rod.
     * Returns a two tuple of x and y values.
     *
     * @param {boolean} orientation The orientation: true for horiztonal, false for vertical.
     * @param {number} index The index of the rod.
     * @param {boolean|number} [value=0] The value of the rod. A boolean value true means 1,
     * the rod if pushed fully; a boolean value false means 0. Any other number will offset
     * the rod as a partial push (good for animating).
     */
    getRodPosition(orientation, index, value = 0) {
        return this.orientValues(
            orientation,
            MARGIN + this.valueToOffset(value),
            TAB_SIZE + this.spacing * (index + 1)
        );
    }

    valueToOffset(value) {
        if (value === true) {
            return 1;
        } else if (value === false) {
            return 0;
        }
        return value;
    }

    /**
     * Draw a translucent bar to highlight the current
     * values of a set of rods.
     * @param {boolean} orientation The orientation of the rods
     * in the layer, not of the highlight itself.
     * @param {*} color
     */
    drawValueHighlight(orientation, color) {
        const [x, y] = this.orientValues(
            !orientation,
            TAB_SIZE + this.spacing - 0.5,
            MARGIN + 1 + 0.1
        );
        const NUMBER_OF_VALUE_POSITIONS = 2;
        const POSITION_OF_LAST_VALUE = NUMBER_OF_VALUE_POSITIONS - 1;
        const [w, h] = this.orientValues(
            !orientation,
            this.rodLength -
                TAB_SIZE -
                this.spacing +
                MARGIN +
                POSITION_OF_LAST_VALUE,
            0.8
        );
        this.ctx.save();
        const tc = tinycolor(color).setAlpha(0.75);
        this.ctx.fillStyle = tc.toString();
        this.ctx.strokeStyle = tc.darken(25).toString();
        this.ctx.lineWidth = 0.1;
        ["strokeRect", "fillRect"].forEach(method => {
            this.ctx[method](x, y, w, h);
        });
        this.ctx.restore();
    }

    /**
     * Draw the specified rod, without any gates or blocks.
     * @param {*} orientation
     * @param {number} index
     * @param {string} color
     * @param {number|boolean} value
     */
    drawRod(orientation, index, color, value = 0) {
        const [x, y] = this.getRodPosition(orientation, index, value);
        const rodOffset = (1.0 - this.rodThickness) / 2;
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = tinycolor(color).darken(50);
        this.ctx.lineWidth = 0.1;
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(...this.orientValues(orientation, TAB_SIZE - 1, 0));
        this.ctx.lineTo(
            ...this.orientValues(
                orientation,
                TAB_SIZE - 1 + rodOffset,
                rodOffset
            )
        );
        this.ctx.lineTo(
            ...this.orientValues(orientation, this.rodLength, rodOffset)
        );
        this.ctx.lineTo(
            ...this.orientValues(orientation, this.rodLength, 1 - rodOffset)
        );
        this.ctx.lineTo(
            ...this.orientValues(
                orientation,
                TAB_SIZE - 1 + rodOffset,
                1 - rodOffset
            )
        );
        this.ctx.lineTo(...this.orientValues(orientation, TAB_SIZE - 1, 1));
        this.ctx.lineTo(...this.orientValues(orientation, 0, 1));
        this.ctx.lineTo(0, 0);
        this.ctx.stroke();
        this.ctx.fill();

        this.ctx.fillStyle = tinycolor
            .mostReadable(color, ["white", "black"])
            .toString();
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText("1", 0.5, 0.5, 1);
        this.ctx.fillText("0", ...this.orientValues(orientation, 1.5, 0.5), 1);
        this.ctx.restore();
    }

    /**
     * Draw the blocks/gates for a specific rod.
     * @param {boolean} orientation The orientation of the parent rod
     * @param {number} rodIndex The index of the rod
     * @param {boolean|number} rodValue The value of the rod (e.g., pushed or not)
     * @param {boolean|Array<boolean>|Object} blocks The blocks to draw. A boolean `true`
     * means to draw all the blocks, boolean `false` means to draw none. An array of
     * values indicates which blocks to draw.
     * @param {string} color The color of the host rod.
     */
    drawBlocks(orientation, rodIndex, rodValue, blocks, color) {
        const BLOCK_SIZE = 0.85;
        const LINE_WIDTH = 0.1;
        const OFFSET = (1 - BLOCK_SIZE) / 2;
        if (blocks === false) {
            return;
        }
        this.ctx.save();
        this.ctx.lineWidth = 0.1;
        this.ctx.translate(
            ...this.getRodPosition(orientation, rodIndex, rodValue)
        );
        this.ctx.fillStyle = tinycolor(color).darken(25);
        this.ctx.strokeStyle = tinycolor(color).darken(50);
        for (let i = 0; i < this.rodCount; i++) {
            if (blocks === true || blocks[i]) {
                ["strokeRect", "fillRect"].forEach(method => {
                    this.ctx[method](
                        ...this.orientValues(
                            orientation,
                            OFFSET + (this.spacing * (i + 1) + 1),
                            OFFSET
                        ),
                        BLOCK_SIZE,
                        BLOCK_SIZE
                    );
                });
            }
        }
        this.ctx.restore();
    }
}

class Layer {
    constructor(rods, orientation, color) {
        if (typeof rods === "number") {
            this.rodCount = rods;
            this.rods = new Array(rods).fill(null).map(() => []);
        } else {
            this.rodCount = rods.length;
            this.rods = rods;
        }
        this.orientation = orientation;
        this.color = color;
        this.values = new Array(this.rodCount).fill(0);
        this.pct = 1.0;
        this.flyout = 0;
    }

    setFlyout(flyout) {
        this.flyout = flyout;
    }

    computeValues(inputs) {
        const values = new Array(this.rodCount);
        for (let i = 0; i < this.rodCount; i++) {
            let blocked = false;
            for (let j = 0; j < inputs.length; j++) {
                if (inputs[j] && this.rods[i][j]) {
                    blocked = true;
                    break;
                }
            }
            values[i] = blocked ? 0 : 1;
        }
        return values;
    }

    setValues(values) {
        for (let i = 0; i < values.length; i++) {
            this.values[i] = values[i];
        }
    }

    getValues() {
        return this.values;
    }

    setPct(pct) {
        this.pct = pct;
    }

    draw(artist, input = false) {
        if (this.flyout >= 1.0) {
            return;
        }
        const scale = Math.exp(3 * this.flyout);
        artist.withScale(scale, () => {
            for (let i = 0; i < this.rodCount; i++) {
                const drawBlocks = blocks => {
                    artist.drawBlocks(
                        this.orientation,
                        i,
                        this.values[i] * this.pct,
                        blocks,
                        this.color
                    );
                };
                if (input) {
                    drawBlocks(true);
                }
                artist.drawRod(
                    this.orientation,
                    i,
                    this.color,
                    this.values[i] * this.pct
                );
                if (!input) {
                    drawBlocks(this.rods[i]);
                }
            }
            artist.drawValueHighlight(this.orientation, this.color);
        });
    }
}

async function renderOnCanvas(canvas) {
    const rodCount = 4;
    const inputLayer = rodCount;
    const outputLayer = [
        // prettier-ignore
        [0, 0, 0, 0],
        [0, 1, 0, 0],
        [1, 0, 0, 0],
        [1, 1, 1, 1]
    ];
    const computer = new Computer(inputLayer, outputLayer);
    await computer.animate(canvas, 500, [0, 1, 0, 0]);
}

class Computer {
    constructor(...rodLayers) {
        this.layers = rodLayers.map(
            (rods, idx) =>
                new Layer(rods, idx % 2 == 0, idx % 2 ? "#ccccff" : "#ccffcc")
        );
        this.rodCount = Math.max(...this.layers.map(layer => layer.rodCount));
    }

    async animate(canvas, frameDuration, inputs) {
        const width = canvas.width;
        const height = canvas.height;
        const ctx = canvas.getContext("2d");
        const artist = new RodArtist(ctx, this.rodCount);
        let i = 1;
        const animator = new Animator(() => {
            ctx.clearRect(0, 0, width, height);
            ctx.save();
            ctx.scale(width / artist.cellCount, height / artist.cellCount);
            ctx.font = `${100 / 10 / artist.cellCount}px serif`;
            this.layers[i].draw(artist);
            this.layers[i - 1].draw(artist, true);
            ctx.restore();
        });
        this.layers[0].setValues(inputs);

        await animator.animate(frameDuration, pct => {
            this.layers[0].setPct(pct);
        });

        const outputValues = this.layers[1].computeValues(
            this.layers[0].getValues()
        );
        this.layers[1].setValues(outputValues);
        await animator.animate(frameDuration, pct => {
            this.layers[1].setPct(pct);
        });
        await animator.pause(frameDuration);

        // Fly out
        // await animator.animate(500, pct => inputLayer.setFlyout(pct));
    }
}

class Animator {
    constructor(render) {
        this._render = render;
    }

    async pause(duration) {
        return new Promise(resolve => {
            setTimeout(resolve, duration);
        });
    }

    async animate(duration, cb) {
        return new Promise(resolve => {
            const startTime = new Date().getTime();
            const drawFrame = () => {
                const elapsedTimed = new Date() - startTime;
                const pct = elapsedTimed / duration;
                cb(pct > 1 ? 1 : pct);
                this._render();
                if (pct < 1) {
                    requestAnimationFrame(drawFrame);
                } else {
                    resolve();
                }
            };
            requestAnimationFrame(drawFrame);
        });
    }
}

function main() {
    const canvas = document.getElementById("canvas");
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    renderOnCanvas(canvas);
}

let resized = false;
window.addEventListener("resize", () => {
    if (!resized) {
        resized = true;
        window.requestAnimationFrame(() => {
            resized = false;
            main();
        });
    }
});
main();
