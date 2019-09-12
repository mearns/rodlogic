# Rod Logic

## Setup

We define the X axis as running from west (negative) to east (positive); the Y axis runs from south
(negative) to north (positive); the Z axis runs from down (negative) to up (positive);

Consider a set of rectangular prism "rods", each N units long, 2 units wide, and 1 unit high.

Rods are always oriented orthagonal to the axes with its height (1 unit) lying along the Z axis.
Rods can be oriented _horizontally_, such that its length (N units) lies along the X axis and its
width (2 units) along the Y axis; or _vertically_, such that its length lies along the Y axis and its
with along the X axis.

A rods location is described by the coordinate of it's most southwest down-most corner: rods are always located
on the lattice, i.e., the coordinates of its location are always integer unit values.

From it's initial location, a rod is contrained to a single alternate location, which is translated
by one unit in the positive direction of its length: horizontally oriented rods can be at their initial
location (X, Y, Z), or at location (X+1, Y, Z); vertically oriented rods can be at their initial location
or at location (X, Y+1, Z).

Rods in their initial location always have their width (2 units) coincident with an axis: horizontally
oriented rods have locations with an X coordinate of 0 (or 1 in the alternate location); vertically
oriented rods have locations with a Y coordinate of 0 (or 1 in the alternate location).

A rod in it's initial location is considered to have a value of 0; a rod in it's alternate (translated)
location is considered to have a value of 1.

Rods only exist in every other Z plane. In other words, the location of every rod has a Z value which is
even (equivalent to 0 under modulo 2). Further more, horiztonally oriented rods only have locations with
Z coordinates that are equivalent to 0 under modulo 4 (Z in { 0, 4, 8, etc. }), and vertically oriented rods
only have locations with Z coordinates that are equivalent to 2 under modulo 4 (Z in { 2, 6, 10, etc. }).

Similarly, a one-unit gap is left between adjacent rods. Horizontally aligned rods always have a location
with a Y value that is equivalent to 1 under modulo 3 (recall that they have a width of 2); vertically oriented
rods always have a location with an X value equivalent to 1 under modulo 3.

Putting it together:

-   **horizontally oriented rods in their initial location** have locations `(0, 1 + 3j, 4k)`
-   **horizontally oriented rods in their alternate location** have locations `(1, 1 + 3j, 4k)`
-   **vertically oriented rods in their initial location** have locations `(1 + 3j, 0, 2 + 4k)`
-   **vertically oriented rods in their alternate location** have locations `(1 + 3j, 1, 2 + 4k)`

Each rod is uniquely identified by the three tuple of: `[orientation, j, k]`, where orientation is 0 for horizontally
oriented rods and 1 for vertically oriented rods, k is a non-negative integer indicating the "layer pair" of the rod,
and j is a non-negative integer indicating it's index within its layer (each layer pair consists of two layers: one
layer of horizontally aligned rods, and one layer of vertically aligned rods, ad a one-unit high gap between the two layers).

For clarity, we will replace the two tuple of `[orientation, k]` with a single scalar value of `s`, where `s` is a non-negative
integer, and is equivalent to `[s % 2, k = floor(s / 2)]`, where `floor(x)` is the largest integer not greater than `x`. With this
modification, each rod is uniquely identified by the two-tuple `{j, s}`.

Every rod is partitioned into unit length _segments_ along its length. Segments are numbered sequentially starting at
0 in the most south/west segment. E.g., a horizontally oriented rod in its initial location has segment 0 running from
X=0 (its west-mode edge) to X=1, segment 1 from X=1 to X=2, etc. Positions belong to the rod, so they translate along
with the rod in it's alternate position.

Every rod has a _block_ installed at segments with numbers equivalent to 1 under modulo 3. Each _block_ is a solid
piece one unit long, two units wide, and one unit high. The blocks are oriented with the rod they are installed on,
so the blocks of a horizontally oriented rod are one unit in each of the X and Z dimensions ("length" and "height"),
and two units in the Y dimension ("width").

Blocks are located one unit _up_ from the rod they are installed on. Thus:

-   blocks on a horizontally oriented rod at (x, y, z) have location `(x + 1 + 3i, y, z + 1)`
-   blocks on a vertically oriented rod at (x, y, z) have location `(x, y + 1 + 3i, z + 1)`

Where `i` is a non-negative integer and `1 + 3i` is a position on the rod. Every rod has all possible blocks installed
on it, according to these rules.

A block is unambiguously described by the rod its on, `{j, s}`, and the values of `i` (the index of the block along
the rod): `{j, s, i}`

Rods have optional _gates_ installed as well. Each gate is a cube 1 unit high, 1 unit wide, and 1 unit long. Gates
are installed on rods at positions with numbers that are equivalent to 0 under modulo 3. Each such position can have
up to 2 gates installed, at offsets of 0 or 1 units along the width of the rod. Gates are installed one unit down
from the location of the rod on which they are installed. Thus:

