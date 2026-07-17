import json
import gc
import machine
import time
try:
    import uos as os
except ImportError:
    import os

from actuator import MultiRelayController
from button_input import ButtonInput
from mqtt_service import MQTTService
from offline_queue import OfflinePublishQueue
from edge_sensors import SensorReader
from topic_builder import build_topics, button_state_topic, relay_state_topic
from wifi_manager import WiFiManager

try:
    import config
except ImportError:
    raise RuntimeError("Missing config.py. Copy config.example.py to config.py first.")


def now_ms():
    return time.ticks_ms()


def ticks_elapsed_ms(start_ms):
    return time.ticks_diff(now_ms(), start_ms)


def cfg(name, default_value):
    return getattr(config, name, default_value)


def load_wifi_credentials():
    ssid = config.WIFI_SSID
    password = config.WIFI_PASSWORD

    if not cfg("WIFI_USE_CREDENTIAL_FILE", False):
        return ssid, password

    path = cfg("WIFI_CREDENTIALS_PATH", "wifi_credentials.json")
    try:
        with open(path, "r") as fp:
            data = json.loads(fp.read())
            file_ssid = str(data.get("ssid", "")).strip()
            file_password = str(data.get("password", ""))
            if file_ssid:
                return file_ssid, file_password
    except Exception:
        pass

    return ssid, password


def clear_wifi_credentials_file():
    if not cfg("WIFI_USE_CREDENTIAL_FILE", False):
        return False

    path = cfg("WIFI_CREDENTIALS_PATH", "wifi_credentials.json")
    try:
        os.remove(path)
        return True
    except Exception:
        return False


if cfg("CPU_FREQ_HZ", None):
    try:
        machine.freq(cfg("CPU_FREQ_HZ", None))
    except Exception:
        pass


wifi_ssid, wifi_password = load_wifi_credentials()

wifi = WiFiManager(
    wifi_ssid,
    wifi_password,
    wifi_pm=cfg("WIFI_PM", None),
)

sensors = SensorReader(
    humidity_source=cfg("HUMIDITY_SOURCE", "simulated"),
    dht22_pin=cfg("DHT22_PIN", None),
)

relays = MultiRelayController(cfg("RELAYS", [{"id": "1", "pin": 15, "active_high": True}]))
topics = build_topics(config.TEAM_ID, config.DEVICE_ID)
queue = OfflinePublishQueue(max_items=cfg("OFFLINE_QUEUE_MAX", 80))

RELAY_IDS = relays.relay_ids()
DEFAULT_RELAY_ID = RELAY_IDS[0] if RELAY_IDS else "1"
CONNECTED_IP = ""
CONNECTED_MAC = ""
PAIRING_MODE_UNTIL_MS = 0

button = None
if cfg("BUTTON_ENABLED", False):
    try:
        hold_marks = [
            cfg("BUTTON_LONG_PRESS_STAGE1_MS", 3000),
            cfg("BUTTON_LONG_PRESS_STAGE2_MS", 8000),
        ]
        button = ButtonInput(
            pin_no=cfg("BUTTON_PIN", 16),
            pull_up=cfg("BUTTON_PULL_UP", True),
            active_low=cfg("BUTTON_ACTIVE_LOW", True),
            debounce_ms=cfg("BUTTON_DEBOUNCE_MS", 80),
            hold_marks_ms=hold_marks,
        )
    except Exception:
        button = None

wdt = None
if cfg("WATCHDOG_ENABLED", True):
    try:
        wdt = machine.WDT(timeout=cfg("WATCHDOG_TIMEOUT_MS", 8000))
    except Exception:
        wdt = None


def on_message(topic_bytes, payload_bytes):
    topic = topic_bytes.decode("utf-8")
    payload_raw = payload_bytes.decode("utf-8").strip()
    payload_upper = payload_raw.upper()

    relay_id = parse_relay_id_from_topic(topic)
    command = payload_upper

    if payload_raw.startswith("{") and payload_raw.endswith("}"):
        try:
            payload_json = json.loads(payload_raw)
            relay_id = str(payload_json.get("relay", relay_id or DEFAULT_RELAY_ID))
            command = str(payload_json.get("command", "")).strip().upper()
        except Exception:
            pass

    relay_id = relay_id or DEFAULT_RELAY_ID

    if not relays.has_relay(relay_id):
        return

    if command == "ON":
        relays.turn_on(relay_id)
    elif command == "OFF":
        relays.turn_off(relay_id)
    elif command == "TOGGLE":
        relays.toggle(relay_id)
    else:
        return

    publish_or_queue(relay_state_topic(topics["base"], relay_id), relays.state_text(relay_id), retain=True)


