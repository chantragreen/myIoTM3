# Copy this file to config.py and adjust values for your team/device.

WIFI_SSID = "YOUR_WIFI_SSID"
WIFI_PASSWORD = "YOUR_WIFI_PASSWORD"

MQTT_BROKER = "172.16.3.205"
MQTT_PORT = 1883
MQTT_USERNAME = ""
MQTT_PASSWORD = ""
MQTT_KEEPALIVE = 60

# Optional Wi-Fi power management value for Pico W.
# None = keep MicroPython default, 0 = no power save.
WIFI_PM = None

TEAM_ID = "TEAM-DEMO"
DEVICE_ID = "pico-w-edge-01"

PUBLISH_INTERVAL_SEC = 5
HEARTBEAT_INTERVAL_SEC = 30

# Sensor mode:
# - "dht22": use DHT22 on DHT22_PIN
# - "simulated": no humidity sensor, generated value
HUMIDITY_SOURCE = "dht22"
DHT22_PIN = 16

# Relay configuration for multiple channels.
# id is used in topic: .../relay/<id>/cmd
RELAYS = [
	{"id": "1", "pin": 15, "active_high": True},
	{"id": "2", "pin": 14, "active_high": True},
]

# Reliability settings
OFFLINE_QUEUE_MAX = 80
RECONNECT_BASE_SEC = 2
RECONNECT_MAX_SEC = 30

# Watchdog settings
WATCHDOG_ENABLED = True
WATCHDOG_TIMEOUT_MS = 8000

# Power tuning
LOOP_SLEEP_MS = 250
USE_LIGHT_SLEEP = True
CPU_FREQ_HZ = 125000000