-   Gates on a horizontally oriented rod at (x, y, z) have location `(x + 3i, y + o, z - 1)`
-   Gates on a vertically oriented rod at (x, y, z) have location `(x + o, y + 3i, z - 1)`

Where `i` is a non-negative integer, `3i` is a position on the rod, and `o` is either 0 or 1. Gates with an `o` value of
0 are called _passing gates_, and gates with an o value of 1 are called _inverting gates_.

A gate is unambiguously described by the rod its on, `{j, s}`, and the values of `i` (the index of the gate along
the rod) and `o` (which "side" of the rod it is on): `{j, s, i, o}`.

Blocks and gates are considered solid, which means that they cannot overlap in space. Thus, a rod is not permitted to
move into it's alternate position if doing so would cause any blocks or gates to overlap.

## Computation

A set of rods, blocks, and gates as described above are considered to be a _computer_. The down-most layer of rods are
considered to be the _input_ layer.

To _setup_ for computation, all rods are put in their initial positions. Then, the rods of the input layer are
positioned to provide the input to the computation: The input rod at `{j, s=0}` is left in its initial location of
`(0, 1 + 3j, 0)` to set a value of 0 for input-j; and put in it's alternate location of `(1, 1 + 3j, 0)` to set a value of 1
for input-j.

To perform the computation after _setup_ is complete, we step through subsequent each layer starting `s=1`; for each layer,
we push every rod in the layer that is allowed to be in it's alternate location into it's alternate location: rods that
are not allowed to be in their alternate location are left in their initial location.

Output can be read from each layer as the sequence of equivalent values for each value based on it's resulting location: if
rod j is left in its initial location, then output-j has a value of 0, other (it was able to be pushed to its alternate location),
output-j has a value of 1.

## Understanding Computation

Each rod "intersects" every rod on the adjacent layers (up and down) in exacly one spot, meaning they are both present
in the same 2 unit by 2 unit square of the XY plane (but with different Z coordinates). Specifically, a horizontally
aligned rod `{j1, s1}` and vertically aligned rod `{j2, s2}` intersect in the 2 unit by 2 unit square with southwest
corner at `(1 + 3*j1, 1 + 3*j2)`.

Consider rod `{j=0, s=0}` and
rod `{j=0, s=1}`. In it's initial location, the "down" rod (s = 0), has a block at that is immediately adjacent to a gate
`{0, 1, 0, 0}` on the "up" rod, in such a way that (if such a gate is present), prevents the "up" rod from being in its
alternate location.

On the other hand, if the "down" rod is in its alternate location, then the down rod's block `{0, 0, 0}` is adjacent
to a gate in the "o=1" position, at `{0, 1, 0, 1}`.

More generally, when rod `{j, s}` has in the initial location, the block at `{j, s, i}` will obstruct a gate (if present)
at `{i, s + 1, j, 0}`; if the rod is in its alternate location, the block at `{j, s, i}` will obstruct a gate (if present)
at `{i, s + 1, j, 1}`.

Blocks are always present, but gates are selected to configure the computation. Individual gates are chosen to be obstructed
by a block on the next rod down: a gate with `o=0` is obstructed when the down rod is in the initial state, and a gate with
`o=1` is obstructed when the down rod is in the alternate state. A rod cannot move to its alternate position if any of its
gates are obstructed. In this way, gates on a rod are configured to make that rod's output location (following computation
as described above) a function of the locations of the rods below it.

We'll define `Cfg({j, s, i, o})` as 1 if the gate `{j, s, i, o}` is present, and 0 if it is not present, and `Val({j, s})`
as 0 if the rod `{j, s}` is in its initial location and 1 if the rod is in its alternate location.

Consider rod `{J, S}`, with `D` "input" rods in the next layer down: `{i, S - 1}` for `i` = 0, 1, 2, ..., D - 1.
The output value of the rod `{J, S + 1}` is defined as:

$$
\product_{i = 0}^{i < D}
    (~Cfg({J, S, i, 0}))(~Cfg({J, S, i, 1}))
    + (~Cfg({J, S, i, 0}))(Cfg({J, S, i, 1}))(~Val({i, S - 1}))
    + (Cfg({J, S, i, 0}))(~Cfg({J, S, i, 1}))(Val({i, S - 1}))
$$

Each pair of gates on the "up" rod has an associated input rod on the next layer down. Specifically, the gates with
`{J, S, I, o}`, for either value of `o`, are associated with "input" rod `{I, S - 1}`.

We can summarize this in a more intuitive way:

-   If both gates are present on a segment, the rod will be obstructed regardless of the location of the
    associated input rod, and the output rod will have a fixed value of 0.
