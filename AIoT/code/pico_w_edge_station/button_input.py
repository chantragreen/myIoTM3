import machine
import time


class ButtonInput:
    def __init__(
        self,
        pin_no,
        pull_up=True,
        active_low=True,
        debounce_ms=80,
        hold_marks_ms=None,
    ):
        mode = machine.Pin.PULL_UP if pull_up else machine.Pin.PULL_DOWN
        self._pin = machine.Pin(pin_no, machine.Pin.IN, mode)
        self._active_low = active_low
        self._debounce_ms = max(10, int(debounce_ms))

        if hold_marks_ms is None:
            hold_marks_ms = [3000]

        normalized = []
        for value in hold_marks_ms:
            try:
                mark = max(500, int(value))
                normalized.append(mark)
            except Exception:
                pass
        self._hold_marks_ms = sorted(set(normalized)) or [3000]

        self._stable = self.is_pressed()
        self._last_raw = self._stable
        self._last_change_ms = time.ticks_ms()
        self._pressed_since_ms = self._last_change_ms if self._stable else None
        self._fired_marks = set()

    def is_pressed(self):
        raw = bool(self._pin.value())
        return (not raw) if self._active_low else raw

    def poll_event(self):
        now = time.ticks_ms()
        raw_state = self.is_pressed()

        if raw_state != self._last_raw:
            self._last_raw = raw_state
            self._last_change_ms = now
            return None

        if raw_state != self._stable and time.ticks_diff(now, self._last_change_ms) >= self._debounce_ms:
            self._stable = raw_state
            if self._stable:
                self._pressed_since_ms = now
                self._fired_marks = set()
                return {"type": "pressed"}

            self._pressed_since_ms = None
            self._fired_marks = set()
            return {"type": "released"}

        if self._stable and self._pressed_since_ms is not None:
            duration_ms = time.ticks_diff(now, self._pressed_since_ms)
            for mark in self._hold_marks_ms:
                if duration_ms >= mark and mark not in self._fired_marks:
                    self._fired_marks.add(mark)
                    return {
                        "type": "long_pressed",
                        "mark_ms": mark,
                        "duration_ms": duration_ms,
                    }

        return None
