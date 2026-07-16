def build_topics(team_id, device_id):
    base = "team/{}/{}".format(team_id, device_id)

    return {
        "base": base,
        "temperature": "{}/temperature".format(base),
        "humidity": "{}/humidity".format(base),
        "light": "{}/light".format(base),
        "heartbeat": "{}/heartbeat".format(base),
        "status": "{}/status".format(base),
        "event": "{}/event".format(base),
        "button": "{}/button/1/state".format(base),
        "relay_cmd_wildcard": "{}/relay/+/cmd".format(base),
    }


def relay_cmd_topic(base_topic, relay_id):
    return "{}/relay/{}/cmd".format(base_topic, relay_id)


def relay_state_topic(base_topic, relay_id):
    return "{}/relay/{}/state".format(base_topic, relay_id)


def button_state_topic(base_topic, button_id="1"):
    return "{}/button/{}/state".format(base_topic, button_id)