-   If neither gate is present on a segment, the rod will be _unobstructed_ regardless of the location
    of the associated input rod.
-   If the passing gate (o = 0) is present and the inverting gate (o = 1) is not, then the output rod
    will be obstructed by the input rod if and only if the input rod is in the initial position (input
    value of 0).
-   If the inverting gate (o = 1) is present and the passing gate (o = 0) is not, then the output rod
    will be obstructed by the input rod if and only if the input rod is in the alternate position (input
    value of 1).

This is way the passing gate and inverting gates are called as such: as long as only one gate is present, the
passing gate being present permits the input rod to pass its value to the output rod, while the inverting
gate being present permits the input rod the pass the inverse of of its value to the output rod.

Recall, however, that the actual output of a rod is 0 if _any_ of its gates are obstructed, and 1 only if
it has _no obstructed gates_.

We can further simplify the configuration of gates as follows:

| Passing | Inverting || Output | Configuration |
| ------- | --------- || ------ | ------------- |
| 0 | 0 || 1 | "DONT CARE" |
| 0 | 1 || ~d | "INVERT" |
| 1 | 0 || d | "PASS" |
| 1 | 1 || 0 | "ZERO" |

This table uses `d` as the value of the corresponding input, and a 1 to indicate that the gate is present,
0 to indicate that it's absent.

## Building Blocks

Each gate-pair on a rod is a Boolean-valued function of the associated input value. The output value of a rod with
its gates is the logical conjunction of each of its gate functions applied to the associated input.

The gate-pairs on a rod provide the following basic building blocks:

### Don't Care: `[DC]`

By setting a gate-pair to the DONT CARE configuration, the output becomes independent of the associated input.

### Positive `[P]`

By the setting a gate-pair to the PASS configuration, the output becomes positively dependent on the input: the output
cannot be 1 unless the associated input is 1.

### Negative `[I]`

By setting the gate-pair to the INVERT configuration, the output becomes negatively dependent on the input: the output
cannot be a 1 unless the associated input is 0.

### Zero `[Z]`

By setting any gate-pair to the ZERO configuration, the rod becomes unconditionally obstructed and the output will have
a value of 0 regardless of _any_ inputs.

### And `[P, P, ...]`

By setting gate-pairs on two different inputs to the PASS configuration, the output becomes positively dependent on the
_conjunction_ of the two associated inputs: the output cannot be 1 unless _both_ associated inputs are 1.

This can be extended from 2 inputs to any number of inputs.

### Nor `[I, I, ...]`

By setting a gate-pairs on two or more inputs to the INVERT coniguration, the output becomes positively dependent on the
_joint denial_ ("NOR") of the associated inputs: the output cannot be 1 unless _all_ associated inputs are 0.

This follows from DeMorgans law as the INVERT configuration for each input makes the output a conjunction including the
inverse of that input, thus (~A)(~B), which is equivalent (by DeMorgan's law) to ~(~(A) + ~(~B)) or simply ~(A + B).

As has been shown elsewhere, all boolean functions can be synthesized from multiple layers of NOR gate, thus
the model is computationally complete.

-   NOT(A) = NOR(A, 0)
-   OR(A, B) = NOT(NOR(A, B))
-   AND(A, B) = NOR(NOT(A), NOT(B))

## Larger Circuits

Larger logic circuits can be implemented by combining the building blocks above, on a single rod, across multiple rods,
and across multiple layers.

### 2x1 multiplexer

A 2x1 multiplexer with inputs A and B and select S is defined as `(~SA) + (SB)`. This can be set up on three layers,
using 2 rods, 1 rod, and 1 rod, respectively.

-   Layer 1:
    -   Rod C: { S: I, A: P } = ~SA
    -   Rod D: { S: P, B: P } = SB
-   Layer 2:
    -   Rod E: { C: I, D: I } = ~C~D = ~(C + D) = ~(~SA + SB)
-   Layer 3:
    -   Rod F: { E: I } = ~E = ~(~(~SA + SB)) = ~SA + SB

### Data Register

Data from one rod can be passsed up through layers simply by creating a rod that has a PASS configuration in the associated
gate-pair, and leaving the rest of the gates on the rod as DONT CARE.

However, to serve as a mutable data register, you need a way of changing the value. There are a variety of ways to do this.
One way to uses the input data, D, a write value W, a write-enable value E, and the output data Q. The output Q is taken
as the output of a 2x1 multiplexer which has D as its first input, W as its second input, and E as its select line. When
the E value is 0, Q gets the value of D, i.e., the register is unchanged. When E is 1, Q gets the value from W, i.e., the
register is set to the provided write value.

-   Layer 1:
    -   Rod F: { E: I, D: P }
    -   Rod G: { E: P, W: P }
-   Layer 2:
    -   Rod H: { F: I, G: I }
-   Layer 3:
    -   Rod J: { H: I }
