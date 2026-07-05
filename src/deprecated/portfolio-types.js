export interface LinkData {
	url: string
	text: string
}

export interface VideoLinkData {
	url: string
	previewImage: string
}

export interface PortfolioContent {
	text: string
	images: string[]
	links: LinkData[] | null
	videoLinks: VideoLinkData[] | null
}

export interface PortfolioData {
	title: string
	categories: number // More flags
	contentArr: PortfolioContent[]
	colorPalette: number[]
}

export const PORTFOLIO_CATEGORY_NAMES = [ 
	'Hardware',  // 0
	'Embedded', // 1
	'Software', // 2
	'Game', // 3
	'LED', // 4
	'Fire', // 5
]
export enum PORTFOLIO_CATEGORY {
	HARDWARE = 1 << 0,
	EMBEDDED = 1 << 1,
	SOFTWARE = 1 << 2,
	GAME = 1 << 3,
	LED = 1 << 4,
	FIRE = 1 << 5,
}

export const PORTFOLIO_PAGE_NAMES = [ 
	'Freethware', // 0
	'Freethstyle', // 1
]
export const CATEGORIES_FOR_PORTFOLIO_PAGE = [
	PORTFOLIO_CATEGORY.HARDWARE | PORTFOLIO_CATEGORY.EMBEDDED | PORTFOLIO_CATEGORY.SOFTWARE| PORTFOLIO_CATEGORY.GAME | PORTFOLIO_CATEGORY.LED,
	PORTFOLIO_CATEGORY.HARDWARE | PORTFOLIO_CATEGORY.EMBEDDED | PORTFOLIO_CATEGORY.LED | PORTFOLIO_CATEGORY.FIRE,
]

export enum  ENABLE_STATE {
	DISABLED = 0,
	ENABLED = 1,
}

