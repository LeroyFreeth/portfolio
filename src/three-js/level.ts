import * as THREE from 'three'

interface ITickable {
    tick(delta: number): void;
    get ticking(): boolean;
}

enum LEVEL_STATE {
    UNLOADED,
    PAUSED,
    PLAYING
}

class Level implements ITickable {
    private _levelState: LEVEL_STATE

    private _scene: THREE.Scene
    private _active_camera: THREE.Camera

    private _always_tickable_arr: ITickable[]
    private _level_tickable_arr: ITickable[]

    private _tick_callback_arr: (() => void)[]

    get scene(): THREE.Scene { return this._scene }
    get camera(): THREE.Camera { return this._active_camera }
    get ticking(): boolean { return this._levelState == LEVEL_STATE.PLAYING }

    constructor(scene: THREE.Scene, active_camera: THREE.Camera) {
        this._scene = scene
        this._active_camera = active_camera

        this._levelState = LEVEL_STATE.UNLOADED

        this._always_tickable_arr = []
        this._level_tickable_arr = []
        
        window.addEventListener('resize', () => {
            const camera = this._active_camera
            if (camera instanceof THREE.PerspectiveCamera) {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
            }
        });

        this._tick_callback_arr = []
    }

    public set_active_camera(camera: THREE.Camera): void {
        this._active_camera = camera
    }

    start() {
      
        this._levelState = LEVEL_STATE.PLAYING
    }

    // TODO: Implement a loading feature
    load() {

    }

    public tick(delta: number): void {
        for (const tickable of this._always_tickable_arr) tickable.tick(delta)
        if (this._levelState != LEVEL_STATE.PLAYING) return
        for (const tickable of this._level_tickable_arr) tickable.tick(delta)
        for (const callback of this._tick_callback_arr) callback()
        
    }

    public add_tickable(tickable: ITickable, ignore_pause: boolean): void {
        if (ignore_pause) this._always_tickable_arr.push(tickable)
        else this._level_tickable_arr.push(tickable)
    }

    /**
     * Add generic callbacks to the level tick cycle
     * @param callback 
     */
    public add_tick_callback(callback: () => void): void {
        this._tick_callback_arr.push(callback)
    }
}

export { Level }

export type { ITickable }
