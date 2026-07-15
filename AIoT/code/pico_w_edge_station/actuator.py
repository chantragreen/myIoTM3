import machine


class MultiRelayController:
    def __init__(self, relays):
        self._relays = {}

        for item in relays:
            relay_id = str(item.get("id"))
            pin_no = int(item.get("pin"))
            active_high = bool(item.get("active_high", True))
            pin = machine.Pin(pin_no, machine.Pin.OUT)

            self._relays[relay_id] = {
                "pin": pin,
                "active_high": active_high,
                "state": False,
            }
            self.set_state(relay_id, False)

    def _raw_for_state(self, active_high, is_on):
        if active_high:
            return 1 if is_on else 0
        return 0 if is_on else 1

    def relay_ids(self):
        return sorted(self._relays.keys())

    def has_relay(self, relay_id):
        return str(relay_id) in self._relays

    def set_state(self, relay_id, is_on):
        key = str(relay_id)
        if key not in self._relays:
            return False

        relay = self._relays[key]
        relay["state"] = bool(is_on)
        relay["pin"].value(self._raw_for_state(relay["active_high"], relay["state"]))
        return True

    def turn_on(self, relay_id):
        return self.set_state(relay_id, True)

    def turn_off(self, relay_id):
        return self.set_state(relay_id, False)

    def toggle(self, relay_id):
        key = str(relay_id)
        if key not in self._relays:
            return False
        return self.set_state(key, not self._relays[key]["state"])

    def state_text(self, relay_id):
        key = str(relay_id)
        if key not in self._relays:
            return "UNKNOWN"
        return "ON" if self._relays[key]["state"] else "OFF"

    def state_map(self):
        return {relay_id: self.state_text(relay_id) for relay_id in self.relay_ids()}
