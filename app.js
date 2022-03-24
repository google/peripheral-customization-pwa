import { Manager, Buttons, LEDZones, LEDColorRange } from './manager.js'
import '/devices/vendor2-model21.js'
import '/devices/vendor1-model11.js'

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
    },
    'fw-version': (version) => {
        let div = document.querySelector('#fw-version')
        div.innerText = version
    },
})

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

// Buttons
const buttonsLeft = document.querySelector('#buttons-left')
const buttonsRight = document.querySelector('#buttons-right')
const buttonsScrollUp = document.querySelector('#buttons-scroll-up')
const buttonsScrollDown = document.querySelector('#buttons-scroll-down')
const buttonsButton1 = document.querySelector('#buttons-button1')
const buttonsButton2 = document.querySelector('#buttons-button2')

buttonsLeft.addEventListener('change', () => {
    Manager.setButton(Buttons.Left, buttonsLeft.value)
})

buttonsRight.addEventListener('change', () => {
    Manager.setButton(Buttons.Right, buttonsRight.value)
})

buttonsScrollUp.addEventListener('change', () => {
    Manager.setButton(Buttons.ScrollUp, buttonsScrollUp.value)
})

buttonsScrollDown.addEventListener('change', () => {
    Manager.setButton(Buttons.ScrollDown, buttonsScrollDown.value)
})

buttonsButton1.addEventListener('change', () => {
    Manager.setButton(Buttons.Button1, buttonsButton1.value)
})

buttonsButton2.addEventListener('change', () => {
    Manager.setButton(Buttons.Button2, buttonsButton2.value)
})

// DPI
const dpiLevels = document.querySelector('#dpi-levels')

dpiLevels.addEventListener('change', () => {
    Manager.setDPILevel(dpiLevels.value)
})
