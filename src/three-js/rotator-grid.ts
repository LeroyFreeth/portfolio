import * as THREE from 'three'
// Warning: These are used by multiple logic processes!
const local_axis: THREE.Vector3[] = [
	new THREE.Vector3(0, 0, -1), // 5
	new THREE.Vector3(0, -1, 0), // 3
	new THREE.Vector3(0, 0, 1), // 4
	new THREE.Vector3(0, 1, 0), // 2
	new THREE.Vector3(-1, 0, 0), // 1
	new THREE.Vector3(1, 0, 0), // 0
]


type RotationStep = 'left' | 'right' | 'up' | 'down';

const world_direction = new THREE.Vector3()
const world_axis = new THREE.Vector3()

const forward = local_axis[0]

export class RotatorGrid {
	facing_idx: number
	axis_x: number
	axis_y: number

	x: number
	y: number
	diff_y: number
	facing_direction_arr: boolean[]
	target_rotation: THREE.Quaternion
	_rotation_offset: THREE.Quaternion

	_target: THREE.Object3D
	_axis_idx: number
	_look_at: THREE.Vector3
	_backside: boolean
	_was_y_face: boolean

	_view_quaternion: THREE.Quaternion
	grid_x_steps: number = 0;
	grid_y_steps: number = 0;
	_is_rotating: boolean = false;

	// 2. The Rotation History Queue (The absolute source of truth)
	private rotation_history: RotationStep[] = [];

	// The standardized 90-degree step angles
	private readonly snap_factor = Math.PI * 0.5;
	// 2. The Isolated Coordinate History Log (The absolute source of truth)

	// The standardized 90-degree step multiplier
	constructor(target: THREE.Object3D, look_at: THREE.Vector3) {

		this.facing_idx = 0
		this.axis_x = 0
		this.axis_y = 0
		this._axis_idx = 0
		this.x = 0
		this.y = 0
		this.diff_y = 0

		this.facing_direction_arr = new Array(local_axis.length)
		this.target_rotation = new THREE.Quaternion()
		this._rotation_offset = new THREE.Quaternion()
		this._target = target
		this._look_at = look_at
		this._backside = false
		this._was_y_face = false

		this._view_quaternion = new THREE.Quaternion()
	}

