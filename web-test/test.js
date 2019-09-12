const TAB_SIZE = 3;
const MARGIN = 1;

class RodArtist {
    constructor(ctx, rodCount) {
        this.ctx = ctx;
        this.rodCount = rodCount;
        this.spacing = 2;
        this.rodLength = this.spacing * rodCount + TAB_SIZE;
        this.cellCount = this.rodLength + MARGIN + MARGIN + 0.5 * MARGIN;
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

    getRodPosition(orientation, index, value = 0) {
        return this.orientValues(
            orientation,
            MARGIN + (value ? 1 : 0),
            TAB_SIZE + this.spacing * (index + 1)
        );
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

    drawRod(orientation, index, color, blocks, value = 0) {
        const [x, y] = this.getRodPosition(orientation, index, value);
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = tinycolor(color).darken(50);
        this.ctx.lineWidth = 0.1;
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(...this.orientValues(orientation, TAB_SIZE - 1, 0));
        this.ctx.lineTo(
            ...this.orientValues(orientation, TAB_SIZE - 1 + 0.25, 0.25)
        );
        this.ctx.lineTo(
            ...this.orientValues(orientation, this.rodLength, 0.25)
        );
        this.ctx.lineTo(
            ...this.orientValues(orientation, this.rodLength, 0.75)
        );
        this.ctx.lineTo(
            ...this.orientValues(orientation, TAB_SIZE - 1 + 0.25, 0.75)
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

        if (blocks) {
            this.drawBlocks(orientation, index, value, blocks, color);
        }
    }

    drawBlocks(orientation, rodIndex, rodValue, blocks, color) {
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
                            0.1 + (this.spacing * (i + 1) + 1),
                            0.1
                        ),
                        0.8,
                        0.8
                    );
                });
            }
        }
        this.ctx.restore();
    }
}

class Layer {
    constructor(rodCount, orientation, color) {
        if (typeof rodCount === "number") {
            this.rodCount = rodCount;
            this.rods = new Array(rodCount).fill(null).map(() => []);
        } else {
            this.rodCount = rodCount.length;
            this.rods = rodCount;
        }
        this.orientation = orientation;
        this.color = color;
    }

    draw(artists, input = false, values = []) {
        for (let i = 0; i < this.rodCount; i++) {
            artists.drawRod(
                this.orientation,
                i,
                this.color,
                input ? true : this.rods[i],
                values[i]
            );
        }
        artists.drawValueHighlight(this.orientation, this.color);
    }
}

function draw(canvas) {
    const width = canvas.width;
    const height = canvas.height;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    const rodCount = 4;
    const artist = new RodArtist(ctx, rodCount);
    ctx.scale(width / artist.cellCount, height / artist.cellCount);
    ctx.font = `${100 / 10 / artist.cellCount}px serif`;
    const inputLayer = new Layer(rodCount, true, "#ccffcc");
    const outputLayer = new Layer(
        [
            // prettier-ignore
            [1, 1, 0, 0],
            [1, 0, 0, 0],
            [0, 0, 0, 1],
            [1, 0, 1, 1]
        ],
        false,
        "#ccccff"
    );
    outputLayer.draw(artist);
    inputLayer.draw(artist, true, [0, 1, 0, 0]);
    ctx.restore();
}

function main() {
    const canvas = document.getElementById("canvas");
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    draw(canvas);
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
