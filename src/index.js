const D = Symbol("DONT CARE");
const Z = Symbol("ZERO");
const P = Symbol("PASS");
const I = Symbol("INVERT");

const gateFunctions = Object.freeze({
    [D]: () => 1,
    [Z]: () => 0,
    [P]: d => d,
    [I]: d => (d === 0 ? 1 : 0)
});

class Rod {
    constructor(gates) {
        this._gates = gates.map(gate => {
            const func = gateFunctions[gate];
            if (!func) {
                throw new TypeError("Invalid gate, expected a Symbol");
            }
            return func;
        });
    }

    compute(inputs) {
        return this._gates.some((block, idx) => block(inputs[idx]) === 0)
            ? 0
            : 1;
    }
}

class Layer {
    constructor(rods) {
        this._rods = rods.map(rod => (rod instanceof Rod ? rod : new Rod(rod)));
    }

    compute(inputs) {
        return this._rods.map(r => r.compute(inputs));
    }
}

class Stack {
    constructor(layers) {
        this._layers = layers.map(layer =>
            layer instanceof Layer ? layer : new Layer(layer)
        );
    }

    compute(inputs) {
        return this._layers.reduce(
            (data, layer) => layer.compute(data),
            inputs
        );
    }

    _computeRow(inputs) {
        return [inputs, this.compute(inputs)];
    }

    _computeAll(leadingInputs, remainingInputCount) {
        if (remainingInputCount === 1) {
            return [
                this._computeRow([...leadingInputs, 0]),
                this._computeRow([...leadingInputs, 1])
            ];
        }
        return [
            ...this._computeAll([...leadingInputs, 0], remainingInputCount - 1),
            ...this._computeAll([...leadingInputs, 1], remainingInputCount - 1)
        ];
    }

    table(...inputLabels) {
        return this._computeAll([], inputLabels.length).map(
            ([inputs, outputs]) => {
                const labeledRow = inputs.reduce((obj, val, idx) => {
                    obj[inputLabels[idx]] = val;
                    return obj;
                }, {});
                labeledRow["outputs"] = outputs;
                return labeledRow;
            }
        );
    }
}

// E, D, W
const rodF = new Rod([I, P, D]);
const rodG = new Rod([P, D, P]);
// F, G
const layer1 = new Layer([rodF, rodG]);
const rodH = new Rod([I, I]);
// H
const layer2 = new Layer([rodH]);
const rodJ = new Rod([I]);

const output = new Layer([rodJ]);
const dataRegister = new Stack([layer1, layer2, output]);

console.table(dataRegister.table("E", "D", "W"));
