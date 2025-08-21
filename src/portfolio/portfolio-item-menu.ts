import * as THREE from 'three'

import { LoadDependencyHelper } from "../utilities/load-utilities"
import { Timeline } from '../timeline/timeline'
import { OUT_OF_BOUNDS_TYPE, Track, TrackClip } from '../timeline/track'
import { EASE_TYPE } from '../timeline/easings'
import { TimelinePlayer } from '../timeline/timeline-player'
import { CodeEvent } from '../utilities/code-event'
import { portfolio_data_arr, type PortfolioData } from './portfolio-data'
import type { ITickable } from '../three-js/level'


// Css classes used
const rect_image_wrapper_class = 'rect-img-wrapper'
const rect_image_class = 'rect-img'
const circular_class = 'circular'

const pointer_auto_class = 'pointer-auto'
const pointer_none_class = 'pointer-none'


const move_right_class = 'move-up'
const fade_out_class = 'fade-out'
const fader_class = 'fader'
const disabled_class = 'disabled'
const portfolio_item_class = 'portfolio-item'

// Element Ids
const portfolio_item_content_container_id = 'portfolio-item-content-container'
const portfolio_collapser_id = 'portfolio-collapser'
const portfolio_controls_id = 'portfolio-controls'
const top_portfolio_info_id = 'top-portfolio-info'

const enum VISIBILITY {
    TRUE = 'visible',
    FALSE = 'hidden'
}

const enum DISPLAY {
    BLOCK = 'block',
    NONE = 'none'
}

class PortfolioItemMenu implements ITickable {
    _ui_mat: THREE.ShaderMaterial
    _clock: THREE.Clock

    _portfolio_item_arr: HTMLElement[]
    _texture_index: number
    _data_index: number

    _active_item: HTMLElement | null
    _timeline: Timeline
    _timeline_player: TimelinePlayer

    _last_scroll_height: number = 0
    _portfolio_open: boolean

    on_portfolio_enabled_changed: CodeEvent
    on_portfolio_data_changed: CodeEvent

    get ticking(): boolean { return true }
    get timeline(): Timeline { return this._timeline }
    get timeline_player(): TimelinePlayer { return this._timeline_player }

