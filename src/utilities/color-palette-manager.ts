import { CodeEvent } from "./code-event";

class ColorPaletteManager {
    /**
     * @type {(number[]) => void} {
     */
    on_palette_changed: CodeEvent;

    _document_variable_string_arr: string[]

    _color_palette: number[]
    _previous_palette: number[]
    _current_palette: number[]

    _interval: number
    _interval_loop: number

    /**
     * 
     * @param document_variable_string_arr 
     * @param interval 
     */
    constructor(document_variable_string_arr: string[], interval: number) {
        this._document_variable_string_arr = document_variable_string_arr
        const style = window.getComputedStyle(document.body)
        const l = document_variable_string_arr.length
        this._color_palette = Array(l)
        this._previous_palette = Array(l)
        this._current_palette = Array(l)
        for (let i = 0; i < l; i++) {
            const color_str = style.getPropertyValue(document_variable_string_arr[i])
            const hex_value = Number.parseInt(color_str.replace('#', '0x'))
            this._color_palette[i] = hex_value
            this._previous_palette[i] = hex_value
            this._current_palette[i] = hex_value

        }
        this.on_palette_changed = new CodeEvent()
        this._interval = interval
        this._interval_loop = -1
    }

    /**
     * 0xffffff
     * @param id 
     * @param hex_color 
     * @param duration 
     * @returns 
     */
    set_color(id: number | string, hex_color: number, duration: number) {
        if (typeof (id) === 'string')
            id = this._document_variable_string_arr.indexOf(id)
        if (id < 0 || id >= this._color_palette.length) {
            console.warn('Color out of bounds for id - ', id)
            return
        }
        this._color_palette[id] = hex_color

        this.on_palette_changed.fire(this._color_palette)

        this._animate_palette(duration)
    }

    /**
     * 0xffffff
     * @param hex_color_arr 
     * @param duration 
     * @returns 
     */
    set_palette(hex_color_arr: number[], duration: number) {
        const l = this._color_palette.length
        if (hex_color_arr.length !== l) {
            console.warn('Palette length did not match - ', hex_color_arr.length)
            return
        }

        for (let i = 0; i < l; i++)
            this._color_palette[i] = hex_color_arr[i]

        this._animate_palette(duration)
    }

    _animate_palette(duration_in_seconds: number) {
        clearInterval(this._interval_loop)
        // const l = this._color_palette.length
        // for (let i = 0; i < l; i++)
        //     this._previous_palette[i] = this._color_palette[i]

        const duration = duration_in_seconds * 1000
        let time = 0
        let delta = Date.now()
        const lerp_animation = () => {
            time += Date.now() - delta
            delta = Date.now()

            const n = Math.min(time / duration, 1.0)
            this._lerp_palette(n)
            this.on_palette_changed.fire(this._current_palette)
            if (n < 1.0) return;
            const l = this._color_palette.length
            for (let i = 0; i < l; i++)
                this._previous_palette[i] = this._color_palette[i]
            clearInterval(this._interval_loop)
        }
        this._interval_loop = setInterval(lerp_animation, this._interval)
    }

    /**
     * 
     * @param n 
     */
    _lerp_palette(n: number) {
        const l = this._color_palette.length
        for (let i = 0; i < l; i++) {
            const previous = this._previous_palette[i]
            const previous_r = (previous >> 16) & 0xFF;
            const previous_g = (previous >> 8) & 0xFF;
            const previous_b = previous & 0xFF;
            const next = this._color_palette[i]

            this._current_palette[i] = ((previous_r + (((next >> 16) & 0xFF) - previous_r) * n) << 16) |
                ((previous_g + (((next >> 8) & 0xFF) - previous_g) * n) << 8) |
                (previous_b + ((next & 0xFF) - previous_b) * n)
        }

    }

    /**
     * 0xffffff
     * @param hex_color 
     * @param value 
     */
    static scale_hex_color(hex_color: number, s: number) {
        const r = (hex_color >> 16) & 0xFF;
        const g = (hex_color >> 8) & 0xFF;
        const b = hex_color & 0xFF;

        const newR = Math.round(r + s);
        const newG = Math.round(g + s);
        const newB = Math.round(b + s);

        return (newR << 16) | (newG << 8) | newB
    }

    static greyify(hex_color: number, n: number) {
        const r = (hex_color >> 16) & 0xFF;
        const g = (hex_color >> 8) & 0xFF;
        const b = hex_color & 0xFF;

        const gray = r + g + b / 3

        const newR = Math.round(r + n * (gray - r));
        const newG = Math.round(g + n * (gray - g));
        const newB = Math.round(b + n * (gray - b));

        return (newR << 16) | (newG << 8) | newB
    }

    static desaturate(hex_color: number, s: number) {
        const r = (hex_color >> 16) & 0xFF;
        const g = (hex_color >> 8) & 0xFF;
        const b = hex_color & 0xFF;

        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        
        const newR = Math.round(r + s * (gray - r));
        const newG = Math.round(g + s * (gray - g));
        const newB = Math.round(b + s * (gray - b));

        return (newR << 16) | (newG << 8) | newB
    }
}

export { ColorPaletteManager }