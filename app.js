import {
    Manager,
    LEDZones,
    LEDColorRange,
    MouseButtonPosition,
    ButtonBindings,
} from './manager.js'
import './devices/vendor2-model21.js'
import './devices/vendor1-model11-wired.js'

const connectScreen = document.querySelector('div#connect-screen')
const connectButton = document.querySelector('button#connect-hid')
const statusMessage = document.querySelector('span#status-message')

const sidebarCustomizeButtons = document.querySelector(
    '#sidebar-customize-buttons',
)
const sidebarRGBLighting = document.querySelector('#sidebar-rgb-lighting')
const sidebarAdjustDPI = document.querySelector('#sidebar-adjust-dpi')

const buttonsPane = document.querySelector('#buttonsPane')
const RGBPane = document.querySelector('#RGBPane')
const DPIPane = document.querySelector('#DPIPane')

const settingsPaneButtons = 0
const settingsPaneRGB = 1
const settingsPaneDPI = 2

function connectionError(text) {
    statusMessage.classList.add('connection-error')
    statusMessage.innerText = 'ERROR: ' + text
}

function connectionSuccess() {
    statusMessage.classList.remove('connection-error')
    statusMessage.innerText = ''
    connectScreen.classList.add('slide-out')
}

function setSettingsPane(pane) {
    for (let pane of [
        [sidebarCustomizeButtons, buttonsPane],
        [sidebarRGBLighting, RGBPane],
        [sidebarAdjustDPI, DPIPane],
    ]) {
        pane[0].classList.remove('selected')
        pane[1].classList.remove('shown')
    }

    switch (pane) {
        case settingsPaneButtons:
            buttonsPane.classList.add('shown')
            sidebarCustomizeButtons.classList.add('selected')
            break
        case settingsPaneRGB:
            RGBPane.classList.add('shown')
            sidebarRGBLighting.classList.add('selected')
            break
        case settingsPaneDPI:
            DPIPane.classList.add('shown')
            sidebarAdjustDPI.classList.add('selected')
            break
    }
}

window.addEventListener('load', async (e) => {
    navigator.serviceWorker.register('service.js')

    setSettingsPane(settingsPaneButtons)

    connectButton.addEventListener('click', async () => {
        statusMessage.classList.remove('connection-error')

        try {
            await Manager.connect()
        } catch (e) {
            throw e
            connectionError(e)
            return
        }

        connectionSuccess()
    })

    sidebarCustomizeButtons.addEventListener('click', () => {
        setSettingsPane(settingsPaneButtons)
    })

    sidebarRGBLighting.addEventListener('click', () => {
        setSettingsPane(settingsPaneRGB)
    })

    sidebarAdjustDPI.addEventListener('click', () => {
        setSettingsPane(settingsPaneDPI)
    })
})

// Callbacks
Manager.subscribe({
    connected: () => {
        wireLEDs()
        wireButtons()
    },
    buttons: updateButtons,
    'dpi-levels': wireDPI,
    'fw-version': (version) => {
        let div = document.querySelector('#fw-version')
        div.innerText = version
    },
})

// Buttons
function updateMappingVisibility(select) {
    let position = parseInt(select.id.split('-')[1])

    let mouse_select = document.querySelector(
        'select#button-' + position + '-mouse',
    )
    mouse_select.classList.remove('shown')

    let key_select = document.querySelector(
        'select#button-' + position + '-key',
    )
    key_select.classList.remove('shown')

    switch (parseInt(select.value)) {
        case ButtonBindings.MOUSE_BUTTON:
            mouse_select.classList.add('shown')
            break
        case ButtonBindings.KEYBOARD_KEY:
            key_select.classList.add('shown')
            break
        default:
            console.error('Unknown value: ', select.value)
    }
}

function updateButtons(buttons) {
    for (let i = 0; i < buttons.length; i++) {
        let type_select = document.querySelector(
            'select#button-' + buttons[i].position,
        )
        if (type_select === null) continue
        switch (buttons[i].bind_type) {
            case ButtonBindings.MOUSE_BUTTON:
                var bind_select = document.querySelector(
                    'select#button-' + buttons[i].position + '-mouse',
                )
                bind_select.value = buttons[i].bind_to
                break
            case ButtonBindings.KEYBOARD_KEY:
                var bind_select = document.querySelector(
                    'select#button-' + buttons[i].position + '-key',
                )
                bind_select.value = buttons[i].bind_to
                break
            default:
                console.warn('Unsupported type: ', buttons[i].bind_type)
        }
    }
}

