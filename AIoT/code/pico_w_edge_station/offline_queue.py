class OfflinePublishQueue:
    def __init__(self, max_items=80):
        self._max_items = max_items
        self._items = []

    def size(self):
        return len(self._items)

    def enqueue(self, topic, message, retain=False):
        if len(self._items) >= self._max_items:
            # Drop oldest message to keep memory bounded.
            self._items.pop(0)

        self._items.append(
            {
                "topic": topic,
                "message": message,
                "retain": retain,
            }
        )

    def flush(self, publish_fn):
        remaining = []

        for index, item in enumerate(self._items):
            try:
                publish_fn(item["topic"], item["message"], item["retain"])
            except Exception:
                remaining.append(item)
                remaining.extend(self._items[index + 1 :])
                break

        self._items = remaining