    constructor(uiMat: THREE.ShaderMaterial, clock: THREE.Clock, loaded_callback: () => void) {
        const portfolio_load_helper = new LoadDependencyHelper(portfolio_data_arr.length, () => {
            if (loaded_callback) loaded_callback()
        })
        this._collapse_portfolio_spacing_element(true)
        this._portfolio_item_arr = []
        for (let i = 0; i < portfolio_data_arr.length; i++) {
            const data = portfolio_data_arr[i]

            const portfolio_item_element = PortfolioItemMenu._create_portfolio_item_element(data)
            this._portfolio_item_arr.push(portfolio_item_element)

            const image = portfolio_item_element.querySelector('img') as HTMLImageElement

            // Hover item
            image?.addEventListener('mouseover', () => {
                this._texture_index = 0
                this.set_portfolio_data_for_index(i, false)
            })

            // Click item
            image?.addEventListener('click', () => {
                scrollTo(0, 0)
                this._last_scroll_height = window.scrollY
                this.set_portfolio_data_for_index(i, true)
                this.open_portfolio(true)
            })

            // Load textures
            // TODO: This has to be updated to be a bit smarter for low speed connections
            {
                const l = data.image_url_arr.length
                data.texture_arr = Array(l)
                portfolio_item_element.classList.add(disabled_class)
                const load_helper = new LoadDependencyHelper(data.image_url_arr, () => {
                    portfolio_item_element.classList.remove(disabled_class)
                    portfolio_load_helper.loadedDependency()

                    const data_id = window.location.hash.replace('#', '')
                    const data = portfolio_data_arr[i]
                    if (data.name === data_id) {
                        this.set_portfolio_data_for_index(i, true)
                        this.open_portfolio(true)
                    }
                })

                const texture_loader = new THREE.TextureLoader()
                for (let j = 0; j < l; j++) {
                    const image_url = data.image_url_arr[j]
                    texture_loader.load(image_url, (texture) => {
                        load_helper.loadedDependency(image_url)
                        data.texture_arr[j] = texture


                    })
                }
            }

        }

        const home_button = document.getElementById('home-button')
        home_button?.addEventListener('click', () => {
            this.set_portfolio_data_for_index(-1, false)
            this.open_portfolio(false)
        })

        // Portfolio menu controls
        const return_to_portfolio_button = document.getElementById('return-to-portfolio-button')
        return_to_portfolio_button?.addEventListener('click', (event) => {
            scrollTo(0, this._last_scroll_height)
            this.set_portfolio_data_for_index(-1, false)
            this.open_portfolio(false)

            event.preventDefault()
            window.location.hash = '#home'
        })
        const next_texture_for_item = document.getElementById('prev-texture-button')
        next_texture_for_item?.addEventListener('click', () => {
            this._set_texture_for_index_offset(-1)
            this._ui_mat.uniforms._set_texture_time.value = this._clock.getElapsedTime()
        })
        const prev_texture_for_item = document.getElementById('next-texture-button')
        prev_texture_for_item?.addEventListener('click', () => {
            this._set_texture_for_index_offset(1)
            this._ui_mat.uniforms._set_texture_time.value = this._clock.getElapsedTime()
        })
        const next_item = document.getElementById('prev-item-button')
        next_item?.addEventListener('click', () => {
            // Display order leads
            this.set_portfolio_data_for_index((this._data_index + portfolio_data_arr.length - 1) % portfolio_data_arr.length, true)
            this._ui_mat.uniforms._set_texture_time.value = this._clock.getElapsedTime()
            //this.open_portfolio(true)
        })
        const prev_item = document.getElementById('next-item-button')
        prev_item?.addEventListener('click', () => {
            // Display order leads
            this.set_portfolio_data_for_index((this._data_index + 1) % portfolio_data_arr.length, true)
            this._ui_mat.uniforms._set_texture_time.value = this._clock.getElapsedTime()
            //this.open_portfolio(true)
        })

        this._ui_mat = uiMat
        this._texture_index = 0

        // I do not like adding the clock
        this._clock = clock
        this._data_index = -1
        this._portfolio_open = false
        this._active_item = null

        this.on_portfolio_data_changed = new CodeEvent()
        this.on_portfolio_enabled_changed = new CodeEvent()

        // Setup timeline
        const track_clip = TrackClip.create_track_clip(0, 1, 0, 1, EASE_TYPE.IN_OUT_QUAD, OUT_OF_BOUNDS_TYPE.HOLD, OUT_OF_BOUNDS_TYPE.HOLD)
        const track = new Track('portfolio_track', [track_clip])
        this._timeline = new Timeline()
        this._timeline.integrate_track(track)
        this._timeline.bind_to_track(track.id, this._ui_mat.uniforms._progress, 'value')
        this._timeline_player = new TimelinePlayer(this._timeline, OUT_OF_BOUNDS_TYPE.HOLD)
    }


