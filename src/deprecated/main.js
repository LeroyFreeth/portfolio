import '../styles/style.css'; 
import { NavigationTracker  } from './navigation-tracker.ts'
import { portfolioDataArr } from './portfolio-data.ts'
import { PORTFOLIO_PAGE_NAMES, PORTFOLIO_CATEGORY_NAMES, CATEGORIES_FOR_PORTFOLIO_PAGE } from './portfolio-types.ts'
import { initUi, updateUi } from './ui.ts'
import { animateScene, triggerTransitionTo, setContent } from './scene-manager.ts'

// Populate nav bar with pages
const nav = new NavigationTracker(portfolioDataArr)
initUi(nav, portfolioDataArr)
updateUi()

let previousTime = Date.now()
function gameLoop() {
    	requestAnimationFrame(gameLoop);

	const currentTime = Date.now()
	const delta = currentTime - previousTime
	previousTime = currentTime

	if (nav.resolveIfModified()) {	
		triggerTransitionTo(nav.getCurrentPageStateIndex())
		setContent(portfolioDataArr[nav.getCurrentProjectIndex()])
	}
	animateScene(delta)
}
gameLoop()
