
export class Benchmark {
	static run(id: string, performance_callback: (() => void), amount: number) {
		const start = performance.now()
		for (let i = 0; i < amount; ++i) {
			performance_callback()
		}
		const elapsed = performance.now() - start
		console.log(`Performance benchmark ${id} for amount ${amount} - ${elapsed} ms`)
	}
}