    open_portfolio(enable: boolean) {
        this._portfolio_open = enable
        this._texture_index = 0
        const index = this._data_index

        const portfolio_controls = document.getElementById(portfolio_controls_id)
        const top_portfolio_info = document.getElementById(top_portfolio_info_id)

        if (enable) {
            this._last_scroll_height = window.scrollY

            const style = window.getComputedStyle(document.body)
            const speed = Number.parseFloat(style.getPropertyValue('--speed'))
            this.timeline_player.set_speed(speed)

            this._timeline_player.set_reverse(false)
            this._timeline_player.stop()
            this._timeline_player.play()

            for (let i = 0; i < this._portfolio_item_arr.length; i++) {
                const portfolio_item = this._portfolio_item_arr[i]
                const image = portfolio_item.querySelector('img')
                image?.classList.remove(pointer_auto_class)
                image?.classList.add(pointer_none_class)
                if (i == index) {
                    portfolio_item.classList.remove(fade_out_class)
                    portfolio_item.style.visibility = VISIBILITY.FALSE
                }
                else {
                    portfolio_item.classList.add(fade_out_class)
                    portfolio_item.style.visibility = VISIBILITY.TRUE
                }
            }
            if (portfolio_controls) {
                portfolio_controls.classList.remove(fade_out_class)
                portfolio_controls.classList.remove(pointer_none_class)
                portfolio_controls.classList.add(pointer_auto_class)
            }
            if (top_portfolio_info) {
                top_portfolio_info.classList.remove(move_right_class)
                top_portfolio_info.classList.remove(fade_out_class)
            }
            for (const content of document.getElementsByClassName('content-containe')) {
                content.classList.remove(pointer_auto_class)
                content.classList.add(pointer_none_class)
            }
            this._collapse_portfolio_spacing_element(false)
        }
        else {
            this._set_texture_for_index_offset(-this._texture_index)

            document.body.style.overflowY = 'scroll'
            const on_complete_cb = () => {
                for (let i = 0; i < this._portfolio_item_arr.length; i++) {
                    const portfolio_item = this._portfolio_item_arr[i]
                    const image = portfolio_item.querySelector('img')
                    image?.classList.remove(pointer_none_class)
                    image?.classList.add(pointer_auto_class)
                    portfolio_item.style.visibility = VISIBILITY.TRUE
                    portfolio_item.classList.remove(fade_out_class)
                }
            }

            const style = window.getComputedStyle(document.body)
            const speed = Number.parseFloat(style.getPropertyValue('--speed'))
            this.timeline_player.set_speed(speed)

            this._timeline_player.set_reverse(true)
            this._timeline_player.play(on_complete_cb)

            if (portfolio_controls) {
                portfolio_controls.classList.add(fade_out_class)
                portfolio_controls.classList.add(pointer_none_class)
                portfolio_controls.classList.remove(pointer_auto_class)
            }
            if (top_portfolio_info) {
                top_portfolio_info.classList.add(move_right_class)
                top_portfolio_info.classList.add(fade_out_class)
            }
            for (const content of document.getElementsByClassName('content')) {
                content.classList.remove(pointer_none_class)
                content.classList.add(pointer_auto_class)
            }
            this._collapse_portfolio_spacing_element(true)
        }
        this.on_portfolio_enabled_changed.fire(enable)
    }

    /**
    * Collapses an invisible element to make vertical room for the canvas when opening the portfolio
    * @param enable 
    * @returns 
    */
    _collapse_portfolio_spacing_element(enable: boolean) {
        const top_portfolio_info_element = document.getElementById(top_portfolio_info_id)
        const portfolio_collapser = document.getElementById(portfolio_collapser_id)
        if (!portfolio_collapser || !top_portfolio_info_element) return

        if (!enable) {
            const previous_sibling = portfolio_collapser.previousElementSibling
            if (previous_sibling) {
                const rect = previous_sibling.getBoundingClientRect()
                portfolio_collapser.style.maxHeight = `${window.innerHeight - rect.height}px`
                top_portfolio_info_element.style.maxHeight = `${top_portfolio_info_element.scrollHeight}px`
            }
        }
        else {
            top_portfolio_info_element.style.maxHeight = `${0}px`
            portfolio_collapser.style.maxHeight = `${0}px`
        }
    }



    /**
     * Keeps the shader in sync with window/screen and time changes
     * @param delta
     */
    tick(): void {
        this.update_active_item()
        this._ui_mat.uniforms._time.value = this._clock.elapsedTime
    }

    /**
     * Setting index based on offset of current. Wraps automatically.
     * @param index_offset 
     */
    _set_texture_for_index_offset(index_offset: number) {
        const data = portfolio_data_arr[this._data_index]
        if (!data) return
        const texture_arr = portfolio_data_arr[this._data_index].texture_arr
        const l = texture_arr.length
        this._texture_index = (((this._texture_index + index_offset) % l) + l) % l
        const texture = texture_arr[this._texture_index]
        this._ui_mat.uniforms._texture_a.value = texture
    }

