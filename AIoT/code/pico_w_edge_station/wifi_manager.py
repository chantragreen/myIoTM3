import network
import time


class WiFiManager:
    def __init__(self, ssid, password, max_wait_sec=20, wifi_pm=None):
        self._ssid = ssid
        self._password = password
        self._max_wait_sec = max_wait_sec
        self._wifi_pm = wifi_pm
        self._wlan = network.WLAN(network.STA_IF)

    @property
    def wlan(self):
        return self._wlan

    def connect(self):
        self._wlan.active(True)

        if self._wifi_pm is not None:
            try:
                self._wlan.config(pm=self._wifi_pm)
            except Exception:
                pass

        if self._wlan.isconnected():
            return self._wlan.ifconfig()

        self._wlan.connect(self._ssid, self._password)

        waited = 0
        while waited < self._max_wait_sec and not self._wlan.isconnected():
            time.sleep(1)
            waited += 1

        if not self._wlan.isconnected():
            raise RuntimeError("Wi-Fi connection failed")

        return self._wlan.ifconfig()

    def is_connected(self):
        return self._wlan.isconnected()

    def mac_address(self):
        mac_bytes = self._wlan.config("mac")
        return ":".join("%02X" % part for part in mac_bytes)
