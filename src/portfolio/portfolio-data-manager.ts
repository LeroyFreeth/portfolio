import { CodeEventDuo } from "../utilities/code-event"
import { type PortfolioData } from "./portfolio-data"

export class PortfolioDataManager {
	portfolio_data_arr: PortfolioData[]
	idx: number
	on_portfolio_data_changed: CodeEventDuo<number, PortfolioData>
	constructor(portfolio_data_arr: PortfolioData[]) {
		this.portfolio_data_arr = portfolio_data_arr
		this.idx = 0
		this.on_portfolio_data_changed = new CodeEventDuo()
	}

	get_idx(): number {
		return this.idx
	}
	set_idx(idx: number, quiet: boolean) {
		this.idx = idx
		if (!quiet) this.on_portfolio_data_changed.fire(idx, this.portfolio_data_arr[idx])
	}
	calc_idx_for_offset(offset: number) {
		const small_l = this.portfolio_data_arr.length - 1
		return (((this.idx - 1) + offset + small_l) % small_l) + 1

	}
	calc_idx_for_number(x: number) {
		const small_l = this.portfolio_data_arr.length - 1
		return ((x % small_l) + small_l) % small_l + 1
	}
	calc_idx_next(): number { return this.calc_idx_for_offset(1) }
	calc_idx_previous(): number { return this.calc_idx_for_offset(-1) }

	get_portfolio_data_arr(): PortfolioData[] { return this.portfolio_data_arr }
	get_portfolio_data(): PortfolioData { return this.portfolio_data_arr[this.idx] }

}