    /**
     * 
     * @param index 
     * @returns 
     */
    set_portfolio_data_for_index(index: number, include_html: boolean) {
        if (index < 0) return

        this._data_index = index
        this._active_item = this._portfolio_item_arr[index]
        this._set_texture_for_index_offset(-this._texture_index)
        this._ui_mat.uniforms._set_texture_time.value = this._clock.getElapsedTime()

        if (!include_html) return

        // Forcefully set these to ensure fade out is removed on swapping
        this._active_item.classList.remove(fade_out_class)
        this._active_item.style.visibility = VISIBILITY.FALSE

        const data = portfolio_data_arr[index]

        const info_element = document.getElementById('top-portfolio-info')

        const title_element = info_element?.querySelector('h2')
        if (title_element) title_element.innerText = data.title

        const text_elements = info_element?.querySelectorAll('p')

        if (text_elements) {
            text_elements[0].innerHTML = data.pages[0] ? data.pages[0] : ''
            text_elements[1].innerHTML = data.pages[1] ? data.pages[1] : ''
        }

        const link_parent_element = info_element?.querySelector('.links')
        if (link_parent_element) {
            // Add new elements if amount is too small
            const portfolio_list_elements = link_parent_element.querySelectorAll('li')
            for (let i = portfolio_list_elements.length; i < data.links.length; i++)
                link_parent_element.appendChild(PortfolioItemMenu._create_portfolio_link_element())

            const tag_elements = link_parent_element.querySelectorAll('a')
            for (let i = 0; i < tag_elements.length; i++) {
                const has_link = i < data.links.length
                const link_element = tag_elements[i]
                if (has_link) {
                    link_element.style.display = DISPLAY.BLOCK
                    link_element.innerText = data.links[i].text
                    link_element.href = data.links[i].url
                    link_element.target = '_blank'
                } else {
                    link_element.innerText = ''
                    link_element.onclick = () => { }
                    link_element.style.display = DISPLAY.NONE
                }
            }
        }

        // TODO: The iframe introduces a lot of lag. Perhaps the elements should be loaded ahead of time and swapped.
        const video_preview_element = info_element?.querySelector('#video-preview') as HTMLElement
        const video_element = info_element?.querySelector('#video-player') as HTMLElement

        if (video_preview_element && video_element) {
            video_element.style.display = DISPLAY.NONE
            if (data.video.preview_image) {
                video_preview_element.style.display = DISPLAY.BLOCK
                const video_preview_image_element = video_preview_element?.querySelector('img')
                if (video_preview_image_element) video_preview_image_element.src = data.video.preview_image
                const i_frame_element = info_element?.querySelector('iframe')
                if (i_frame_element) {
                    i_frame_element.src = ''
                    video_preview_element.onclick = () => {
                        video_preview_element.style.display = DISPLAY.NONE
                        video_element.style.display = DISPLAY.BLOCK
                        const has_i_frame = data.video.url !== ''
                        i_frame_element.src = has_i_frame ? data.video.url : ''
                    }
                }
            }
            else {
                video_preview_element.style.display = DISPLAY.NONE
            }
        }

        const tag_parent_element = info_element?.querySelector('.tags')
        if (tag_parent_element) {
            // Add new elements if amount is too small
            const portfolio_tag_elements = tag_parent_element.querySelectorAll('li')
            for (let i = portfolio_tag_elements.length; i < data.tags.length; i++)
                tag_parent_element.appendChild(PortfolioItemMenu._create_portfolio_tag_element())
            const tag_elements = tag_parent_element.querySelectorAll('blockquote')
            for (let i = 0; i < tag_elements.length; i++) {
                const has_tag = i < data.tags.length
                const tag_element = tag_elements[i]
                if (has_tag) {
                    tag_element.innerText = data.tags[i]
                    tag_element.style.display = DISPLAY.BLOCK
                } else {
                    tag_element.innerText = ''
                    tag_element.style.display = DISPLAY.NONE
                }
            }
        }
        this.on_portfolio_data_changed.fire(data)

        window.location.hash = data.name
    }

