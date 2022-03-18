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

        this.backend = await this.create_backend_for_devices(devices)
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

    set_button(button, action) {
        console.log(`button: ${button.name} action: ${action}`)
    }

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