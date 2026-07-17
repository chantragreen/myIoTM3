import machine
import random
import time

try:
    import dht
except ImportError:
    dht = None


class SensorReader:
    def __init__(self, humidity_source="simulated", dht22_pin=None):
        self._adc_temp = machine.ADC(4)
        self._adc_light = machine.ADC(0)
        self._humidity_source = humidity_source
        self._dht22 = None

        if humidity_source == "dht22" and dht is not None and dht22_pin is not None:
            self._dht22 = dht.DHT22(machine.Pin(dht22_pin))

    def read_temperature_c(self):
        raw = self._adc_temp.read_u16()
        voltage = (raw * 3.3) / 65535
        # Formula from Raspberry Pi Pico RP2040 internal temp sensor docs.
        temp_c = 27 - (voltage - 0.706) / 0.001721
        return round(temp_c, 2)

    def read_light_raw(self):
        return self._adc_light.read_u16()

    def read_humidity_percent(self):
        if self._humidity_source == "dht22" and self._dht22 is not None:
            try:
                self._dht22.measure()
                return round(float(self._dht22.humidity()), 2)
            except Exception:
                # Fall back to simulated humidity when sensor read fails.
                pass

        if self._humidity_source == "simulated" or self._dht22 is None:
            base = 60 + 10 * (time.ticks_ms() % 30000) / 30000
            noise = random.uniform(-2.0, 2.0)
            return round(max(20.0, min(90.0, base + noise)), 2)

        return 0.0

    def read_all(self):
        return {
            "temperature": self.read_temperature_c(),
            "humidity": self.read_humidity_percent(),
            "light": self.read_light_raw(),
        }
