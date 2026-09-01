import { Environment3d } from './environment_3d'
import { State, Statemachine } from './statemachine/statemachine'
import { StateGridMenu, type GridData } from './statemachine/states/state_menu'
import { StateView } from './statemachine/states/state_view'
import { ColorPaletteUtils } from './colors/color-palette'
import { PortfolioDataManager } from './portfolio/portfolio-data-manager'
import { about_data, portfolio_data_arr, type PortfolioData } from './portfolio/portfolio-data'

import { Animator, OutOfBounds, type AnimationClip } from './animator/animator'
import { EASE_TYPE } from './math/easings'

enum CssClasses {
	HIDE = 'hide',
	ORDER = 'order',
}

// Start with the help active to onboard new users
let help_active = true
let start_portfolio_idx = 0
// Or adjust according to the hash used for sharing to set the matching portfolio entry
for (let i = 0; i < portfolio_data_arr.length; i++) {
	const data_id = window.location.hash.replace('#', '')
	const data = portfolio_data_arr[i]
	if (data.name === data_id) {
		start_portfolio_idx = i
		help_active = false
	}
}

// Keeps track of the current porfolio item
const portfolio_data_manager = new PortfolioDataManager(portfolio_data_arr)

/* -----------------------------------------------------------------------------
	§§ 1. DOM ELEMENTS 
----------------------------------------------------------------------------- */

// Fetch DOM elements
const container = document.getElementsByClassName('container')[0] as HTMLElement
const canvas = document.getElementById('canvas') as HTMLCanvasElement
const focus = document.getElementById('focus') as HTMLElement
const projects_btn = document.getElementById('projects-button') as HTMLButtonElement
const help = document.getElementById('help') as HTMLButtonElement

const drag_icon = focus.querySelector('.drag-icon') as SVGElement

const info_container = document.getElementById('info') as HTMLElement
const info_title = info_container.querySelector('#info h2') as HTMLElement
const info_description = info_container.querySelector('#info #description') as HTMLElement
const links_container = info_container.querySelector('.links')
const tags_container = info_container.querySelector('.tags')
const video_aspect_ratio = info_container.querySelector('.aspect-ratio') as HTMLElement
let i_frame_element = info_container.querySelector('iframe') as HTMLIFrameElement
const preview_img = info_container.querySelector('img ') as HTMLImageElement

// Setup color changes 
const color_id_arr = [
	'--color-a',
	'--color-b',
	'--color-c',
	'--color-d',
	'--color-e',
]
const dynamic_colors = [
	document.getElementsByClassName('dynamic-color-a') as HTMLCollectionOf<HTMLElement>,
	document.getElementsByClassName('dynamic-color-b') as HTMLCollectionOf<HTMLElement>,
	document.getElementsByClassName('dynamic-color-c') as HTMLCollectionOf<HTMLElement>,
	document.getElementsByClassName('dynamic-color-d') as HTMLCollectionOf<HTMLElement>,
	document.getElementsByClassName('dynamic-color-e') as HTMLCollectionOf<HTMLElement>,
] as HTMLCollectionOf<HTMLElement>[]

// Quick, dirty check
const element_arr = [container, canvas, focus, help, projects_btn, video_aspect_ratio, i_frame_element, preview_img, links_container, tags_container, drag_icon]
for (const el of element_arr) {
	if (!el) console.error('Missing an element')
}

// Setup links and tags DOM Elements
let max_links = 0
let max_tags = 0
for (const portfolio_data of portfolio_data_arr) {
	if (max_links < portfolio_data.links.length) max_links = portfolio_data.links.length
	if (max_tags < portfolio_data.tags.length) max_tags = portfolio_data.tags.length
}

const links: HTMLAnchorElement[] = new Array(max_tags)
for (let i = 0; i < max_links; ++i) {
	const list_element = document.createElement('li')
	const a_element = document.createElement('a')
	list_element.classList.add('padded')
	list_element.appendChild(a_element)
	links_container?.appendChild(list_element)
	links[i] = a_element
}

