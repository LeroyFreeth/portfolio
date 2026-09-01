import loot_vr_a from '/images/loot-vr/loot-vr-a.webp'
import loot_vr_b from '/images/loot-vr/loot-vr-b.webp'
import loot_vr_c from '/images/loot-vr/loot-vr-c.webp'
import loot_vr_d from '/images/loot-vr/loot-vr-d.webp'
import loot_vr_e from '/images/loot-vr/loot-vr-e.webp'

import moyosa_spaces_a from '/images/moyosa-spaces/spaces-a.webp'
import moyosa_spaces_b from '/images/moyosa-spaces/spaces-b.webp'
import moyosa_spaces_c from '/images/moyosa-spaces/spaces-c.webp'
import moyosa_spaces_d from '/images/moyosa-spaces/spaces-d.webp'

import m_n_m_s_a from '/images/m&m-color-match/m-m-a.webp'
import m_n_m_s_b from '/images/m&m-color-match/m-m-b.webp'
import m_n_m_s_c from '/images/m&m-color-match/m-m-c.webp'

import adidas_a from '/images/8th-wall/8th-wall-a.webp'
import adidas_b from '/images/8th-wall/8th-wall-b.webp'
import adidas_c from '/images/8th-wall/8th-wall-c.webp'

import brighter_future_a from '/images/brighter-future/brighter-future-a.webp'
import brighter_future_b from '/images/brighter-future/brighter-future-b.webp'

import gary_james_mcqueen_a from '/images/gary-james-mcqueen/gary-james-mcqueen-a.webp'
import gary_james_mcqueen_b from '/images/gary-james-mcqueen/gary-james-mcqueen-b.webp'
import gary_james_mcqueen_c from '/images/gary-james-mcqueen/gary-james-mcqueen-c.webp'
import gary_james_mcqueen_d from '/images/gary-james-mcqueen/gary-james-mcqueen-d.webp'

import hornsteinn_a from '/images/hornsteinn/hornsteinn-a.webp'
import hornsteinn_b from '/images/hornsteinn/hornsteinn-b.webp'

import number_1 from '/images/numbers/1.webp'
import number_2 from '/images/numbers/2.webp'
import number_3 from '/images/numbers/3.webp'
import number_4 from '/images/numbers/4.webp'
import number_5 from '/images/numbers/5.webp'
import number_6 from '/images/numbers/6.webp'
import { ColorConversion } from '../colors/converters'

type PortfolioData = {
	name: string
	image_url_arr: string[],
	title: string,
	pages: string[],
	links: LinkData[],
	video: VideoLinkData,
	roles: string[],
	tags: string[],
	color_palette: number[],
	span_x: number,
	span_y: number,
}

type LinkData = {
	url: string,
	text: string,
}

type VideoLinkData = {
	preview_image: string,
	url: string,
}

const portfolio_debug = false

