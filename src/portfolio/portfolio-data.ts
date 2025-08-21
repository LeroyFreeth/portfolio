import * as THREE from 'three'
import { ColorPaletteManager } from '../utilities/color-palette-manager'

import loot_vr_a from '../assets/images/loot-vr/loot-vr-a.webp'
import loot_vr_b from '../assets/images/loot-vr/loot-vr-b.webp'
import loot_vr_c from '../assets/images/loot-vr/loot-vr-c.webp'
import loot_vr_d from '../assets/images/loot-vr/loot-vr-d.webp'
import loot_vr_e from '../assets/images/loot-vr/loot-vr-e.webp'

import moyosa_spaces_a from '../assets/images/moyosa-spaces/spaces-a.webp'
import moyosa_spaces_b from '../assets/images/moyosa-spaces/spaces-b.webp'
import moyosa_spaces_c from '../assets/images/moyosa-spaces/spaces-c.webp'
import moyosa_spaces_d from '../assets/images/moyosa-spaces/spaces-d.webp'

import m_n_m_s_a from '../assets/images/m&m-color-match/m-m-a.webp'
import m_n_m_s_b from '../assets/images/m&m-color-match/m-m-b.webp'
import m_n_m_s_c from '../assets/images/m&m-color-match/m-m-c.webp'

import adidas_a from '../assets/images/8th-wall/8th-wall-a.webp'
import adidas_b from '../assets/images/8th-wall/8th-wall-b.webp'
import adidas_c from '../assets/images/8th-wall/8th-wall-c.webp'

import brighter_future_a from '../assets/images/brighter-future/brighter-future-a.webp'
import brighter_future_b from '../assets/images/brighter-future/brighter-future-b.webp'

import gary_james_mcqueen_a from '../assets/images/gary-james-mcqueen/gary-james-mcqueen-a.webp'
import gary_james_mcqueen_b from '../assets/images/gary-james-mcqueen/gary-james-mcqueen-b.webp'
import gary_james_mcqueen_c from '../assets/images/gary-james-mcqueen/gary-james-mcqueen-c.webp'
import gary_james_mcqueen_d from '../assets/images/gary-james-mcqueen/gary-james-mcqueen-d.webp'

import hornsteinn_a from '../assets/images/hornsteinn/hornsteinn-a.webp'
import hornsteinn_b from '../assets/images/hornsteinn/hornsteinn-b.webp'

type PortfolioData = {
    name: string
    image_url_arr: string[],
    texture_arr: THREE.Texture[],
    title: string,
    pages: string[],
    links: LinkData[],
    video: VideoLinkData,
    roles: string[],
    tags: string[],
    color_palette: number[],
}

type LinkData = {
    url: string,
    text: string,
}

type VideoLinkData = {
    preview_image: string,
    url: string,
}