const tags = new Array(max_tags)
for (let i = 0; i < max_tags; ++i) {
	const list_element = document.createElement('li')
	const blockquote_element = document.createElement('blockquote')
	list_element.appendChild(blockquote_element)
	tags_container?.appendChild(list_element)
	tags[i] = blockquote_element
}

/* -----------------------------------------------------------------------------
	§§ 2. COLORS 
----------------------------------------------------------------------------- */

const color_count = color_id_arr.length
const colors_from = new Array(color_count)
const colors_to = new Array(color_count)
const colors_current = new Array(color_count)
// Set start colors
const start_palette = portfolio_data_manager.get_portfolio_data_arr()[start_portfolio_idx].color_palette
for (let i = 0; i < color_count; ++i) {
	const color = start_palette[i]
	colors_from[i] = color
	colors_to[i] = color
	colors_current[i] = color
}

/* -----------------------------------------------------------------------------
	§§ 3. STATES 
----------------------------------------------------------------------------- */

// Conversion from portfolio_data to grid_data
const grid_data_arr: GridData[] = new Array(portfolio_data_arr.length)
for (let i = 0; i < grid_data_arr.length; ++i) {
	const portfolio_data = portfolio_data_arr[i]
	grid_data_arr[i] = {
		img_url: portfolio_data.image_url_arr[0],
		span_x: portfolio_data.span_x,
		span_y: portfolio_data.span_y,
	}
}

// Setup and init states
const state_grid = new StateGridMenu(container, grid_data_arr)
const state_view = new StateView()
const states: State[] = [
	state_grid,
	state_view,
]
const statemachine = new Statemachine(states)


/* -----------------------------------------------------------------------------
	§§ 4. ANIMATIONS 
----------------------------------------------------------------------------- */

const clip_color = { start: 0, end: 1, duration_ms: 1000, ease: EASE_TYPE.LINEAR } as AnimationClip<number>
const lerp_color = (start: number, end: number, t: number) => { return start + (end - start) * t }


// Setup the animator
const clip_sentence = { start: 'Hello, ', end: 'world!', duration_ms: 1500, ease: EASE_TYPE.IN_OUT_QUAD } as AnimationClip<string>

// Create a small animation which lerps text as if previous text gets erased and new text gets typed
const sencente_el = document.getElementById('sentence') as HTMLElement
const lerp_sentence = (start: string, end: string, t: number) => {
	const interval = 1 / (start.length + end.length)
	const i = Math.floor(t / interval)

	const start_i = Math.max(0, Math.min(start.length, i))
	const start_string = start.split('')
	start_string.splice(start.length - start_i, start_i)


	const end_i = Math.max(0, Math.min(end.length, i - start_i))
	const end_string = end.split('')
	end_string.splice(end_i, end.length - end_i)
	start_string.push(...end_string)
	start_string.push('|')
	// for (let i = start_string.length; i <= end.length; ++i) {
	// 	start_string.push('\u00A0')
	// }
	const result = start_string.join('')
	sencente_el.innerText = result
	return result
}
// Animating cursor using the text pipe character
const clip_cursor = { start: '\u00A0', end: '|', duration_ms: 1000, ease: EASE_TYPE.LINEAR } as AnimationClip<string>
const lerp_cursor = (start: string, end: string, t: number): string => {
	const s = sencente_el.innerText.split('')
	s[s.length - 1] = t < 0.5 ? start : end
	sencente_el.innerText = s.join('')
	return sencente_el.innerText
}

const animator = new Animator()
animator.add(clip_color, lerp_color, OutOfBounds.HOLD)
animator.add(clip_sentence, lerp_sentence, OutOfBounds.HOLD)
animator.add(clip_cursor, lerp_cursor, OutOfBounds.LOOP)
const text_clip_idx = animator.get_idx(clip_sentence)
const lerp_clip_idx = animator.get_idx(clip_color)

/* -----------------------------------------------------------------------------
	§§ 5. EVENTS/CALLBACKS/BINDINGS 
----------------------------------------------------------------------------- */