function wireButtons() {
    const ButtonsPane = document.querySelector('#ButtonsPane')
    let capabilities = Manager.buttonsCapabilities()
    let buttons = capabilities.buttons()

    for (let i = 0; i < buttons.length; i++) {
        let button = buttons[i]
        let div = document.createElement('div')
        ButtonsPane.append(div)

        let span = document.createElement('span')
        span.innerText = 'Button ' + buttons[i].position

        let type_select = document.createElement('select')
        type_select.setAttribute('id', 'button-' + buttons[i].position)
        type_select.classList.add('shown')

        let types = {}
        types[ButtonBindings.DEFAULT] = 'Default'
        types[ButtonBindings.MOUSE_BUTTON] = 'Mouse action'
        types[ButtonBindings.DPI_CHANGE] = 'Change DPI'
        types[ButtonBindings.KEYBOARD_KEY] = 'Keyboard key'
        //types[ButtonBindings.MACRO] = 'Macro'
        types[ButtonBindings.UNDEFINED] = 'Not set'
        for (let k of button.bind_types()) {
            let v = types[k]

            let option = document.createElement('option')
            option.setAttribute('value', k)
            option.innerText = v

            type_select.append(option)

            if (k == buttons[i].bind_type) {
                type_select.value = k
            }
        }

        // Mouse buttons
        let mouse_select = document.createElement('select')
        mouse_select.setAttribute(
            'id',
            'button-' + buttons[i].position + '-mouse',
        )
        mouse_select.classList.add('button-mouse-select')

        let mouse_mappings = {}
        mouse_mappings[MouseButtonPosition.LEFT] = 'Left Click'
        mouse_mappings[MouseButtonPosition.RIGHT] = 'Right Click'
        mouse_mappings[MouseButtonPosition.MIDDLE] = 'Middle Click'
        mouse_mappings[MouseButtonPosition.WHEEL_DOWN] = 'Wheel Down'
        mouse_mappings[MouseButtonPosition.WHEEL_UP] = 'Wheel Up'
        mouse_mappings[MouseButtonPosition.LEFT_FRONT] = 'Left front'
        mouse_mappings[MouseButtonPosition.LEFT_BACK] = 'Left back'
        mouse_mappings[MouseButtonPosition.RIGHT_FRONT] = 'Right front'
        mouse_mappings[MouseButtonPosition.RIGHT_BACK] = 'Right back'
        for (let k of button.bindings_for_type(ButtonBindings.MOUSE_BUTTON)) {
            let v = mouse_mappings[k]

            let option = document.createElement('option')
            option.setAttribute('value', k)
            option.innerText = v

            mouse_select.append(option)
        }

        mouse_select.addEventListener('change', (e) => {
            let select = e.currentTarget
            let position = parseInt(select.id.split('-')[1])
            Manager.setButton(
                position,
                ButtonBindings.MOUSE_BUTTON,
                parseInt(select.value),
            )
        })

        // Keyboard keys
        let key_select = document.createElement('select')
        key_select.setAttribute('id', 'button-' + buttons[i].position + '-key')

        let key_map = button.keyboard_map()
        console.log(key_map)
        for (let key of Object.keys(key_map)) {
            let value = key_map[key]

            let option = document.createElement('option')
            option.setAttribute('value', value)
            option.innerText = key

            key_select.append(option)
        }

        key_select.addEventListener('change', (e) => {
            let select = e.currentTarget
            let position = parseInt(select.id.split('-')[1])
            Manager.setButton(
                position,
                ButtonBindings.KEYBOARD_KEY,
                select.value,
            )
        })

        // Show or hide mapping elements based on the type selection.
        type_select.addEventListener('change', (e) => {
            let select = e.currentTarget
            updateMappingVisibility(select)
        })

        let br = document.createElement('br')
        div.append(span, type_select, mouse_select, key_select, br)

        updateMappingVisibility(type_select)
    }
}

