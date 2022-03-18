import { Manager, Buttons } from './manager.js';
import '/devices/vendor2-model21.js';

const connectScreen = document.querySelector("div#connect-screen");
const connectButton = document.querySelector("button#connect-hid");
const statusMessage = document.querySelector("span#status-message");

const sidebarCustomizeButtons = document.querySelector("#sidebar-customize-buttons");
const sidebarRGBLighting = document.querySelector("#sidebar-rgb-lighting");
const sidebarAdjustDPI = document.querySelector("#sidebar-adjust-dpi");

const buttonsPane = document.querySelector('#buttonsPane');
const RGBPane = document.querySelector('#RGBPane');
const DPIPane = document.querySelector('#DPIPane');

const settingsPaneButtons = 0;
const settingsPaneRGB = 1;
const settingsPaneDPI = 2;

function connectionError(text) {
    statusMessage.classList.add("connection-error");
    statusMessage.innerText = 'ERROR: ' + text;
}

function connectionSuccess() {
    statusMessage.classList.remove("connection-error");
    statusMessage.innerText = '';
    connectScreen.classList.add("slide-out");
}

function setSettingsPane(pane) {
    for (let pane of [[sidebarCustomizeButtons, buttonsPane], [sidebarRGBLighting, RGBPane], [sidebarAdjustDPI, DPIPane]]) {
        pane[0].classList.remove('selected');
        pane[1].classList.remove('shown');
    }

    switch (pane) {
        case settingsPaneButtons:
            buttonsPane.classList.add('shown');
            sidebarCustomizeButtons.classList.add('selected');
            break;
        case settingsPaneRGB:
            RGBPane.classList.add('shown');
            sidebarRGBLighting.classList.add('selected');
            break;
        case settingsPaneDPI:
            DPIPane.classList.add('shown');
            sidebarAdjustDPI.classList.add('selected');
            break;
        }
}

window.addEventListener('load', async e => {
    navigator.serviceWorker.register('service.js');

    setSettingsPane(settingsPaneButtons);

    connectButton.addEventListener("click", async () => {
        statusMessage.classList.remove("connection-error");

        try {
            await Manager.connect()
        } catch (e) {
            connectionError(e)
            return
        }

        connectionSuccess();
    });

    sidebarCustomizeButtons.addEventListener("click", () => {
        setSettingsPane(settingsPaneButtons);
    })

    sidebarRGBLighting.addEventListener("click", () => {
        setSettingsPane(settingsPaneRGB);
    })

    sidebarAdjustDPI.addEventListener("click", () => {
        setSettingsPane(settingsPaneDPI);
    })
});

// RGB
const ledColorPicker = document.querySelector('#led-color');

ledColorPicker.addEventListener('input', () => {
    console.log('event listener: ' + ledColorPicker.value)
    Manager.set_led(ledColorPicker.value, null, null)
})

const ledColorRed = document.querySelector('#led-color-red');
const ledColorGreen = document.querySelector('#led-color-green');
const ledColorBlue = document.querySelector('#led-color-blue');

ledColorRed.addEventListener('click', () => {
    Manager.set_led('#FF0000')
})

ledColorGreen.addEventListener('click', () => {
    Manager.set_led('#00FF00')
})

ledColorBlue.addEventListener('click', () => {
    Manager.set_led('#0000FF')
})

// Buttons
const buttonsLeft = document.querySelector('#buttons-left');
const buttonsRight = document.querySelector('#buttons-right');
const buttonsScrollUp = document.querySelector('#buttons-scroll-up');
const buttonsScrollDown = document.querySelector('#buttons-scroll-down');
const buttonsButton1 = document.querySelector('#buttons-button1');
const buttonsButton2 = document.querySelector('#buttons-button2');

buttonsLeft.addEventListener('change', () => {
    Manager.set_button(Buttons.Left, buttonsLeft.value)
})

buttonsRight.addEventListener('change', () => {
    Manager.set_button(Buttons.Right, buttonsRight.value)
})

buttonsScrollUp.addEventListener('change', () => {
    Manager.set_button(Buttons.ScrollUp, buttonsScrollUp.value)
})

buttonsScrollDown.addEventListener('change', () => {
    Manager.set_button(Buttons.ScrollDown, buttonsScrollDown.value)
})

buttonsButton1.addEventListener('change', () => {
    Manager.set_button(Buttons.Button1, buttonsButton1.value)
})

buttonsButton2.addEventListener('change', () => {
    Manager.set_button(Buttons.Button2, buttonsButton2.value)
})

// DPI
const dpiLevels = document.querySelector('#dpi-levels')

dpiLevels.addEventListener('change', () => {
    Manager.set_dpi_level(dpiLevels.value)
})