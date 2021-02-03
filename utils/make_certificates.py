#!/usr/bin/python3
"""Create certificate and validation files for Tchelinux events."""

import sys
import hashlib
import csv
import os
import datetime
import re
import json

try:
    import yaml
except ImportError:
    __NO_YAML__ = True
else:
    __NO_YAML__ = False


__version__ = "1.0"
__use_csv = False  # pylint: disable=invalid-name
__cert_dir = os.path.dirname(os.path.dirname(os.path.realpath(__file__)))


def parse_arguments(args):
    """Parse CLI arguments."""
    global __use_csv  # pylint: disable=global-statement, invalid-name
    usage = """
usage: make_certificates.py [-h] [--version] [-c] EVENT USER_DATA...

Create event certificate description files.

    -h, -help      Display this help and exit.
    --version      Display system version and exit.
    -c, --csv      Use CSV to read USER_DATA.

    EVENT          A YAML or JSON file describing the event.
    USER_DATA      One or more YAML, JSON or CSV file describing the user
                   certificates to be generated.
"""
    optionals = ["-h", "-c", "--help", "--csv", "--version"]
    min_args = 3
    if "-h" in sys.argv or "--help" in sys.argv:
        print(usage)
        sys.exit(0)
    if "--version" in sys.argv:
        print(f"Certificate Data version: {__version__}")
        sys.exit()
    if "-c" in sys.argv or "--csv" in sys.argv:
        __use_csv = True
        min_args += 1
    if len(args) < min_args:
        print("ERROR: Missing configuration files.")
        print(usage)
        sys.exit(1)
    return [arg for arg in args[1:] if arg not in optionals]


def load_csv_data(csvfile):
    """Load certificate data from CSV file."""
    entries = []
    csvreader = csv.reader(csvfile)
    for row in csvreader:
        data = dict(
            name=row[0].strip(),
            email=row[1].strip(),
            role=row[2].strip(),
            presentations=[r.strip() for r in row[3:]],
        )
        entries.append(data)
    return entries


def load_event_configuration(filename):
    """Load configuration data for an event."""
    with open(filename, "rt") as input_file:
        return (
            json.load(input_file)
            if __NO_YAML__
            else yaml.safe_load(input_file.read())
        )
    raise Exception(f"Could not load event configuration file: {filename}")


def load_certs_configuration(cert_files):
    """Load configuration data for certificates."""
    certificates = []
    for cert_file in cert_files:
        with open(cert_file, "rt") as input_file:
            if __use_csv:
                certificates.extend(load_csv_data(input_file))
            elif __NO_YAML__:
                certificates.extend(json.load(input_file))
            else:
                certificates.extend(yaml.safe_load(input_file.read()))
    return certificates


def __get_event_date_string(event):
    if isinstance(event["date"], list):
        if not event["date"]:
            raise Exception("Event date not set!")
        event_date = "/".join(
            [
                (
                    datetime.datetime.combine(d, datetime.datetime.min.time())
                ).strftime("%Y-%m-%d")
                for d in event["date"]
            ]
        )
    elif isinstance(event["date"], dict):
        dates = [
            event["date"][t] for t in ["from", "to"] if t in event["date"]
        ]
        if not dates:
            raise Exception("Event date not set!")
        event_date = "/".join(
            [
                (
                    datetime.datetime.combine(d, datetime.datetime.min.time())
                ).strftime("%Y-%m-%d")
                for d in dates
            ]
        )
    else:
        event_date = (
            datetime.datetime.combine(
                event["date"], datetime.datetime.min.time()
            )
        ).strftime("%Y-%m-%d")
    return re.sub("/*$", "", event_date)


def create_certificates(event, certificate_data):
    """Create the list (`email` dict) of certificates for the event."""
    event_key = __get_event_date_string(event)
    if "city" in event:
        event["type"] = "presential"
        event["title"] = event.get("title", "Seminário de Software Livre")
    else:
        event["type"] = "online"
        event["title"] = event.get("title", "Tchelinux Live")
    certificates = {}
    for data in certificate_data:
        user_cert = certificates.setdefault(data["email"], {})
        # pseudo-anonymization with sha512 of the user email
        if "id" not in user_cert:
            user_cert["id"] = hashlib.sha512(
                data["email"].encode("utf-8")
            ).hexdigest()
            user_cert["name"] = data["name"]
        user_id = user_cert["id"]
        # generate verification code.
        if "verification_code" not in user_cert:
            code_key = f"{event_key}{user_id}"
            validation_code = hashlib.sha256(code_key.encode("utf-8"))
            user_cert["validation_code"] = validation_code.hexdigest()
        roles = list(set(user_cert.get("role", []) + [data["role"]]))
        user_cert["role"] = roles
        presentations = user_cert.setdefault("presentations", [])
        presentations.extend(data.get("presentations", []))
    return event, certificates


def __ensure_cert_directory(hash):
    directory = "%s/certificates/%s" % (__cert_dir, hash[0:2])
    if not os.path.isdir(directory):
        os.makedirs(directory)
    return directory


def save_certificates(event, certificates):
    """Save user certificate and verification files for the event."""
    event_key = __get_event_date_string(event)
    base_event_data = {
        "type": event["type"],
        "title": event["title"],
        "participation": event["participation"],
        "organization": event["organization"],
        "date": event_key,
    }
    print(f"Certificates for `{event['type']}` event held on `{event_key}`.")
    counters = {"participation": 0, "presentations": 0, "organization": 0}
    for data in certificates.values():
        # Save certificate data.
        directory = __ensure_cert_directory(data["validation_code"])
        filename = "%s/%s" % (directory, data["validation_code"])
        with open(filename, "wt") as cert_file:
            cert_data = base_event_data.copy()
            cert_data.update(data)
            json.dump(cert_data, cert_file, indent=4)
        # Update user data.
        user_id = data["id"]
        directory = __ensure_cert_directory(user_id)
        filename = "%s/%s" % (directory, user_id)
        if os.path.isfile(filename):
            with open(filename, "rt") as cert_file:
                user_data = json.load(cert_file)
        else:
            user_data = {}
        if "name" not in user_data:
            user_data["id"] = user_id
            user_data["name"] = data["name"]
        evt_data = {
            "event": base_event_data,
            "validation_code": data["validation_code"],
            "role": {},
            "presentations": [],
        }
        if "organizador" in data["role"]:
            evt_data["role"]["organization"] = event["organization"]
            counters["organization"] += 1
        if "participante" in data["role"]:
            evt_data["role"]["participation"] = event["participation"]
            counters["participation"] += 1
        for presentation in data["presentations"]:
            evt_data["presentations"].append({"title": presentation})
        counters["presentations"] += len(data["presentations"])
        cert_list = user_data.setdefault("certificates", {})
        cert_list[data["validation_code"]] = evt_data
        with open(filename, "wt") as cert_file:
            json.dump(user_data, cert_file, indent=4)

    print(
        f"""
Created new certificates for `{event['title']}`:
    - Number of participants: {counters["participation"]}
    - Number of presenters: {counters["presentations"]}
    - Number of organizers: {counters["organization"]}
"""
    )


def main():
    """Program entry point."""
    event_file, *cert_files = parse_arguments(sys.argv)
    event = {
        "participation": 6,
        "organization": 8,
    }
    loaded_data = load_event_configuration(event_file)
    event.update(loaded_data)
    certificates = load_certs_configuration(cert_files)

    event, certificates = create_certificates(event, certificates)
    save_certificates(event, certificates)


if __name__ == "__main__":
    main()