    refresh_data() {
        this.set_portfolio_data_for_index(this._data_index, true)
    }

    _set_video(info_element: HTMLElement, data: PortfolioData) {
        const i_frame_element = info_element?.querySelector('iframe')
        if (i_frame_element) {
            const has_i_frame = data.video.url !== ''
            i_frame_element.src = has_i_frame ? data.video.url : ''
            const parent = i_frame_element.parentElement
            if (parent) parent.style.display = has_i_frame ? DISPLAY.BLOCK : DISPLAY.NONE
        }
    }

    update_active_item() {
        if (!this._active_item) return

        const image = this._active_item.querySelector('img')
        if (!image) {
            console.warn("no image found")
            return
        }

        const rect = image.getBoundingClientRect()
        const texture_a = this._ui_mat.uniforms._texture_a.value
        if (!texture_a) return

        const max_scale = .8
        const scale = Math.min(window.innerWidth / texture_a.width, window.innerHeight / texture_a.height) * max_scale

        const width = texture_a.width * scale
        const height = texture_a.height * scale
        this._ui_mat.uniforms._texture_a_resolution.value.x = width
        this._ui_mat.uniforms._texture_a_resolution.value.y = height

        const ui_scale = Math.max(rect.width / texture_a.width, rect.height / texture_a.height)
        const ui_width = texture_a.width * ui_scale
        const ui_height = texture_a.height * ui_scale

        this._ui_mat.uniforms._texture_a_ui_resolution.value.x = ui_width
        this._ui_mat.uniforms._texture_a_ui_resolution.value.y = ui_height
        const aspect_fix = width > height
            ? (window.innerWidth / window.innerHeight)
            : 1
        this._ui_mat.uniforms._circle_radius_a.value = (rect.width / Math.max(width, height)) * aspect_fix


        const left = rect.left + (rect.width - ui_width) * 0.5
        const top = rect.top + (rect.height + ui_height) * 0.5

        this._ui_mat.uniforms._texture_offset.value.x = (window.innerWidth * 0.5 - left) / window.innerWidth
        this._ui_mat.uniforms._texture_offset.value.y = (-window.innerHeight * 0.5 + top) / window.innerHeight

        this._ui_mat.uniforms._circle_position_offset.value.x = (window.innerWidth * 0.5 - (rect.left + rect.width * 0.5)) / window.innerWidth
        this._ui_mat.uniforms._circle_position_offset.value.y = (-window.innerHeight * 0.5 + (rect.top + rect.height * 0.5)) / window.innerHeight
    }

    /**
    * Creates portfolio html element for data
    * @param data 
    * @returns 
    */
    static _create_portfolio_item_element(data: PortfolioData): HTMLElement {
        const article_element = document.createElement('article')
        article_element.classList.add(portfolio_item_class)
        article_element.classList.add(fader_class)

        const a_element = document.createElement('a')
        a_element.id = data.name
        a_element.classList.add(rect_image_wrapper_class)

        const image_element = document.createElement('img') as HTMLImageElement
        image_element.classList.add(rect_image_class)
        image_element.classList.add(circular_class)
        image_element.classList.add(pointer_auto_class)

        image_element.alt = ''
        image_element.src = data.image_url_arr[0]

        a_element.appendChild(image_element)
        article_element.appendChild(a_element)

        const item_content_container = document.getElementById(portfolio_item_content_container_id)
        if (item_content_container)
            item_content_container.appendChild(article_element)
        return article_element
    }

    static _create_portfolio_link_element() {
        const list_element = document.createElement('li')
        const a_element = document.createElement('a')
        list_element.classList.add('padded-right')
        list_element.appendChild(a_element)
        return list_element
    }

    static _create_portfolio_tag_element() {
        const list_element = document.createElement('li')
        const blockquote_element = document.createElement('blockquote')
        list_element.appendChild(blockquote_element)
        return list_element
    }
}

export { PortfolioItemMenu }
export type { PortfolioData }




