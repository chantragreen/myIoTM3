"""Install required MicroPython libraries on Pico W.

Run this file once on the Pico W from Thonny before running main.py.
"""

try:
    import mip
except ImportError:
    raise RuntimeError(
        "This MicroPython firmware does not include mip. Update Pico W firmware or install umqtt.simple manually in Thonny."
    )


def install(package_name):
    print("Installing:", package_name)
    mip.install(package_name)


def verify_umqtt():
    try:
        import umqtt.simple  # noqa: F401
        return True
    except Exception:
        return False


def main():
    candidates = [
        "umqtt.simple",
        "micropython-umqtt.simple",
    ]

    installed = False
    for package_name in candidates:
        try:
            install(package_name)
            if verify_umqtt():
                installed = True
                break
        except Exception as ex:
            print("Install failed for {} -> {}".format(package_name, ex))

    if not installed and verify_umqtt():
        installed = True

    if installed:
        print("Dependency installation completed.")
        print("Next step: reset Pico W and run preflight_check.py")
        return

    print("Dependency installation failed.")
    print("Try Thonny > Tools > Manage packages... and install 'umqtt.simple' manually.")
    print("If still failing, update MicroPython firmware and try again.")


if __name__ == "__main__":
    main()