// One central place to solve different bindings required for the state change
// I do not want the states to know about their shared objects to avoid conflicts, but also not scatter all the listeners
function state_changed(old_state: State, new_state: State) {
	old_state; // Never used hack
	switch (new_state) {
		case state_grid:
			help.classList.add(CssClasses.HIDE)
			Environment3d.box_to_element(canvas, false)
			clip_sentence.start = ''
			break
		case state_view:
			help.classList.remove(CssClasses.HIDE)
			window.location.hash = portfolio_data_manager.get_portfolio_data().name

			break

	}
}
// Changed hovered grid item
function grid_item_changed(idx: number, item: HTMLElement) {
	Environment3d.box_to_element(item, false)
	portfolio_data_manager.set_idx(idx, false)
	update_box_textures(true)
}
// Store this between events
let row = 0
function update_box_textures(apply_immediately: boolean) {
	const data_arr = portfolio_data_manager.get_portfolio_data_arr()
	const next_url = data_arr[portfolio_data_manager.calc_idx_next()].image_url_arr[0]
	const previous_url = data_arr[portfolio_data_manager.calc_idx_previous()].image_url_arr[0]
	Environment3d.get_illusion().update_target_textures_y(next_url, previous_url, portfolio_data_manager.get_portfolio_data().image_url_arr, ((row % 4) + 4) % 4, apply_immediately)
}
// Rotated the box to a different row
function row_box_changed(r: number) {
	row += r
	statemachine.switch_state(state_view, false)
	portfolio_data_manager.set_idx(portfolio_data_manager.calc_idx_for_offset(r), false)
	update_box_textures(false)
}

// Either:
// 	Changed hovered grid item
// 	Row bow changed
// 	Click home button
// 	(See above)
function portfolio_data_changed(idx: number, portfolio_data: PortfolioData) {
	// Do not broadcast to avoid infinite recursion
	state_grid.set_idx(idx, false)

	// idx 0 acts as a nill, and should not animate
	if (idx === 0) return
	drag_icon.classList.add(CssClasses.HIDE)

	// Change color palette 
	ColorPaletteUtils.set_target(portfolio_data.color_palette, colors_from, colors_to, colors_current)
	animator.rewind_for_idx(lerp_clip_idx)

	apply_portfolio_data(portfolio_data)
}
function apply_portfolio_data(portfolio_data: PortfolioData) {
	// Set title
	info_title.classList.remove('fade-in-left')
	info_title.style.opacity = '0'
	void info_title.offsetWidth
	info_title.classList.add('fade-in-left')

	// Set summary 'typed' text
	animator.clips[text_clip_idx].start = ''
	animator.clips[text_clip_idx].end = portfolio_data.pages[0]
	animator.rewind_for_idx(text_clip_idx)
	info_title.textContent = portfolio_data.title

	// Set paragraph
	info_description.classList.remove('fade-in-paragraph')
	info_description.style.opacity = '0'
	// Force it onto its paragraph child
	if (info_description.firstElementChild)
		info_description.firstElementChild.innerHTML = portfolio_data.pages[1] as string
	void info_description.offsetWidth
	info_description.classList.add('fade-in-paragraph')

	// Set link content
	for (let i = 0; i < max_links; ++i) {
		if (i < portfolio_data.links.length) {
			links[i].classList.remove(CssClasses.HIDE)
			links[i].innerText = portfolio_data.links[i].text
			links[i].href = portfolio_data.links[i].url
			links[i].target = '_blank'
		}
		else links[i].classList.add(CssClasses.HIDE)
	}

	// Set tags
	for (let i = 0; i < max_tags; ++i) {
		const tag = tags[i]
		if (i < portfolio_data.tags.length) {
			tag.innerText = portfolio_data.tags[i]
			tag.classList.remove(CssClasses.HIDE)
		}
		else tag.classList.add(CssClasses.HIDE)
	}

	// Terminate i-frame
	const i_framge_parent = i_frame_element.parentElement;
	if (i_framge_parent) {
		if (i_frame_element.contentWindow) {
			i_frame_element.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*')
			i_frame_element.contentWindow.postMessage('{"method":"pause"}', '*')
		}
		const cloned_i_frame = i_frame_element.cloneNode(false) as HTMLIFrameElement
		cloned_i_frame.removeAttribute('src') // Completely clean state
		cloned_i_frame.classList.add(CssClasses.HIDE)
		i_framge_parent.replaceChild(cloned_i_frame, i_frame_element)
		i_frame_element = cloned_i_frame
	}
	i_frame_element.classList.add(CssClasses.HIDE)
	i_frame_element.removeAttribute('src')
	video_aspect_ratio.classList.add(CssClasses.HIDE)
	preview_img.onclick = () => { }

	// Setup iframe/preview
	const img_url = portfolio_data.video.preview_image
	const video_url = portfolio_data.video.url
	if (img_url && video_url) {
		video_aspect_ratio.classList.remove(CssClasses.HIDE)
		preview_img.parentElement?.classList.remove(CssClasses.HIDE)
		preview_img.src = img_url
		preview_img.onclick = () => {
			preview_img.parentElement?.classList.add(CssClasses.HIDE)
			i_frame_element.src = portfolio_data.video.url
			i_frame_element.classList.remove(CssClasses.HIDE)
			info_container.scrollTo({ top: info_container.scrollHeight })
		}
	}

	info_container.scrollTo(0, 0)

	if (statemachine.get_state() === state_view) {
		window.location.hash = portfolio_data.name
	}
}
statemachine.on_state_changed.addListener(state_changed)
state_grid.on_item_changed.addListener(grid_item_changed)
portfolio_data_manager.on_portfolio_data_changed.addListener(portfolio_data_changed)
Environment3d.get_on_box_row_changed().addListener(row_box_changed)

