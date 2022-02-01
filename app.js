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
        let device;

        statusMessage.classList.remove("connection-error");

        try {
            const devices = await navigator.hid.requestDevice({
                "filters": [],
            });

            device = devices[0];

            if (!device) {
                connectionError("No device was selected.")
                return;
            }
        } catch (e) {
            connectionError(e)
        }

        try {
            await device.open();
        } catch(e) {
            connectionError(e);
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