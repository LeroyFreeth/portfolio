// https://easings.net/

enum EASE_TYPE {
    LINEAR = -1,

    IN_SINE = 0,
    OUT_SINE = 1,
    IN_OUT_SINE = 2,

    IN_QUAD = 3,
    OUT_QUAD = 4,
    IN_OUT_QUAD = 5,

    IN_CUBIC = 6,
    OUT_CUBIC = 7,
    IN_OUT_CUBIC = 8,

    IN_QUART = 9,
    OUT_QUART = 10,
    IN_OUT_QUART = 11,

    IN_QUINT = 12,
    OUT_QUINT = 13,
    IN_OUT_QUINT = 14,

    IN_EXPO = 15,
    OUT_EXPO = 16,
    IN_OUT_EXPO = 17,

    IN_CIRC = 18,
    OUT_CIRC = 19,
    IN_OUT_CIRC = 20,

    IN_BACK = 21,
    OUT_BACK = 22,
    IN_OUT_BACK = 23,

    IN_ELASTIC = 24,
    OUT_ELASTIC = 25,
    IN_OUT_ELASTIC = 26,

    IN_BOUNCE = 27,
    OUT_BOUNCE = 28,
    IN_OUT_BOUNCE = 29,
}

// Haven't tested if precalculating these is faster
const c1 = 1.70158
const c2 = c1 * 1.525
const c3 = c1 + 1
const c4 = (2 * Math.PI) / 3
const c5 = (2 * Math.PI) / 4.5

const n1 = 7.5625
const d1 = 2.75


function ease(easeId: EASE_TYPE, x: number) {
    switch (easeId) {
        case EASE_TYPE.IN_SINE: return 1 - Math.cos((x * Math.PI) / 2)
        case EASE_TYPE.OUT_SINE: return Math.sin((x * Math.PI) / 2)
        case EASE_TYPE.IN_OUT_SINE: return -(Math.cos(Math.PI * x) - 1) / 2

        case EASE_TYPE.IN_QUAD: return x * x
        case EASE_TYPE.OUT_QUAD: return 1 - (1 - x) * (1 - x)
        case EASE_TYPE.IN_OUT_QUAD: return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2

        case EASE_TYPE.IN_CUBIC: return x * x * x
        case EASE_TYPE.OUT_CUBIC: return 1 - Math.pow(1 - x, 3)
        case EASE_TYPE.IN_OUT_CUBIC: return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2

        case EASE_TYPE.IN_QUART: return x * x * x * x
        case EASE_TYPE.OUT_QUART: return 1 - Math.pow(1 - x, 4)
        case EASE_TYPE.IN_OUT_QUART: return x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2

        case EASE_TYPE.IN_QUINT: return x * x * x * x * x
        case EASE_TYPE.OUT_QUINT: return 1 - Math.pow(1 - x, 5)
        case EASE_TYPE.IN_OUT_QUINT: return x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2

        case EASE_TYPE.IN_EXPO: return x === 0 ? 0 : Math.pow(2, 10 * x - 10)
        case EASE_TYPE.OUT_EXPO: return x === 1 ? 1 : 1 - Math.pow(2, -10 * x)
        case EASE_TYPE.IN_OUT_EXPO:
            return x === 0
                ? 0
                : x === 1
                    ? 1
                    : x < 0.5 ? Math.pow(2, 20 * x - 10) / 2
                        : (2 - Math.pow(2, -20 * x + 10)) / 2

        case EASE_TYPE.IN_CIRC: return 1 - Math.sqrt(1 - Math.pow(x, 2))
        case EASE_TYPE.OUT_CIRC: return Math.sqrt(1 - Math.pow(x - 1, 2))
        case EASE_TYPE.IN_OUT_CIRC:
            return x < 0.5
                ? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2
                : (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2

        case EASE_TYPE.IN_BACK: return c3 * x * x * x - c1 * x * x
        case EASE_TYPE.OUT_BACK: return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2)
        case EASE_TYPE.IN_OUT_BACK: return x < 0.5
            ? (Math.pow(2 * x, 2) * ((c2 + 1) * 2 * x - c2)) / 2
            : (Math.pow(2 * x - 2, 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2

        case EASE_TYPE.IN_ELASTIC:
            return x === 0
                ? 0
                : x === 1
                    ? 1
                    : -Math.pow(2, 10 * x - 10) * Math.sin((x * 10 - 10.75) * c4)
        case EASE_TYPE.OUT_ELASTIC:
            return x === 0
                ? 0
                : x === 1
                    ? 1
                    : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1
        case EASE_TYPE.IN_OUT_ELASTIC:
            return x === 0
                ? 0
                : x === 1
                    ? 1
                    : x < 0.5
                        ? -(Math.pow(2, 20 * x - 10) * Math.sin((20 * x - 11.125) * c5)) / 2
                        : (Math.pow(2, -20 * x + 10) * Math.sin((20 * x - 11.125) * c5)) / 2 + 1

        case EASE_TYPE.IN_BOUNCE: return 1 - outBounce(1 - x)
        case EASE_TYPE.OUT_BOUNCE: return outBounce(x)
        case EASE_TYPE.IN_OUT_BOUNCE:
            return x < 0.5
                ? (1 - outBounce(1 - 2 * x)) / 2
                : (1 + outBounce(2 * x - 1)) / 2
        // For example setting ease type to LINEAR will just return same value
        default:
            return x
    }
}

// TODO: Add support for baked curves

function outBounce(x: number) {
    if (x < 1 / d1) return n1 * x * x
    else if (x < 2 / d1) return n1 * (x -= 1.5 / d1) * x + 0.75
    else if (x < 2.5 / d1) return n1 * (x -= 2.25 / d1) * x + 0.9375
    else return n1 * (x -= 2.625 / d1) * x + 0.984375
}

export { EASE_TYPE, ease }