"""Preflight checks for Pico W edge station.

Run this on Pico W before main.py to validate:
1) umqtt.simple import
2) Wi-Fi connectivity
3) MQTT connectivity and publish
"""

import json
import time


def print_ok(message):
    print("PASS:", message)


def print_fail(message):
    print("FAIL:", message)


def load_config():
    import config

    return config


def check_umqtt_import():
    try:
        import umqtt.simple  # noqa: F401
        print_ok("import umqtt.simple")
        return True
    except Exception as ex:
        print_fail("import umqtt.simple -> {}".format(ex))
        print("Hint: run install_deps.py on Pico W")
        return False


def check_wifi(config):
    try:
        from wifi_manager import WiFiManager

        wifi = WiFiManager(
            config.WIFI_SSID,
            config.WIFI_PASSWORD,
            wifi_pm=getattr(config, "WIFI_PM", None),
        )
        ifconfig = wifi.connect()
        print_ok("Wi-Fi connected: {}".format(ifconfig[0]))
        return True, wifi
    except Exception as ex:
        print_fail("Wi-Fi connect -> {}".format(ex))
        return False, None


def check_mqtt(config):
    try:
        from mqtt_service import MQTTService
        from topic_builder import build_topics

        topics = build_topics(config.TEAM_ID, config.DEVICE_ID)
        mqtt = MQTTService(
            client_id="{}-preflight".format(config.DEVICE_ID),
            broker=config.MQTT_BROKER,
            port=config.MQTT_PORT,
            username=(config.MQTT_USERNAME or None),
            password=(config.MQTT_PASSWORD or None),
            keepalive=config.MQTT_KEEPALIVE,
        )
        mqtt.connect()
        print_ok("MQTT connected")

        payload = {
            "event": "preflight_check",
            "device_id": config.DEVICE_ID,
            "team_id": config.TEAM_ID,
            "ts": time.ticks_ms(),
        }
        mqtt.publish(topics["event"], json.dumps(payload), retain=False)
        print_ok("MQTT publish test message")
        mqtt.disconnect()
        return True
    except Exception as ex:
        print_fail("MQTT check -> {}".format(ex))
        return False


def check_config_placeholders(config):
    ok = True

    if str(config.WIFI_SSID).strip() in ("", "YOUR_WIFI_SSID"):
        print_fail("WIFI_SSID is not set")
        ok = False
    if str(config.WIFI_PASSWORD).strip() in ("", "YOUR_WIFI_PASSWORD"):
        print_fail("WIFI_PASSWORD is not set")
        ok = False

    if ok:
        print_ok("config Wi-Fi values set")
    return ok


def main():
    print("=== Pico W Preflight Check ===")

    all_ok = True
    all_ok = check_umqtt_import() and all_ok

    try:
        config = load_config()
    except Exception as ex:
        print_fail("load config.py -> {}".format(ex))
        print("Hint: copy config.example.py to config.py and edit values")
        print("RESULT: FAILED")
        return

    all_ok = check_config_placeholders(config) and all_ok

    wifi_ok, _wifi = check_wifi(config)
    all_ok = wifi_ok and all_ok

    if wifi_ok:
        all_ok = check_mqtt(config) and all_ok

    if all_ok:
        print("RESULT: ALL CHECKS PASSED")
    else:
        print("RESULT: FAILED")


if __name__ == "__main__":
    main()
