import type { PortfolioData } from './portfolio-types.ts'
import { PORTFOLIO_PAGE_NAMES, PORTFOLIO_CATEGORY_NAMES, CATEGORIES_FOR_PORTFOLIO_PAGE } from './portfolio-types.ts'

// ------------------------------------------------------------------------------------
// INTERFACES 
// ------------------------------------------------------------------------------------
export interface ContentState {

}


export interface ProjectState {
	contentIndex: number
	// Probably some more info like text index, etc
	contentState: ContentState[]
}

export interface NavigationState {
	categories: number
	pageStateIndex: number
	pageStateArr: number[],
	projectStateArr: ProjectState[]
	modified: false
}

// ------------------------------------------------------------------------------------
// NavigationTracker
// ------------------------------------------------------------------------------------
// NavigatorTracker just keeps track of every button pressed regarding the portfolio state
export class NavigationTracker {
	#navigationState: NavigationState
	#portfolioDataArr: PortfolioData[]
	#availableProjectIndices: number[]

	constructor(portfolioDataArr: PortfolioData[]) {
		this.#portfolioDataArr = portfolioDataArr
		this.#navigationState = this.#createNavigationState(portfolioDataArr)
	}

// ------------------------------------------------------------------------------------
// GETTERS 
// ------------------------------------------------------------------------------------
	getCurrentPageStateIndex() {
		return this.#navigationState.pageStateIndex
	}

	getCurrentCategories() {
		return this.#navigationState.categories
	}

	getCurrentProjectIndex() { return this.#navigationState.pageStateArr[this.#navigationState.pageStateIndex] }

	// Call this every time the categories get adjusted
	#getProjectStateIndicesForCategories(portfolioDataArr: PortfolioData[], categories: number): number[] {
		let indicesArr = []
		for(let i = 0; i < portfolioDataArr.length; ++i) {
			if ((portfolioDataArr[i].categories & categories) > 0) {
				indicesArr.push(i)
			}
		}
		return indicesArr
	}


// ------------------------------------------------------------------------------------
// FUNCTIONS
// ------------------------------------------------------------------------------------
	#createNavigationState(portfolioDataArr: PortFolioData[]) {
		const projectStateArr: ProjectState[] = new Array(portfolioDataArr.length)
		for(let i = 0; i < portfolioDataArr.length; ++i) {
			// TODO: Whether or not to include the content level of navigation
			// Pros: It allows for context sensitive images to be paired with text
			projectStateArr[i] = {
				contenxIndex: 0,
			}
		}

		// Ensure there is always an entry by filling it with 0
		const pageStateArr: PageState = new Array(PORTFOLIO_PAGE_NAMES.length).fill(0)
		for(let i = 0; i < pageStateArr.length; ++i) {
			// Find the first valid portfolio for required categories
			for(let j = 0; j < portfolioDataArr.length; ++j) {
				if (portfolioDataArr[j].categories & CATEGORIES_FOR_PORTFOLIO_PAGE[i]) {
					pageStateArr[i] = j
					break
				}
			}
		}

		const startPageIndex = 0
		const navigationState: NavigationState = {
			// All categories are on by default
			categories: -1,
			pageStateIndex: startPageIndex,
			pageStateArr: pageStateArr,
			projectStateArr: projectStateArr,
			availableProjectIndices: this.#getProjectStateIndicesForCategories(portfolioDataArr, pageStateArr[startPageIndex].categories),
		}
		return navigationState
	}

	// When called returns current modified, then sets modified to false.
	// Instead of listeners, this allows for a simple check if the nav has been modified and function to be called
	// depending on the state.
	resolveIfModified(): bool {
		const prevModified = !!this.#navigationState.modified
		this.#navigationState.modified = false
		return prevModified
	}
	
	setPageStateIndex(pageIndex: number): void {
		this.#navigationState.pageStateIndex = pageIndex % PORTFOLIO_PAGE_NAMES.length
		// REPLACE 0 with valid data!
		this.#availableProjectIndices = this.#getProjectStateIndicesForCategories(this.#portfolioDataArr, 0)
		this.setProjectStateIndex(this.#navigationState.pageStateArr[pageIndex])
		console.log(`Set page to ${PORTFOLIO_PAGE_NAMES[pageIndex]}`)
		this.#navigationState.modified = true
	}

	enableCategories(categories: number, enable: ENABLE_STATE): void {
		// Filter to only modify allowed categories based on page
		const updatedCategories = (pageState.categories & ~categories) | (-enable & categories)
		this.#navigationState.categories = updatedCategories
		this.#navigationState.modified = true
	}

	toggleCategory(index: number): void {
		const updatedCategories = this.#navigationState.categories ^ (1 << index)
	        this.#navigationState.categories = updatedCategories
		this.#navigationState.modified = true
	}

	setProjectStateIndex(projectIndex: number) {
		this.#navigationState.pageStateArr[this.#navigationState.pageStateIndex] = projectIndex
		console.log(`Set project to ${this.#portfolioDataArr[projectIndex].title}`)
		this.#navigationState.modified = true
	}

	setProjectTextIndex(textIndex: number) {
		this.#navigationState.modified = true
	}
}
