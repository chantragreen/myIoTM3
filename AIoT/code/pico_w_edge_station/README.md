# Pico W Edge Station Code

This folder contains MicroPython code for Raspberry Pi Pico W to run as an AIoT edge station.

## Files

- `main.py`: app entry point
- `config.example.py`: configuration template
- `wifi_manager.py`: Wi-Fi connection helper
- `mqtt_service.py`: MQTT client wrapper
- `sensors.py`: sensor reading (internal temp + light ADC + DHT22 humidity)
- `actuator.py`: multi-relay GPIO output control
- `topic_builder.py`: MQTT topic generation
- `offline_queue.py`: bounded offline publish queue
- `boot.py`: minimal boot script

## Quick Start

1. Install MicroPython firmware on Pico W.
2. Copy all files in this directory to Pico W filesystem.
3. Duplicate `config.example.py` as `config.py` and update values.
4. Reboot Pico W.

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

TEAM_ID = "TEAM-DEMO"
DEVICE_ID = "pico-w-edge-01"

PUBLISH_INTERVAL_SEC = 5
HEARTBEAT_INTERVAL_SEC = 30

HUMIDITY_SOURCE = "dht22"
DHT22_PIN = 16

RELAYS = [
	{"id": "1", "pin": 15, "active_high": True},
	{"id": "2", "pin": 14, "active_high": True},
]

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
- `DATA` -> `GPIO16` (or your configured `DHT22_PIN`)
- Add a 10k pull-up resistor between `DATA` and `3V3`

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