const about_data: PortfolioData = {

	name: 'help',
	image_url_arr: [],
	title: 'Portfolio - Leroy Freeth',
	pages: ['Welcome to my portfolio!', `
	<svg class="dynamic-color-a" width="48px" height="48px" viewBox="0 0 48 48"
					xmlns="http://www.w3.org/2000/svg">
					<title>comment-help-solid</title>
					<g id="Layer_2" data-name="Layer 2">
						<g id="invisible_box" data-name="invisible box">
							<rect width="48" height="48" fill="none" />
						</g>
						<g id="icons_Q2" data-name="icons Q2">
							<path
								d="M42,4H6A2,2,0,0,0,4,6V42a2,2,0,0,0,2,2,2,2,0,0,0,1.4-.6L15.2,36H42a2,2,0,0,0,2-2V6A2,2,0,0,0,42,4ZM26,28.4c-.1.1-.1.2-.2.4s-.1.2-.1.3l-.3.3a1.9,1.9,0,0,1-2.8,0l-.3-.3c0-.1-.1-.2-.1-.3s-.1-.3-.2-.4V28a2,2,0,0,1,.6-1.4,1.9,1.9,0,0,1,2.8,0A2,2,0,0,1,26,28Zm.8-5.5h-.4l-1.1.5A1.9,1.9,0,0,1,24,24a1.6,1.6,0,0,1-1.3-.6,1.9,1.9,0,0,1-.1-2.8,6.4,6.4,0,0,1,2.2-1.2l.3-.2a2.6,2.6,0,0,0,1.8-2.9A3,3,0,0,0,24.6,14a3.3,3.3,0,0,0-3.3,1.5,1.9,1.9,0,0,1-2.7.8,2.1,2.1,0,0,1-.8-2.7,7.2,7.2,0,0,1,7.6-3.5,7.1,7.1,0,0,1,5.5,5.4A6.8,6.8,0,0,1,26.8,22.9Z" />
						</g>
					</g>
				</svg>

You can drag the cube to rotate it. Rotate it up and down to - Or go to the projects page in the side bar - to switch between projects. Rotate left and right to see some more pictures from that portfolio piece.</br></br>You also have some tools to view the images. You can pinch/scroll to zoom and use a double finger swipe or middle mouse button to pan. Double click to reset the images.
`],
	links: [],
	video: { preview_image: '', url: '' },
	roles: [],
	tags: [],
	color_palette: [0xC696BC, 0x8B5D89, 0x5A4262, 0x1A213E, 0x7A527C],
	span_x: 0,
	span_y: 0,
}


