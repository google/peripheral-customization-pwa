class ManagerSingleton {
    constructor() {
        this.supported_devices = []
    }

    async connect() {
        // FIXME: get USB IDs for filters from the backend classes.
        const devices = await navigator.hid.requestDevice({
            "filters": [],
        });

        if (devices.length == 0) {
            throw "No device was selected"
        }

        console.log("Looking for backend for {}", devices)
        try {
            this.backend = await this.create_backend_for_devices(devices)
        } catch (e) {
            throw e
        }

        // Initialize the UI with information and current settings.
        this.request_fw_version()

        console.log("Selected backend: ", this.backend)
    }

    async create_backend_for_devices(devices) {
        let device = devices[0]

        for (let [cls, filters] of this.supported_devices) {
            for (let filter of filters) {
                if (device.productId == filter.productId && device.vendorId == filter.vendorId) {
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

        throw "No backend exists for this device"
    }

    // Application helpers

    subscribe(handlers_map) {
        this.handlers_map = handlers_map
    }

    // Basics

    request_fw_version() {
        this.backend.request_fw_version()
    }

    got_fw_version(version) {
        if (!'fw-version' in this.handlers_map) {
            return
        }

        this.handlers_map['fw-version'](
            strview(version)
        )
    }

    // Buttons

    set_button(button, action) {
        console.log(`button: ${button.name} action: ${action}`)
    }

    set_dpi_level(level) {
        console.log(`DPI level: ${level}`)
    }

    // RGB

    // rgb: HTML rgb string, can come directly from a color picker input, must have the #
    // mode: some mice support modes like 'colorful', 'breathing', etc.
    // zone: some mice have leds in more than one location
    set_led(rgb, mode, zone) {
        console.log(`rgb: ${rgb} mode: ${mode} zone: ${zone}`)

        if (this.backend != undefined) {
            this.backend.set_led(rgb, mode, zone)
        }
    }

    register(cls, filters) {
        this.supported_devices.push([cls, filters])
    }
}

const strview = data => {
    let buffer = '';
    let u8array = new Uint8Array(data.buffer);
    for (const byteValue of u8array) {
        buffer += String.fromCharCode(byteValue);
    }
    return buffer;
};

export class Buttons {
    static Left = new Buttons("buttons-left");
    static Right = new Buttons("buttons-right");
    static ScrollUp = new Buttons("buttons-scroll-up");
    static ScrollDown = new Buttons("buttons-scroll-down");
    static Button1 = new Buttons("buttons-button1");
    static Button2 = new Buttons("buttons-button2");

    constructor(name) {
        this.name = name
    }
}

export var Manager = new ManagerSingleton()