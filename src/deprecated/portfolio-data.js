import type { PortfolioData } from './portfolio-types.ts'
import { PORTFOLIO_CATEGORY } from './portfolio-types.ts' 

import imageA from '../assets/images/loot-vr/loot-vr-a.webp'
import imageB from '../assets/images/loot-vr/loot-vr-b.webp'

export const portfolioDataArr: PortfolioData = [
	{
		title: 'Example',
		hue: 0.5,
		categories: PORTFOLIO_CATEGORY.SOFTWARE | PORTFOLIO_CATEGORY.GAME,
		contentArr: [
			{
				text: 'Lores Ipsum',
				images: [imageA, imageB], 
				links: [{
					url: 'https://www.mauritshuis.nl/en/press/presskit-loot-10-stories',
					text: '> Mauritshuis presskit <'
				}],
				videoLinks: [{
					url: 'https://www.youtube.com/embed/qjM6aDaAKU4?autoplay=1&mute=1',
					preview_image: 'https://img.youtube.com/vi/qjM6aDaAKU4/sddefault.jpg',
				}]
			},
		]
	},
	{
		title: 'Example2',
		hue: 0.1,
		categories: PORTFOLIO_CATEGORY.LED | PORTFOLIO_CATEGORY.GAME,
		contentArr: [
			{
				text: 'Lores Ipsum',
				images: ['image_a', 'image_b'], 
				links: [{
					url: 'https://www.mauritshuis.nl/en/press/presskit-loot-10-stories',
					text: '> Mauritshuis presskit <'
				}],
				videoLinks: [{
					url: 'https://www.youtube.com/embed/qjM6aDaAKU4?autoplay=1&mute=1',
					preview_image: 'https://img.youtube.com/vi/qjM6aDaAKU4/sddefault.jpg',
				}]
			},
		]
	}
]