def parse_relay_id_from_topic(topic):
    prefix = topics["base"] + "/relay/"
    suffix = "/cmd"

    if not topic.startswith(prefix) or not topic.endswith(suffix):
        return None

    relay_id = topic[len(prefix) : -len(suffix)]
    if "/" in relay_id or relay_id == "":
        return None

    return relay_id


mqtt = MQTTService(
    client_id=config.DEVICE_ID,
    broker=config.MQTT_BROKER,
    port=config.MQTT_PORT,
    username=config.MQTT_USERNAME or None,
    password=config.MQTT_PASSWORD or None,
    keepalive=config.MQTT_KEEPALIVE,
    callback=on_message,
)


def feed_watchdog():
    if wdt is not None:
        try:
            wdt.feed()
        except Exception:
            pass


def power_sleep_ms(duration_ms):
    if duration_ms <= 0:
        return

    if cfg("USE_LIGHT_SLEEP", True):
        try:
            machine.lightsleep(duration_ms)
            return
        except Exception:
            pass

    time.sleep_ms(duration_ms)


def _direct_publish(topic, message, retain=False):
    mqtt.publish(topic, message, retain=retain)


def publish_or_queue(topic, message, retain=False):
    try:
        _direct_publish(topic, message, retain=retain)
    except Exception:
        queue.enqueue(topic, message, retain=retain)


def publish_status(online):
    pairing_active = time.ticks_diff(PAIRING_MODE_UNTIL_MS, now_ms()) > 0
    status_payload = {
        "device_id": config.DEVICE_ID,
        "team_id": config.TEAM_ID,
        "online": online,
        "relays": relays.state_map(),
        "queue_size": queue.size(),
        "pairing_mode": pairing_active,
    }
    publish_or_queue(topics["status"], json.dumps(status_payload), retain=True)


def publish_relay_states():
    for relay_id in RELAY_IDS:
        publish_or_queue(relay_state_topic(topics["base"], relay_id), relays.state_text(relay_id), retain=True)


def publish_button_state(is_pressed):
    topic = button_state_topic(topics["base"], cfg("BUTTON_ID", "1"))
    state = "PRESSED" if is_pressed else "RELEASED"
    publish_or_queue(topic, state, retain=False)


def publish_event(event_name, data=None):
    payload = {
        "event": event_name,
        "device_id": config.DEVICE_ID,
        "team_id": config.TEAM_ID,
        "ts_ms": now_ms(),
    }
    if isinstance(data, dict):
        payload.update(data)
    publish_or_queue(topics["event"], json.dumps(payload), retain=False)


def is_pairing_mode_active():
    return time.ticks_diff(PAIRING_MODE_UNTIL_MS, now_ms()) > 0


def activate_pairing_mode():
    global PAIRING_MODE_UNTIL_MS
    duration_sec = max(10, int(cfg("PAIRING_MODE_DURATION_SEC", 120)))
    PAIRING_MODE_UNTIL_MS = time.ticks_add(now_ms(), duration_sec * 1000)
    publish_event("pairing_mode_enter", {"duration_sec": duration_sec})
    publish_status(True)


def handle_long_press_action(action):
    action = str(action).strip().lower()

    if action == "reset_wifi_config":
        removed = clear_wifi_credentials_file()
        publish_event("wifi_config_reset", {"removed": removed})

        if removed and cfg("LONG_PRESS_RESET_REBOOT", True):
            publish_status(False)
            mqtt.disconnect()
            machine.reset()
            return

        # Fall back to pairing mode when no external credential file is configured.
        activate_pairing_mode()
        return

    activate_pairing_mode()


