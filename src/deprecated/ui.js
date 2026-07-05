import { NavigationTracker  } from './navigation-tracker.ts'
import { portfolioDataArr } from './portfolio-data.ts'
import { PORTFOLIO_PAGE_NAMES, PORTFOLIO_CATEGORY_NAMES, CATEGORIES_FOR_PORTFOLIO_PAGE } from './portfolio-types.ts'

// There can only be one ui
//

const uiData = {
	portfolioDataArr: null,
	navigationTracker: null,
	sceneManager: null,
	pageButtonArr: [],
	categoriesButtonArr: [],
	projectButtonArr: [],
	usedCategories: 0,
}

export function initUi(navigationTracker: NavigationTracker, portfolioDataArr: PortfolioDataArr[]) {
	uiData.portfolioDataArr = portfolioDataArr
	uiData.navigationTracker = navigationTracker

	const navigationContainerEl = document.getElementById('pages')
	const pageButtonArr = new Array(PORTFOLIO_PAGE_NAMES.length)
	for(let i = 0; i < PORTFOLIO_PAGE_NAMES.length; ++i) {
		const button = document.createElement('button')
		button.classList.add('page-btn')
		button.textContent = PORTFOLIO_PAGE_NAMES[i]

		button.addEventListener('click', () => {
			const button = pageButtonArr[i]
			if (button.classList.contains('active')) return
			navigationTracker.setPageStateIndex(i)
			updateUi()
		})

		pageButtonArr[i] = button
		navigationContainerEl.appendChild(button)
	}
	uiData.pageButtonArr = pageButtonArr

	// Populate categories
	const categoriesContainerEl = document.getElementById(categories')
	const categoriesButtonArr = new Array(PORTFOLIO_CATEGORY_NAMES.length)
	for(let i = 0; i < PORTFOLIO_CATEGORY_NAMES.length; ++i) {
		const button = document.createElement('button')
		button.classList.add('page-btn')
		button.textContent = PORTFOLIO_CATEGORY_NAMES[i]

		button.addEventListener('click', () => {
			navigationTracker.toggleCategory(i)
			updateUi()
		})
		categoriesButtonArr[i] = button
		categoriesContainerEl.appendChild(button)

	}
	uiData.categoriesButtonArr = categoriesButtonArr 

	// Used categories filter out categories not used by projects
	let usedCategories: number = 0
	const projectsContainsEl = document.getElementById('projects')
	const projectButtonArr = new Array(portfolioDataArr.length)
	for(let i = 0; i < portfolioDataArr.length; ++i) {
		const portfolioData = portfolioDataArr[i]
		usedCategories |= portfolioData.categories

		const button = document.createElement('button')
		button.classList.add('page-btn')
		button.textContent = portfolioData.title

		button.addEventListener('click', () => {
			navigationTracker.setProjectStateIndex(i)

	
			updateUi()
		})
		projectButtonArr[i] = button
		projectsContainsEl.appendChild(button)
	}
	uiData.projectButtonArr = projectButtonArr
	uiData.usedCategories = usedCategories
}

function updatePageButtons(pageStateIndex: number): void {
	for(let i = 0; i < uiData.pageButtonArr.length; ++i) {
		const button = uiData.pageButtonArr[i]
		if (pageStateIndex == i) {
			button.classList.add('active')
			continue
		}
		button.classList.remove('active')
	}
}

function updateCategoryButtons(pageStateIndex: number, categories: number): void {
	const validCategories = CATEGORIES_FOR_PORTFOLIO_PAGE[pageStateIndex] & uiData.usedCategories
	for(let i = 0; i < uiData.categoriesButtonArr.length; ++i) {
		const button = uiData.categoriesButtonArr[i]
		if ((validCategories & (1 << i)) === 0) {
			button.style.display = 'none'
			continue
		}
		button.style.display = 'block'
		if ((categories & (1 << i)) > 0) button.classList.add('active')
		else button.classList.remove('active')

	}
}

function updateProjectButtons(pageStateIndex: number, categories: number, projectIndex: number): void {
	const validCategories = CATEGORIES_FOR_PORTFOLIO_PAGE[pageStateIndex] & uiData.usedCategories & categories
	for(let i = 0; i < uiData.projectButtonArr.length; ++i) {
		const button = uiData.projectButtonArr[i]
		if((uiData.portfolioDataArr[i].categories & validCategories) === 0) {
			if (projectIndex === i) button.classList.add('disabled')
			else { 
				button.style.display = 'none'
				continue
			}
		}
		else {
			button.style.display = 'block'
			button.classList.remove('disabled')
		}

		if (i == projectIndex) button.classList.add('active')
		else button.classList.remove('active')
	}
}

export function updateUi(): void {
	const pageStateIndex = uiData.navigationTracker.getCurrentPageStateIndex()	
	const categories = uiData.navigationTracker.getCurrentCategories()	
	const projectIndex = uiData.navigationTracker.getCurrentProjectIndex()	
	updatePageButtons(pageStateIndex)
	updateCategoryButtons(pageStateIndex, categories)
	updateProjectButtons(pageStateIndex, categories, projectIndex)
}


