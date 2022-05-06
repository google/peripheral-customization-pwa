class ManagerSingleton {
    constructor() {
        this.supportedDevices = []
    }

    async connect() {
        const devices = await navigator.hid.requestDevice({
            filters: this.supportedDevices.map((item) => item[1]).flat(),
        })

        if (devices.length == 0) {
            throw 'No device was selected'
        }

        console.log('Looking for backend for {}', devices)
        try {
            this.backend = await this.createBackendForDevices(devices)
        } catch (e) {
            throw e
        }

        // Initialize the UI with capabilities, information and current settings.
        this.notify('connected')

        await this.requestFWVersion()
        await this.requestCurrentConfig()

        console.log('Selected backend: ', this.backend)
    }

    async createBackendForDevices(devices) {
        let device = devices[0]

        for (let [cls, filters] of this.supportedDevices) {
            for (let filter of filters) {
                if (
                    device.productId == filter.productId &&
                    device.vendorId == filter.vendorId
                ) {
                    let backend = new cls(devices)

                    try {
                        await backend.open()
                    } catch (e) {
                        throw e
                    }

                    return backend
                }
            }
        }

        throw 'No backend exists for this device'
    }

    // Application helpers

    subscribe(handlersMap) {
        this.handlersMap = handlersMap
    }

    notify(eventName, ...data) {
        if (!(eventName in this.handlersMap)) {
            return
        }

        this.handlersMap[eventName].apply(null, data)
    }

    // Basics

    async requestFWVersion() {
        await this.backend.requestFWVersion()
    }

    gotFWVersion(version) {
        this.notify('fw-version', strView(version))
    }

    async requestCurrentConfig() {
        await this.backend.requestCurrentConfig()
    }

    // Buttons

    buttonsCapabilities() {
        return this.backend.buttonsCapabilities()
    }

    async requestButtons() {
        await this.backend.requestButtons()
    }

    gotButtons(buttons) {
        this.notify('buttons', buttons)
    }

    async setButton(position, bind_type, bind_to) {
        await this.backend.setButton(position, bind_type, bind_to)
    }

    // DPI

    dpiCapabilities() {
        return this.backend.dpiCapabilities()
    }

    async requestDPILevels() {
        await this.backend.requestDPILevels()
    }

    gotDPILevels(count, current, levels) {
        this.notify('dpi-levels', count, current, levels)
    }

    async setDPILevel(index, level) {
        await this.backend.setDPILevel(index, level)
    }

    // levels: an array with the CPI for each enabled level, based off of the levels
    // available from the mouse
    async setDPILevels(levels) {
        await this.backend.setDPILevels(levels)
    }

    // RGB
    ledCapabilities() {
        return this.backend.ledCapabilities()
    }

    // zone: the LEDZones we want to query
    async ledForZone(zone) {
        await this.backend.ledForZone(zone)
    }

    // rgb: HTML rgb string, can come directly from a color picker input, must have the #
    // mode: some mice support modes like 'colorful', 'breathing', etc.
    // zone: a LEDZones specifying which zone to set the color to, or LEDZones.ALL for
    // setting to all of them
    async setLED(rgb, zone, mode) {
        if (this.backend != undefined) {
            await this.backend.setLED(rgb, zone, mode)
        }
    }

    register(cls, filters) {
        this.supportedDevices.push([cls, filters])
    }
}

const strView = (data) => {
    let buffer = ''
    let u8array = new Uint8Array(data.buffer)
    for (const byteValue of u8array) {
        buffer += String.fromCharCode(byteValue)
    }
    return buffer
}

export class Buttons {
    static Left = new Buttons('buttons-left')
    static Right = new Buttons('buttons-right')
    static WheelUp = new Buttons('buttons-wheel-up')
    static WheelDown = new Buttons('buttons-wheel-down')
    static Button1 = new Buttons('buttons-button1')
    static Button2 = new Buttons('buttons-button2')

    constructor(name) {
        this.name = name
    }
}

export class Color {
    constructor(red, green, blue) {
        this.red = red
        this.green = green
        this.blue = blue
    }
}

export class ProtocolHelper {
    static htmlRGBToColor(rgb) {
        if (rgb[0] != '#' || rgb.length < 7) {
            console.log('Bad color provided, setting LED to red...')
            return new Color(0xff, 0x00, 0x00)
        } else {
            return new Color(
                parseInt(rgb.substring(1, 3), 16),
                parseInt(rgb.substring(3, 5), 16),
                parseInt(rgb.substring(5, 7), 16),
            )
        }
    }
}

export class ButtonBindings {
    static DEFAULT = 0
    static MOUSE_BUTTON = 1
    static DPI_CHANGE = 2
    static KEYBOARD_KEY = 3
    static MACRO = 4
    static UNDEFINED = 0xff
}

export class MouseButtonPosition {
    static LEFT = 0
    static RIGHT = 1
    static MIDDLE = 2
    static WHEEL_DOWN = 3
    static WHEEL_UP = 4
    static LEFT_FRONT = 5
    static LEFT_BACK = 6
    static RIGHT_FRONT = 7
    static RIGHT_BACK = 8
    static TOP = 9
    static UNDEFINED = 0xff
}

export class Button {
    constructor(position) {
        this.position = position
        this.bindings = {}
        this._keyboard_map = {}
    }

    add_binding(bind_type, bind_to) {
        if (bind_type in this.bindings) {
            this.bindings[bind_type].push(bind_to)
        } else {
            this.bindings[bind_type] = [bind_to]
        }
    }

    // map of description to code used internally by the backend
    add_keyboard_map(map) {
        this._keyboard_map = map
    }

    keyboard_map() {
        return this._keyboard_map
    }

    bind_types() {
        return Object.keys(this.bindings)
    }

    bindings_for_type(bind_type) {
        if (bind_type in this.bindings) {
            return this.bindings[bind_type]
        }

        return []
    }

    bindings_for_keyboard() {
        return this.keyboard_map
    }
}

export class ButtonsCapabilities {
    constructor() {
        this._buttons = []
    }

    add_button(button) {
        this._buttons.push(button)
    }

    buttons() {
        return this._buttons
    }
}

export class DPICapabilities {
    // count: number of DPI indexes
    // levels: map with values and names for the various levels
    constructor(count, levels) {
        this.count = count
        this.levels = levels
    }
}

export class LEDColorRange {
    static NONE = 0
    static SIMPLE_RGB = 1
    static ALL_COLORS = 2
}

export class LEDZones {
    static ALL = 0
    static BACK = 1
    static SIDES_BACK = 2
    static SIDES_FRONT = 3

    static all() {
        return [
            LEDZones.ALL,
            LEDZones.BACK,
            LEDZones.SIDES_BACK,
            LEDZones.SIDES_FRONT,
        ]
    }
}

export class LEDCapabilities {
    // The constructor is given the minimum range that can be applied to all
    // zones.
    constructor(range) {
        this.zones = {
            0: range,
        }
    }

    // zone: a LEDZone
    // range: a LEDColorRange
    addZone(zone, range) {
        this.zones[zone] = range
    }

    rangeForZone(zone) {
        if (!zone in this.zones) {
            return LEDColorRange.NONE
        }

        return this.zones[zone]
    }
}

export var Manager = new ManagerSingleton()

// Print the object so we can use it from devtools
console.log(Manager)