// Setup buttons
help.addEventListener('click', () => {
	statemachine.switch_state(state_view, false)
	apply_portfolio_data(about_data)
	Environment3d.reset_rotation()
	drag_icon.classList.remove(CssClasses.HIDE)
})
projects_btn.addEventListener('click', () => { statemachine.switch_state(state_grid, false) })

// Can preload all the textures if desired
for (const portfolio_data of portfolio_data_arr) {
	Environment3d.get_illusion().preload(portfolio_data.image_url_arr, Environment3d.get_renderer())
}

/* -----------------------------------------------------------------------------
	§§ 6. TICK/UPDATE LOOP 
----------------------------------------------------------------------------- */

const hex_color = new Array(colors_current.length)
let last_time = 0
function tick() {
	requestAnimationFrame(tick)
	const time = performance.now()
	const delta_ms = (time - last_time)

	last_time = time

	// ...Run systems and objects here
	Environment3d.tick(delta_ms)
	animator.tick(delta_ms)

	// Apply colors
	ColorPaletteUtils.lerp(colors_from, colors_to, colors_current, animator.get_value_for_idx(lerp_clip_idx))
	for (let i = 0; i < dynamic_colors.length; ++i) {
		hex_color[i] = `#${colors_current[i].toString(16)}`
		for (const color of dynamic_colors[i]) {
			color.style.setProperty('--color', hex_color[i])
		}
	}
	Environment3d.set_color_render_clear(colors_current[4])
	Environment3d.set_color_box(colors_current[1])
	// for (const svg of svgs) svg.setAttribute('fill', hex_color[0])

}


/* -----------------------------------------------------------------------------
	§§ 7. FINAL INITIALIZATIONS 
----------------------------------------------------------------------------- */

statemachine.init()
if (help_active) {
	statemachine.switch_state(state_view, false)
	portfolio_data_manager.set_idx(1, true)
	apply_portfolio_data(about_data)
}
else {
	if (start_portfolio_idx > 0) {
		statemachine.switch_state(state_view, false)
		portfolio_data_manager.set_idx(start_portfolio_idx, false)
	} else {
		statemachine.switch_state(state_grid, false)
	}
}
update_box_textures(true)

tick()
