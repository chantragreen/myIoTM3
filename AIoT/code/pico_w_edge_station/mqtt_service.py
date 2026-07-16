try:
    from umqtt.simple import MQTTClient
except ImportError as ex:
    raise ImportError(
        "Missing MicroPython dependency 'umqtt.simple'. On Pico W in Thonny, run install_deps.py once or install 'umqtt.simple' from Tools > Manage packages."
    ) from ex


class MQTTService:
    def __init__(
        self,
        client_id,
        broker,
        port=1883,
        username=None,
        password=None,
        keepalive=60,
        callback=None,
    ):
        self._client = MQTTClient(
            client_id=client_id,
            server=broker,
            port=port,
            user=username,
            password=password,
            keepalive=keepalive,
        )
        self._callback = callback

        if callback is not None:
            self._client.set_callback(callback)

    def connect(self):
        self._client.connect()

    def disconnect(self):
        try:
            self._client.disconnect()
        except Exception:
            pass

    def publish(self, topic, message, retain=False):
        if isinstance(topic, str):
            topic = topic.encode("utf-8")
        if isinstance(message, str):
            message = message.encode("utf-8")
        self._client.publish(topic, message, retain=retain)

    def subscribe(self, topic):
        if isinstance(topic, str):
            topic = topic.encode("utf-8")
        self._client.subscribe(topic)

    def check_messages(self):
        self._client.check_msg()