def handle_button_if_any():
    if button is None:
        return

    event = button.poll_event()
    if event is None:
        return

    event_type = event.get("type")

    if event_type == "pressed":
        publish_button_state(True)
        if cfg("BUTTON_PRESS_TOGGLE_RELAY", True) and not is_pairing_mode_active() and relays.has_relay(DEFAULT_RELAY_ID):
            relays.toggle(DEFAULT_RELAY_ID)
            publish_or_queue(
                relay_state_topic(topics["base"], DEFAULT_RELAY_ID),
                relays.state_text(DEFAULT_RELAY_ID),
                retain=True,
            )
        return

    if event_type == "released":
        publish_button_state(False)
        return

    if event_type == "long_pressed":
        mark_ms = int(event.get("mark_ms", 0))
        action = cfg("BUTTON_LONG_PRESS_STAGE1_ACTION", "pairing_mode")
        if mark_ms >= int(cfg("BUTTON_LONG_PRESS_STAGE2_MS", 8000)):
            action = cfg("BUTTON_LONG_PRESS_STAGE2_ACTION", "reset_wifi_config")

        publish_event(
            "button_long_press",
            {
                "action": action,
                "mark_ms": mark_ms,
                "duration_ms": int(event.get("duration_ms", mark_ms)),
            },
        )

        if cfg("BUTTON_LONG_PRESS_ENABLED", True):
            handle_long_press_action(action)


def publish_telemetry():
    data = sensors.read_all()
    publish_or_queue(topics["temperature"], str(data["temperature"]))
    publish_or_queue(topics["humidity"], str(data["humidity"]))
    publish_or_queue(topics["light"], str(data["light"]))


def publish_heartbeat(ip_address, mac_address):
    payload = {
        "device_id": config.DEVICE_ID,
        "team_id": config.TEAM_ID,
        "ip": ip_address,
        "mac": mac_address,
        "free_mem": gc.mem_free(),
        "uptime_ms": now_ms(),
        "queue_size": queue.size(),
    }
    publish_or_queue(topics["heartbeat"], json.dumps(payload))


def flush_offline_queue():
    queue.flush(_direct_publish)


def connect_all():
    global CONNECTED_IP, CONNECTED_MAC

    ifconfig = wifi.connect()
    CONNECTED_IP = ifconfig[0]
    CONNECTED_MAC = wifi.mac_address()

    mqtt.connect()
    mqtt.subscribe(topics["relay_cmd_wildcard"])

    flush_offline_queue()
    publish_relay_states()
    publish_status(True)
    publish_heartbeat(CONNECTED_IP, CONNECTED_MAC)

    return CONNECTED_IP, CONNECTED_MAC


def ensure_connected():
    retry_sec = cfg("RECONNECT_BASE_SEC", 2)

    while True:
        feed_watchdog()
        try:
            return connect_all()
        except Exception as ex:
            print("Reconnect failed:", ex)
            mqtt.disconnect()

            waited_ms = 0
            wait_target_ms = retry_sec * 1000
            while waited_ms < wait_target_ms:
                feed_watchdog()
                power_sleep_ms(200)
                waited_ms += 200

            retry_sec = min(cfg("RECONNECT_MAX_SEC", 30), max(1, retry_sec * 2))


def run():
    print("Starting Pico W Edge Station")
    print("Device:", config.DEVICE_ID)
    print("Team:", config.TEAM_ID)
    print("Wi-Fi SSID:", wifi_ssid)

    ip, mac = ensure_connected()
    print("Wi-Fi connected. IP:", ip)
    print("MAC:", mac)

    last_publish_ms = now_ms()
    last_heartbeat_ms = now_ms()
    gc_collect_ms = now_ms()

    while True:
        feed_watchdog()

        try:
            if not wifi.is_connected():
                ensure_connected()

            mqtt.check_messages()
            handle_button_if_any()

            if ticks_elapsed_ms(last_publish_ms) >= config.PUBLISH_INTERVAL_SEC * 1000:
                publish_telemetry()
                publish_relay_states()
                last_publish_ms = now_ms()

            if ticks_elapsed_ms(last_heartbeat_ms) >= config.HEARTBEAT_INTERVAL_SEC * 1000:
                publish_heartbeat(CONNECTED_IP, CONNECTED_MAC)
                last_heartbeat_ms = now_ms()

            if queue.size() > 0:
                flush_offline_queue()

            if ticks_elapsed_ms(gc_collect_ms) >= 15000:
                gc.collect()
                gc_collect_ms = now_ms()

            power_sleep_ms(cfg("LOOP_SLEEP_MS", 250))
        except Exception as ex:
            print("Loop error:", ex)
            mqtt.disconnect()
            ensure_connected()


if __name__ == "__main__":
    try:
        run()
    except KeyboardInterrupt:
        pass
    finally:
        try:
            publish_status(False)
            publish_relay_states()
        except Exception:
            pass
        mqtt.disconnect()