	/**
	     * 3. Rebuilds a clean, un-skewed Quaternion by executing your 
	     * step history strictly in the chronological order they occurred.
	     */
	private rebuild_quaternion_from_history(): THREE.Quaternion {
		const q = new THREE.Quaternion(); // Start at Identity (0,0,0)

		const qLeft = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -this.snap_factor);
		const qRight = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.snap_factor);
		const qUp = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -this.snap_factor);
		const qDown = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.snap_factor);

		for (const step of this.rotation_history) {
			if (step === 'left') q.multiply(qLeft);
			if (step === 'right') q.multiply(qRight);
			if (step === 'up') q.multiply(qUp);
			if (step === 'down') q.multiply(qDown);
		}
		return q;
	}

	/**
	 * 4. Call this from external scripts/inputs to add steps in a queue.
	 * Supports passing multiple commands at once (e.g., add_manual_steps(['left', 'up']))
	 */
	public add_manual_steps(steps: RotationStep[]): void {
		for (const step of steps) {
			this.rotation_history.push(step);

			// Maintain absolute user-readable counters for your UI/tracking
			if (step === 'left') this.x -= 1;
			if (step === 'right') this.x += 1;
			if (step === 'up') this.y += 1;
			if (step === 'down') this.y -= 1;
		}

		// Instantly bake the new history into your target matrices
		this._rotation_offset.copy(this.rebuild_quaternion_from_history());
		const forward = new THREE.Vector3(0, 0, 1);
		this.target_rotation.setFromUnitVectors(local_axis[2], forward); // Front Face identity base
		this.target_rotation.multiply(this._rotation_offset);
	}

	/**
	 * 5. The core look-at update loop.
	 * Evaluates face boundaries cleanly without hitting order-of-operation glitches.
	 */
	public update_target_rotation(): THREE.Quaternion {
		// Calculate and normalize look direction
		world_direction.copy(this._target.position).sub(this._look_at).normalize();

		// Use our clean chronological matrix to test face dots (Prevents feedback cross-talk)
		const stable_grid_quaternion = this.rebuild_quaternion_from_history();

		let facing_idx = 0;
		let max_dot = -Infinity;
		const l = local_axis.length;

		for (let i = 0; i < l; ++i) {
			world_axis.copy(local_axis[i]).applyQuaternion(stable_grid_quaternion);
			const dot = world_axis.dot(world_direction);

			this.facing_direction_arr[i] = dot < -0.40;

			if (dot > max_dot) {
				max_dot = dot;
				facing_idx = i;
			}
		}

		if (this.facing_idx === -1) {
			this.facing_idx = facing_idx;
		}

		// Handle Automatic Screen-Relative Face Snapping
		if (facing_idx !== this.facing_idx) {
			const old_world_dir = local_axis[this.facing_idx].clone().applyQuaternion(stable_grid_quaternion);
			const new_world_dir = local_axis[facing_idx].clone().applyQuaternion(stable_grid_quaternion);

			const transition_delta = new THREE.Vector3().subVectors(new_world_dir, old_world_dir).normalize();

			const world_up = new THREE.Vector3(0, 1, 0);
			const view_matrix = new THREE.Matrix4().lookAt(this._target.position, this._look_at, world_up);
			const view_quaternion = new THREE.Quaternion().setFromRotationMatrix(view_matrix);

			const view_delta = transition_delta.clone().applyQuaternion(view_quaternion.invert());

			let automated_step: RotationStep;

			if (Math.abs(view_delta.y) > Math.abs(view_delta.x)) {
				automated_step = view_delta.y > 0 ? 'up' : 'down';
				this.y += view_delta.y > 0 ? 1 : -1;
			} else {
				automated_step = view_delta.x > 0 ? 'right' : 'left';
				this.x += view_delta.x > 0 ? 1 : -1;
			}

			// Append the auto-snap step to the historical sequence 
			this.rotation_history.push(automated_step);
			this.facing_idx = facing_idx;

			// Regenerate the final locked target matrices chronologically
			this._rotation_offset.copy(this.rebuild_quaternion_from_history());
			const forward = new THREE.Vector3(0, 0, 1);
			this.target_rotation.setFromUnitVectors(local_axis[2], forward);
			this.target_rotation.multiply(this._rotation_offset);
		}

		return this.target_rotation;
	} _update_target_rotation(): THREE.Quaternion {
		let facing_idx = 0
		let max_dot = Number.MIN_VALUE
		const l = local_axis.length
		world_direction.copy(this._target.position).sub(this._look_at)
		for (let i = 0; i < l; ++i) {
			world_axis.copy(local_axis[i])
			const axis = world_axis
			axis.applyQuaternion(this._target.quaternion)
			const dot = axis.dot(world_direction)
			// Store which faces face the world direction
			this.facing_direction_arr[i] = dot < -0.40
			if (dot < max_dot) continue
			max_dot = dot
			facing_idx = i
		}
		if (facing_idx !== this.facing_idx) {
			this.facing_idx = facing_idx
			this._axis_idx = facing_idx
			const is_y_face = facing_idx < 4

			if (this._was_y_face !== is_y_face) {
				this.x += 1
			}
			this._was_y_face = is_y_face
			if (is_y_face) {
				let previous_y = ((this.axis_y % 4) + 4) % 4
				// We always face the front face when one of the z or y faces faces the camera
				this._axis_idx = 0
				// Then we check if we're a backside of another face for the current rotation
				this._backside = this.axis_y === (facing_idx + 2) % 4
				if (this._backside) {
					// If so, flip the face upside down to align with the other faces in the 'row'
					this._rotation_offset.setFromEuler(new THREE.Euler(-this.axis_y * 0.5 * Math.PI, Math.PI, 0))
				}
				else {
					// If not, set the next rotation row index
					this.axis_y = facing_idx
					// this.y = facing_idx
					// Since we're setting the axis as the original front face, this is the rotation row offset in quaternions
					// This allows us to treat every rotation row with the same rotation rules
					this._rotation_offset.setFromEuler(new THREE.Euler(this.axis_y * 0.5 * Math.PI, 0, 0))
				}
				let diff_y = this.axis_y - previous_y
				if (Math.abs(diff_y) > 1) diff_y /= -3
				this.y += diff_y

			} else {
				// We're rotating in 'columns', so no changes to the rotation logic
				this._rotation_offset.setFromEuler(new THREE.Euler(this.axis_y * 0.5 * Math.PI, 0, 0))
				this._backside = false
			}

			this.target_rotation.setFromUnitVectors(local_axis[this._axis_idx], forward)
			this.target_rotation.multiply(this._rotation_offset)
		}
		return this.target_rotation
	}
}
