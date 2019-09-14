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
        this.flyin = 1;
    }

    setFlyout(flyout) {
        this.flyin = 1;
        this.flyout = flyout;
    }

    setFlyin(flyin) {
        this.flyout = 0;
        this.flyin = flyin;
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
        if (this.flyout >= 1.0 || this.flyin <= 0) {
            return;
        }
        const scale = Math.exp(3 * this.flyout) * this.flyin;
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

class Computer {
    constructor(...rodLayers) {
        this.layers = rodLayers.map(
            (rods, idx) =>
                new Layer(rods, idx % 2 == 0, idx % 2 ? "#ccccff" : "#ccffcc")
        );
        this.rodCount = Math.max(...this.layers.map(layer => layer.rodCount));
    }

    getSequenceRunner(canvas, duration, inputs) {
        let currentLayer = 1;
        let drawBlocksForNext = false;
        const ctx = canvas.getContext("2d");
        const artist = new RodArtist(ctx, this.rodCount);
        const render = () => {
            const width = canvas.width;
            const height = canvas.height;
            ctx.clearRect(0, 0, width, height);
            ctx.save();
            ctx.scale(width / artist.cellCount, height / artist.cellCount);
            ctx.font = `${100 / 10 / artist.cellCount}px serif`;
            this.layers[currentLayer].draw(artist, drawBlocksForNext);
            this.layers[currentLayer - 1].draw(artist, true);
            ctx.restore();
        };
        const steps = [];

        steps.push(
            new SingleStep(
                `Setting inputs to ${inputs}`,
                () => {
                    this.layers[0].setValues(inputs);
                },
                pct => {
                    this.layers[0].setPct(pct);
                }
            )
        );

        for (let _i = 1; _i < this.layers.length; _i++) {
            const i = _i;
            const stepsForLayer = [];
            if (i > 1) {
                stepsForLayer.push(
                    new SingleStep(
                        `Next layer (${i})`,
                        () => {
                            drawBlocksForNext = false;
                            currentLayer = i;
                        },
                        pct => {
                            this.layers[i].setFlyin(pct);
                        }
                    )
                );
            }

            stepsForLayer.push(
                new SingleStep(
                    "Push output layer to compute values",
                    () => {
                        this.layers[i].setValues(
                            this.layers[i].computeValues(
                                this.layers[i - 1].getValues()
                            )
                        );
                    },
                    pct => {
                        this.layers[i].setPct(pct);
                    }
                )
            );

            // Fly out
            if (i + 1 < this.layers.length) {
                stepsForLayer.push(
                    new SingleStep("Shed layer", null, pct => {
                        this.layers[i - 1].setFlyout(pct);
                    })
                );

                stepsForLayer.push(
                    new SingleStep(
                        "Output layer becomes the next input layer (hide gates and show blocks)",
                        () => {
                            drawBlocksForNext = true;
                        }
                    )
                );
            }
            steps.push(new Step(...stepsForLayer));
        }

        return new SequenceRunner(new Step(...steps), render, duration);
    }
}

class SingleStep {
    constructor(
        description,
        setup = () => {},
        update = () => {},
        duration = 1
    ) {
        this.description = description;
        this.setup = setup;
        this.update = update;
        this.duration = duration;
    }

    getStepper() {
        let done = false;
        return {
            getCurrent: path =>
                done
                    ? null
                    : [
                          path,
                          this.description,
                          this.setup,
                          this.update,
                          this.duration
                      ],

            step: () => {
                done = true;
                return false;
            }
        };
    }
}

class Step {
    constructor(...substeps) {
        this.steps = substeps;
    }

    getStepper() {
        let currentIdx = 0;
        const steppers = this.steps.map(step => step.getStepper());
        const getCurrent = (path = []) => {
            const current = steppers[currentIdx];
            if (current) {
                return current.getCurrent([...path, currentIdx]);
            }
            return null;
        };

        return {
            getCurrent,

            step: () => {
                while (true) {
                    const current = steppers[currentIdx];
                    if (!current) {
                        return false;
                    }
                    const hasNext = current.step();
                    if (hasNext) {
                        return true;
                    }
                    currentIdx++;
                    return getCurrent() !== null;
                }
            }
        };
    }
}

class SequenceRunner {
    constructor(topStep, render, standardDuration) {
        this._stepper = topStep.getStepper();
        this._standardDuration = standardDuration;
        this._renderPending = false;
        this._render = () => {
            this._renderPending = false;
            render();
        };
    }

    getCurrentStep() {
        const step = this._stepper.getCurrent();
        if (step) {
            const [path, description] = step;
            return { path, description };
        }
        return null;
    }

    async runThis(setup, update, duration) {
        return new Promise(resolve => {
            const startTime = new Date().getTime();
            const drawFrame = () => {
                const elapsedTimed = new Date() - startTime;
                const pct = elapsedTimed / duration;
                update && update(pct > 1 ? 1 : pct);
                this._render();
                if (pct < 1) {
                    this._renderPending = true;
                    requestAnimationFrame(drawFrame);
                } else {
                    resolve();
                }
            };
            setup && setup();
            update && update(0);
            this._renderPending = true;
            requestAnimationFrame(drawFrame);
        });
    }

    refresh() {
        if (!this._renderPending) {
            this._renderPending = true;
            requestAnimationFrame(this._render);
        }
    }

    async step() {
        const current = this._stepper.getCurrent();
        if (current) {
            const [, , setup, update, timeScale] = current;
            const hasNext = this._stepper.step();
            const duration = this._standardDuration * timeScale;
            await this.runThis(setup, update, duration);
            return !hasNext;
        }
        return true;
    }
}

async function main() {
    const canvas = document.getElementById("canvas");
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    const computer = new Computer(
        4,
        // prettier-ignore
        [
            [0, 0, 0, 0],
            [0, 1, 0, 0],
            [1, 0, 0, 0],
            [1, 1, 1, 1]
        ],
        // prettier-ignore
        [
            [0, 1, 1, 1],
            [0, 0, 0, 0]
        ]
    );
    const runner = computer.getSequenceRunner(canvas, 500, [0, 1, 0, 0]);

    let resized = false;
    window.addEventListener("resize", () => {
        if (!resized) {
            resized = true;
            window.requestAnimationFrame(() => {
                resized = false;
                canvas.width = canvas.clientWidth;
                canvas.height = canvas.clientHeight;
                runner.refresh();
            });
        }
    });

    await new Promise(resolve => {
        const keyListener = async () => {
            const done = await runner.step();
            if (done) {
                window.removeEventListener("keypress", keyListener);
                console.log("done");
                resolve();
            } else {
                const { path, description } = runner.getCurrentStep();
                console.log(`Next step ${path}: ${description}`);
            }
        };
        window.addEventListener("keypress", keyListener);
        const { path, description } = runner.getCurrentStep();
        console.log(`First step ${path}: ${description}`);
        runner.refresh();
    });
}

main();