// DPI
function wireDPI(count, current, levels) {
    const DPIPane = document.querySelector('#DPIPane')
    let capabilities = Manager.dpiCapabilities()

    for (let i = 0; i < capabilities.count; i++) {
        let div = document.createElement('div')
        DPIPane.append(div)

        let span = document.createElement('span')
        span.innerText = 'Level ' + (i + 1)

        let select = document.createElement('select')
        select.setAttribute('id', 'dpi-select-' + i)

        const levelKeys = Object.keys(capabilities.levels)
        for (let k of levelKeys) {
            let v = capabilities.levels[k]

            let option = document.createElement('option')
            option.setAttribute('value', k)
            option.innerText = v

            select.append(option)

            if (v == levels[i]) {
                select.value = k
            }
        }

        select.addEventListener('change', (e) => {
            let select = e.currentTarget
            let index = parseInt(select.id.split('-')[2])
            Manager.setDPILevel(index, select.value)
        })

        let br = document.createElement('br')
        div.append(span, select, br)
    }
}

// RGB
function zone_to_id_fragment(zone) {
    switch (zone) {
        case LEDZones.ALL:
            return 'all-zones'
        case LEDZones.BACK:
            return 'back'
        case LEDZones.SIDES_BACK:
            return 'sides-back'
        case LEDZones.SIDES_FRONT:
            return 'sides-front'
        default:
            console.log('Unknown zone, returning all...')
    }

    return 'all-zones'
}

function wireSimpleRGBLEDEvents(zone, id_fragment) {
    const ledColorRed = document.querySelector(
        '#led-' + id_fragment + '-color-red',
    )
    const ledColorGreen = document.querySelector(
        '#led-' + id_fragment + '-color-green',
    )
    const ledColorBlue = document.querySelector(
        '#led-' + id_fragment + '-color-blue',
    )

    ledColorRed.addEventListener('click', () => {
        Manager.setLED('#FF0000', zone)
    })

    ledColorGreen.addEventListener('click', () => {
        Manager.setLED('#00FF00', zone)
    })

    ledColorBlue.addEventListener('click', () => {
        Manager.setLED('#0000FF', zone)
    })
}

function wireAllColorsLEDEvents(zone, id_fragment) {
    const ledColorPicker = document.querySelector(
        '#led-' + id_fragment + '-color-picker',
    )

    ledColorPicker.addEventListener('input', (event) => {
        let ledColorPicker = event.currentTarget
        Manager.setLED(ledColorPicker.value, zone)
    })
}

function wireLEDsForZone(zone, range) {
    let id_fragment = zone_to_id_fragment(zone)
    const ledAllZonesControls = document.querySelector(
        '#led-' + id_fragment + '-controls',
    )
    ledAllZonesControls.classList.add('shown')

    switch (range) {
        case LEDColorRange.SIMPLE_RGB:
            wireSimpleRGBLEDEvents(zone, id_fragment)

            document
                .querySelector('#led-' + id_fragment + '-simple-rgb')
                .classList.add('shown')
            break
        case LEDColorRange.ALL_COLORS:
            wireAllColorsLEDEvents(zone, id_fragment)
            document
                .querySelector('#led-' + id_fragment + '-all-colors')
                .classList.add('shown')
            break
        default:
            console.log('Unkown color range...')
    }
}

function wireLEDs() {
    let ledCapabilities = Manager.ledCapabilities()

    var range = ledCapabilities.rangeForZone(LEDZones.ALL)
    if (range != LEDColorRange.NONE) {
        wireLEDsForZone(LEDZones.ALL, range)
    }

    range = ledCapabilities.rangeForZone(LEDZones.BACK)
    if (range != LEDColorRange.NONE) {
        wireLEDsForZone(LEDZones.BACK, range)
    }

    range = ledCapabilities.rangeForZone(LEDZones.SIDES_BACK)
    if (range != LEDColorRange.NONE) {
        wireLEDsForZone(LEDZones.SIDES_BACK, range)
    }

    range = ledCapabilities.rangeForZone(LEDZones.SIDES_FRONT)
    if (range != LEDColorRange.NONE) {
        wireLEDsForZone(LEDZones.SIDES_FRONT, range)
    }
}
