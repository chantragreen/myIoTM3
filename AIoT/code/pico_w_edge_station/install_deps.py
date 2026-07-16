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


def main():
    install("umqtt.simple")
    print("Dependency installation completed.")
    print("Next step: reset Pico W and run main.py")


if __name__ == "__main__":
    main()