const portfolio_data_arr: PortfolioData[] = [
	{
		name: 'default',
		image_url_arr: [],
		title: 'default',
		pages: [],
		links: [],
		video: { preview_image: '', url: '' },
		roles: [],
		tags: [],
		color_palette: [0xC696BC, 0x8B5D89, 0x5A4262, 0x1A213E, 0x7A527C],
		span_x: 0,
		span_y: 0,
	},
	{
		name: 'lootvr',
		image_url_arr: [loot_vr_a, loot_vr_b, loot_vr_c, loot_vr_d, loot_vr_e],
		title: 'Loot VR',
		pages: ['VR Project for the Mauritshuis.', 'Three artifacts within the exposition got a VR experience which transports the user back in time to a important scenario in the artifacts lifecycle.',
			`I was the main developer on this project. This included implementing the scenes, animations. In addition, we needed to create an anchor system to make the 'VR' behave like 'AR', keeping its world position relative to the room/lighthouses. Each scene had its own set of challenges, such as instancing a crowd, volumetric lighting performance issues within VR or lining up the VR walk path without physical risks at the musuem for players and priceless artifacts.`],
		links: [{
			url: 'https://www.mauritshuis.nl/en/press/presskit-loot-10-stories',
			text: '> Mauritshuis presskit <'
		}],
		video: {
			preview_image: 'https://img.youtube.com/vi/qjM6aDaAKU4/sddefault.jpg',
			url: 'https://www.youtube.com/embed/qjM6aDaAKU4?autoplay=1&mute=1',
		},
		roles: ['developer'],
		tags: ['vr', 'museum', 'hdrp', 'unity'],
		color_palette: [0xC696BC, 0x8B5D89, 0x5A4262, 0x1A213E, 0x7A527C],
		span_x: 2,
		span_y: 2,
	},
	{
		name: 'moyosa-spaces',
		image_url_arr: [moyosa_spaces_a, moyosa_spaces_b, moyosa_spaces_c, moyosa_spaces_d],
		title: 'Moyosa spaces',
		pages: ['Virtual environments on the web, such as museums.', 'They consist of tiled high resolution cubemaps which load higher resolution tiles based on zoom levels. Users can navigate through the gallery using predefined waypoints. Some galleries were created with <a href="https://krpano.com/home/">Krpano</a>. Newer galleries were created with <a href="https://www.babylonjs.com">BabylonJs</a> and <a href="https://lastolivegames.github.io/becsy/guide/introduction">Becsy</a>',
			'In addition to the galleries themselves, my role was to automate the gallery pipeline. Galleries were initially setup in Unreal. Therefore tools were created to export as much as possible from the Unreal scene to the web version. This includes waypoint positions, default interactions and tile paths.<br><br>I also sometimes made some promo material, such as the video below.'],
		links: [{
			url: 'https://argento-gallery.nl',
			text: '> Argento Gallery <'
		},
		{
			url: 'https://virtualmuseum.thekremercollection.com/',
			text: '> Kremer Collection Gallery <'

		},
		{
			url: 'https://masterpieces.feadship.nl',
			text: '> Feadship Gallery <'
		}],

		video: {
			preview_image: 'https://img.youtube.com/vi/XJgPGOnooQ8/sddefault.jpg',
			url: 'https://www.youtube.com/embed/XJgPGOnooQ8?autoplay=1&mute=1',
		},
		roles: ['developer', 'camera'],
		tags: ['babylonjs', 'ecs', 'unreal', 'krpano'],
		color_palette: [0xA9B4C2, 0x5E6572, 0xEEF1EF, 0x1C2321, 0x7D98A1],

		span_x: 2,
		span_y: 1,
	},
	{
		name: 'm&m-color-match',
		image_url_arr: [m_n_m_s_a, m_n_m_s_b, m_n_m_s_c],
		title: 'M&M Color Match',
		pages: ['Local multiplayer pop the bubbles game! Running live in M&M stores.',
			'Includes leaderboards and the likes.'],
		links: [],
		video: {
			preview_image: '',
			url: '',
		},
		roles: ['developer'],
		tags: ['unity', 'local-multiplayer'],
		// TODO: Could bake these
		color_palette: [
			ColorConversion.hex_desaturate(0xD80C0A, 0.3),
			ColorConversion.hex_desaturate(0x1578E1, 0.3),
			ColorConversion.hex_desaturate(0xEEDFD2, 0.3),
			ColorConversion.hex_desaturate(0x33B55F, 0.3),
			ColorConversion.hex_desaturate(0x8CCCFB, 0.3)],
		span_x: 1,
		span_y: 1,
	},
	{
		name: '8th-wall-ar',
		image_url_arr: [adidas_a, adidas_b, adidas_c],
		title: '8th wall AR projects',
		pages: ['AR experiences, including the Soccer World Championship 2024 Giants campaign.', 'Users use AR on their phones to the see their legends come to life! Additionaly toblerone AR tiny messages web application and I have alsohelped making marketing applications for Sony as shown in the video blow.'],
		links: [{
			url: 'https://www.8thwall.com/moyosamedia/adidas-giants',
			text: '> Link to 8thwall <'
		}],
		video: {
			preview_image: adidas_a,
			url: 'https://www.youtube.com/embed/HrNJ-eWNN70?autoplay=1&mute=1',
		},
		roles: ['developer'],
		tags: ['8th-wall', 'babylonjs', 'three-js', 'a-frame', 'ar'],
		color_palette: [0x09070F, 0x5E293A, 0xBDB7A5, 0x672E21, 0x0F0F16],

		span_x: 1,
		span_y: 2,
	},
	{
		name: 'brighter-future',
		image_url_arr: [brighter_future_a, brighter_future_b],
		title: 'Brighter Future',
		pages: ['VR hub in which users can view several 360 videos for innovative projects.', 'Made both an Unreal and Unity version. Includes some visual trickery, such as a portal to the 360 videos.'],
		links: [{
			url: 'https://surroundvision.com/portfolio/a-brighter-future-vr-showcase/',
			text: '> Link to client page for Brighter Future <'
		}],
		video: {
			preview_image: 'https://img.youtube.com/vi/q26FZRqivOI/sddefault.jpg',
			url: 'https://www.youtube.com/embed/q26FZRqivOI?autoplay=1&mute=1',
		},
		roles: ['developer', 'animator'],
		tags: ['vr', 'meta quest', 'unity', '360 video'],
		color_palette: [0x302E2F, 0x897A6A, 0x3C3F2D, 0x676360, 0xC0C7C4],

		span_x: 1,
		span_y: 1,
	},
	{
		name: 'hornn-stein',
		image_url_arr: [hornsteinn_a, hornsteinn_b],
		title: 'Hornnstein',
		pages: ['Virtual driveway preview', 'Web-application in which users virtually enhance their driveways to preview purchasable products.'],
		links: [{
			url: 'https://teikniforrit.bmvalla.is',
			text: '> Try it live <'
		}],
		video: {
			preview_image: 'https://img.youtube.com/vi/e2j4cSlgAQw/sddefault.jpg',
			url: 'https://www.youtube.com/embed/e2j4cSlgAQw?autoplay=1&mute=1',
		},
		roles: ['developer'],
		tags: ['vue', 'web'],
		color_palette: [0x3B3E3E, 0xA7A29A, 0xF8F7F7, 0xDF4247, 0x3D748E],

		span_x: 1,
		span_y: 1,
	},
	{
		name: 'gary-james-mcqueen',
		image_url_arr: [gary_james_mcqueen_a, gary_james_mcqueen_b, gary_james_mcqueen_c, gary_james_mcqueen_d],
		title: 'Gary James Mcqueen',
		pages: ['Digital fashion show created in Unreal4.', `Developped in Unreal 4 using mocap, alembics and lots of sequences and shader adjustments to suit the creative needs. In addition, I was the sole 'virtual cameraman'.`],
		links: [],
		video: {
			preview_image: 'https://img.youtube.com/vi/_7y0qbs71Ec/sddefault.jpg',
			url: 'https://www.youtube.com/embed/_7y0qbs71Ec?autoplay=1&mute=1',
		},
		roles: ['developer', 'digital cinematographer'],
		tags: ['Unreal4', 'cinematography', 'alembic files', 'motion-capture'],
		color_palette: [0x584217, 0x6A5730, 0x524B44, 0x72695B, 0x776F66],

		span_x: 1,
		span_y: 1,
	},
	{
		name: 'virtual-web-experiences',
		image_url_arr: [
			'https://img.youtube.com/vi/kvYqzXtXyZM/sddefault.jpg',
			'https://img.youtube.com/vi/MGgK1eajwG0/sddefault.jpg',
			'https://img.youtube.com/vi/c9XTAECALEM/sddefault.jpg',
			'https://img.youtube.com/vi/NODhd16X4ck/sddefault.jpg',
		],
		title: 'Virtual Web Spaces',
		pages: ['Custom build digital web spaces', `Each website served as a visual hub which allowed users to explore a brand, vision or even dark moments in our history.`],
		links: [
			{
				url: 'https://www.youtube.com/watch?v=kvYqzXtXyZM',
				text: '> Johnnie Walker - Future cities (Youtube) <',
			},
			{
				url: 'https://www.youtube.com/watch?v=c9XTAECALEM',
				text: '> Westerbork Moreel Doolhof (Youtube) <',
			},
			{
				url: 'https://www.youtube.com/watch?v=NODhd16X4ck',
				text: '> Rembrandt Huis (Youtube) <',
			},
		],
		video: {
			preview_image: 'https://img.youtube.com/vi/MGgK1eajwG0/sddefault.jpg',
			url: 'https://www.youtube.com/embed/MGgK1eajwG0?autoplay=1&mute=1',
		},
		roles: ['developer', 'digital cinematographer'],
		tags: ['Unreal4', 'cinematography', 'alembic files', 'motion-capture'],
		color_palette: [0x683643, 0x249EA4, 0x253947, 0x202136, 0x7FD0E2],

		span_x: 1,
		span_y: 1,
	},
]

if (portfolio_debug) {
	const debug_portfolio_data: PortfolioData = {
		name: 'test',
		image_url_arr: [number_1, number_2, number_3, number_4, number_5, number_6,],
		title: 'test',
		pages: ['Some numbers'],
		links: [{
			url: 'https://google.com',
			text: '> link <'
		}],
		video: {
			preview_image: '',
			url: '',
		},
		roles: ['developer'],
		tags: ['vue', 'web'],
		color_palette: [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0x00FFFF],
		span_x: 1,
		span_y: 1,
	}
	portfolio_data_arr.push(debug_portfolio_data)
}

export { about_data, portfolio_data_arr }
export type { PortfolioData }


