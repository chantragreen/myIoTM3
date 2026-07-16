# Pico W Edge Station Code

This folder contains MicroPython code for Raspberry Pi Pico W to run as an AIoT edge station.

## Files

- `main.py`: app entry point
- `preflight_check.py`: quick health checks (umqtt, Wi-Fi, MQTT) before running main app
- `config.example.py`: configuration template
- `wifi_manager.py`: Wi-Fi connection helper
- `mqtt_service.py`: MQTT client wrapper
- `sensors.py`: sensor reading (internal temp + light ADC + DHT22 humidity)
- `actuator.py`: multi-relay GPIO output control
- `topic_builder.py`: MQTT topic generation
- `button_input.py`: debounced pushbutton input handling
- `offline_queue.py`: bounded offline publish queue
- `boot.py`: minimal boot script
- `THONNY_UPLOAD_CHECKLIST_TH.md`: click-by-click upload checklist in Thonny (Thai)

## Quick Start

1. Install MicroPython firmware on Pico W.
2. Copy all files in this directory to Pico W filesystem.
3. If Thonny shows `ImportError: no module named 'umqtt'`, run `install_deps.py` once on the Pico W.
4. Duplicate `config.example.py` as `config.py` and update values.
5. Reboot Pico W.

## Fix: `ImportError: no module named 'umqtt'`

This means the MicroPython MQTT library is not installed on the Pico W yet.

Recommended fix in Thonny:

1. Upload all files in this folder to the Pico W
2. Open `install_deps.py` in Thonny
3. Run it once on the Pico W
4. Wait until you see `Dependency installation completed.`
5. Reset the board and run `main.py`

Alternative fix:

1. In Thonny, open `Tools > Manage packages...`
2. Search for `umqtt.simple`
3. Install it to the MicroPython device

If your firmware does not support `mip`, update the Pico W MicroPython firmware first, then run `install_deps.py` again.

## Config Example

```python
WIFI_SSID = "YOUR_WIFI_SSID"
WIFI_PASSWORD = "YOUR_WIFI_PASSWORD"

MQTT_BROKER = "172.16.3.205"
MQTT_PORT = 1883
MQTT_USERNAME = ""
MQTT_PASSWORD = ""
MQTT_KEEPALIVE = 60

WIFI_PM = None

WIFI_USE_CREDENTIAL_FILE = False
WIFI_CREDENTIALS_PATH = "wifi_credentials.json"

TEAM_ID = "TEAM-DEMO"
DEVICE_ID = "pico-w-edge-01"

PUBLISH_INTERVAL_SEC = 5
HEARTBEAT_INTERVAL_SEC = 30

HUMIDITY_SOURCE = "simulated"
DHT22_PIN = 17

RELAYS = [
	{"id": "1", "pin": 15, "active_high": True},
]

BUTTON_ENABLED = True
BUTTON_ID = "1"
BUTTON_PIN = 16
BUTTON_PULL_UP = True
BUTTON_ACTIVE_LOW = True
BUTTON_DEBOUNCE_MS = 80
BUTTON_PRESS_TOGGLE_RELAY = True
BUTTON_LONG_PRESS_ENABLED = True
BUTTON_LONG_PRESS_STAGE1_MS = 3000
BUTTON_LONG_PRESS_STAGE1_ACTION = "pairing_mode"
BUTTON_LONG_PRESS_STAGE2_MS = 8000
BUTTON_LONG_PRESS_STAGE2_ACTION = "reset_wifi_config"
PAIRING_MODE_DURATION_SEC = 120
LONG_PRESS_RESET_REBOOT = True

OFFLINE_QUEUE_MAX = 80
RECONNECT_BASE_SEC = 2
RECONNECT_MAX_SEC = 30

WATCHDOG_ENABLED = True
WATCHDOG_TIMEOUT_MS = 8000

LOOP_SLEEP_MS = 250
USE_LIGHT_SLEEP = True
CPU_FREQ_HZ = 125000000
```

## DHT22 Wiring

- `VCC` -> `3V3(OUT)`
- `GND` -> `GND`
- `DATA` -> `GPIO17` (or your configured `DHT22_PIN`)
- Add a 10k pull-up resistor between `DATA` and `3V3`

If you use pushbutton on `GPIO16`, keep DHT22 on a different GPIO (for example `GPIO17`).

## Published Topics

The app publishes to:

- `team/<TEAM_ID>/<DEVICE_ID>/temperature`
- `team/<TEAM_ID>/<DEVICE_ID>/humidity`
- `team/<TEAM_ID>/<DEVICE_ID>/light`
- `team/<TEAM_ID>/<DEVICE_ID>/heartbeat`
- `team/<TEAM_ID>/<DEVICE_ID>/status`
- `team/<TEAM_ID>/<DEVICE_ID>/relay/<relay_id>/state` (for every relay)

It subscribes to:

- `team/<TEAM_ID>/<DEVICE_ID>/relay/+/cmd`

It publishes button state to:

- `team/<TEAM_ID>/<DEVICE_ID>/button/1/state`

Command payloads:

Plain text:

- `ON`
- `OFF`
- `TOGGLE`

JSON payload:

```json
{"relay":"2","command":"ON"}
```

You can send JSON even on wildcard command topics.

## First Edge Station Wiring (LED + Pushbutton)

Recommended for your first Pico W unit:

- LED module IN -> `GPIO15`
- Pushbutton -> `GPIO16` to `GND` (uses internal pull-up)

Behavior with default config:

- Press button: publish `PRESSED` and toggle relay/LED #1
- Release button: publish `RELEASED`
- Hold button for 3 seconds: trigger stage-1 action (`pairing_mode`)
- Hold button for 8 seconds: trigger stage-2 action (`reset_wifi_config`)

Long-press action options:

- `pairing_mode`: publish device event and set temporary pairing state
- `reset_wifi_config`: remove `wifi_credentials.json` (when enabled) and reboot

Wi-Fi credential file (optional):

- Enable `WIFI_USE_CREDENTIAL_FILE = True`
- Put JSON file `wifi_credentials.json` on Pico filesystem:

```json
{"ssid":"MyWiFi","password":"MySecret"}
```

- Long-press reset action can remove this file to restore default Wi-Fi config from `config.py`

## Reliability Features

- Automatic reconnect with exponential backoff (`RECONNECT_BASE_SEC` to `RECONNECT_MAX_SEC`)
- Offline queue with bounded size (`OFFLINE_QUEUE_MAX`) when network/broker is unstable
- Watchdog auto reset protection (`WATCHDOG_ENABLED`)

## Power Saving Features

- Light sleep in main loop (`USE_LIGHT_SLEEP`, `LOOP_SLEEP_MS`)
- Optional Wi-Fi power management (`WIFI_PM`)
- Optional CPU frequency tuning (`CPU_FREQ_HZ`)

## Notes

- If your relay board is active-low, set `active_high` to `False` for that relay item.
- If DHT22 read fails, humidity falls back to simulated value to keep data flow alive.
