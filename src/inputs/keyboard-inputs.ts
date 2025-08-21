let enabled = false

function enableControls(enable: boolean) {
    if (enabled == enable) return
    if (enable) document.addEventListener('keydown', processControls)
    else document.removeEventListener('keydown', processControls)
    enabled = enable

}

function processControls(ev: KeyboardEvent) {
    console.log(ev.code)
}

export { enableControls }
