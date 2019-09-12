const TAB_SIZE = 3;
const MARGIN = 1;

class RodArtist {
    constructor(ctx, rodCount) {
        this.ctx = ctx;
        this.rodCount = rodCount;
        this.spacing = 4;
        this.rodLength = this.spacing * rodCount + TAB_SIZE;
        this.cellCount = this.rodLength + MARGIN + MARGIN + 0.5 * MARGIN;
    }

    getRodPosition(orientation, index) {
        const a = 1;
        const b = 3 + this.spacing * (index + 1);
        return this.orientValues(orientation, a, b);
    }

    getVector(orientation) {
        return this.orientValues(orientation, 1, 0);
    }

    orientValues(orientation, a, b) {
        if (orientation) {
            return [a, b];
        }
        return [b, a];
    }

    orientVector(orientation, xComponent, yComponent) {
        const [dx, dy] = this.getVector(orientation);
        return [
            dx * xComponent + dy * yComponent,
            dy * xComponent + dx * yComponent
        ];
    }

    drawValueHighlight(orientation, color) {
        const [dx, dy] = this.getVector(!orientation);
        const [x, y] = this.orientVector(
            !orientation,
            TAB_SIZE + this.spacing - 0.5,
            MARGIN + 1
        );
        const [w, h] = this.orientVector(
            !orientation,
            this.rodLength - TAB_SIZE - this.spacing + 2,
            1
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
        let x, y, dx, dy;
        if (orientation) {
            // horizontal
            x = 1;
            y = 3 + this.spacing * (index + 1);
            dx = 1;
            dy = 0;
        } else {
            // vertical
            x = 3 + this.spacing * (index + 1);
            y = 1;
            dx = 0;
            dy = 1;
        }
        if (value) {
            x += dx;
            y += dy;
        }
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = tinycolor(color).darken(50);
        this.ctx.lineWidth = 0.1;
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(2 * dx, 2 * dy);
        this.ctx.lineTo(2 * dx + 0.25, 2 * dy + 0.25);
        this.ctx.lineTo(
            dx * this.rodLength + 0.25 * dy,
            dy * this.rodLength + 0.25 * dx
        );
        this.ctx.lineTo(
            dx * this.rodLength + 0.75 * dy,
            dy * this.rodLength + 0.75 * dx
        );
        this.ctx.lineTo(2 * dx + 0.25 + 0.5 * dy, 2 * dy + 0.25 + 0.5 * dx);
        this.ctx.lineTo(2 * dx + dy, 2 * dy + dx);
        this.ctx.lineTo(dy, dx);
        this.ctx.lineTo(0, 0);
        this.ctx.stroke();
        this.ctx.fill();

        this.ctx.fillStyle = tinycolor
            .mostReadable(color, ["white", "black"])
            .toString();
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText("0", dx + 0.5, dy + 0.5, 1);
        this.ctx.fillText("1", 0.5, 0.5, 1);

        if (blocks) {
            this.ctx.fillStyle = tinycolor(color).darken(25);
            this.ctx.strokeStyle = tinycolor(color).darken(50);
            for (let i = 0; i < this.rodCount; i++) {
                if (blocks === true || blocks[i]) {
                    ["strokeRect", "fillRect"].forEach(method => {
                        this.ctx[method](
                            0.1 + dx * (this.spacing * i + this.spacing + 1),
                            0.1 + dy * (this.spacing * i + this.spacing + 1),
                            0.8,
                            0.8
                        );
                    });
                }
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