const portfolio_data_arr: PortfolioData[] = [
    {
        name: 'mauritshuis',
        image_url_arr: [loot_vr_a, loot_vr_b, loot_vr_c, loot_vr_d, loot_vr_e],
        texture_arr: [],
        title: 'Loot VR',
        pages: ['Project for the Mauritshuis. Three artifacts within the exposition got a VR experience which transports the user back in time to a important scenario in the artifacts lifecycle.',
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
        color_palette: [0xC696BC, 0x8B5D89, 0x5A4262, 0x1A213E, 0x7A527C]
    },
    {
        name: 'moyosa_spaces',
        image_url_arr: [moyosa_spaces_a, moyosa_spaces_b, moyosa_spaces_c, moyosa_spaces_d],
        texture_arr: [],
        title: 'Moyosa spaces',
        pages: ['Virtual environments on the web, such as museums. They consist of tiled high resolution cubemaps which load higher resolution tiles based on zoom levels. Users can navigate through the gallery using predefined waypoints. Some galleries were created with <a href="https://krpano.com/home/">Krpano</a>. Newer galleries were created with <a href="https://www.babylonjs.com">BabylonJs</a> and <a href="https://lastolivegames.github.io/becsy/guide/introduction">Becsy</a>',
            'In addition to the galleries themselves, my role was to automate the gallery pipeline. Galleries were initially setup in Unreal. Therefore tools were created to export as much as possible from the Unreal scene to the web version. This includes waypoint positions, default interactions and tile paths.<br><br>I also sometimes made some promo material, such as the video below.'],
        links: [{
            url: 'https://argento-gallery.nl',
            text: '> Argento Live Gallery <'
        },
        {
            url: 'https://masterpieces.feadship.nl',
            text: '> Feadship Live Gallery <'
        }],
        video: {
            preview_image: 'https://img.youtube.com/vi/XJgPGOnooQ8/sddefault.jpg',
            url: 'https://www.youtube.com/embed/XJgPGOnooQ8?autoplay=1&mute=1',
        },
        roles: ['developer', 'camera'],
        tags: ['babylonjs', 'ecs', 'unreal', 'krpano'],
        color_palette: [0xA9B4C2, 0x5E6572, 0xEEF1EF, 0x1C2321, 0x7D98A1]
    },
    {
        name: 'm_n_m_s',
        image_url_arr: [m_n_m_s_a, m_n_m_s_b, m_n_m_s_c],
        texture_arr: [],
        title: 'M&M Color Match',
        pages: ['Local multiplayer pop the bubbles game! Running live in M&M stores.',
            'This was a fun, mostly solo, project.'],
        links: [],
        video: {
            preview_image: '',
            url: '',
        },
        roles: ['developer'],
        tags: ['unity', 'local-multiplayer'],
        color_palette: [
            ColorPaletteManager.desaturate(0xD80C0A, 0.3),
            ColorPaletteManager.desaturate(0x1578E1, 0.3),
            ColorPaletteManager.desaturate(0xEEDFD2, 0.3),
            ColorPaletteManager.desaturate(0x33B55F, 0.3),
            ColorPaletteManager.desaturate(0x8CCCFB, 0.3)]
    },
    {
        name: '8th wall ar',
        image_url_arr: [adidas_a, adidas_b, adidas_c],
        texture_arr: [],
        title: '8th wall AR projects',
        pages: ['AR experiences for for example for the Soccer World Championship 2024. Users use AR on their phones to the see their legends come to life! I have also helped making marketing applications for Sony as shown in the video blow.'],
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
        color_palette: [0x09070F, 0x5E293A, 0xBDB7A5, 0x672E21, 0x0F0F16]
    },
    {
        name: 'brighter_future',
        image_url_arr: [brighter_future_a, brighter_future_b],
        texture_arr: [],
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
        color_palette: [0x302E2F, 0x897A6A, 0x3C3F2D, 0x676360, 0xC0C7C4]
    },
    {
        name: 'hornn_stein',
        image_url_arr: [hornsteinn_a, hornsteinn_b],
        texture_arr: [],
        title: 'Hornnstein',
        pages: ['Web-application in which users virtually enhance their driveways to preview purchasable products.'],
        links: [{
            url: 'https://teikniforrit.bmvalla.is',
            text: '> Try it live <'
        }],
        video: {
            preview_image: '',
            url: '',
        },
        roles: ['developer'],
        tags: ['vue', 'web'],
        color_palette: [0x3B3E3E, 0xA7A29A, 0xF8F7F7, 0xDF4247, 0x3D748E]
    },
    {
        name: 'gary_james_mcqueen',
        image_url_arr: [gary_james_mcqueen_a, gary_james_mcqueen_b, gary_james_mcqueen_c, gary_james_mcqueen_d],
        texture_arr: [],
        title: 'Gary James Mcqueen',
        pages: ['Digital fashion show created in Unreal4.', `I was a developer on this project for Unreal4. This included importing assets, creating shaders to suit the creative needs, etc. In addition, I was the sole 'virtual cameraman'.`],
        links: [],
        video: {
            preview_image: 'https://img.youtube.com/vi/_7y0qbs71Ec/sddefault.jpg',
            url: 'https://www.youtube.com/embed/_7y0qbs71Ec?autoplay=1&mute=1',
        },
        roles: ['developer', 'digital cinematographer'],
        tags: ['Unreal4', 'cinematography', 'alembic files', 'motion-capture'],
        color_palette: [0x584217, 0x6A5730, 0x524B44, 0x72695B, 0x776F66]
    },
]

export { portfolio_data_arr }
export type { PortfolioData }