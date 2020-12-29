#!/usr/bin/python3

import sys
import os
import hashlib
import json

__cert_dir = os.path.dirname(os.path.dirname(os.path.realpath(__file__)))

gen_certificates = {}
generated = {}


def extract_certificates(filename):
    with open(filename, "rt") as input_file:
        event = json.load(input_file)
    for participante in event.get("participantes", []):
        hash = hashlib.sha512(
            participante["email"].encode("utf-8")
        ).hexdigest()
        generated[participante["email"]] = hash
        user_data = gen_certificates.setdefault(hash, {})
        user_data["id"] = hash
        user_data["name"] = user_data.get("name", participante["nome"])
        certs = user_data["certificates"] = user_data.get("certificates", {})
        event_type = "remote" if event["cidade"] == "online" else "presential"
        event_data = {
            "type": event_type,
            "city": event["cidade"],
            "date": event["data"],
            "institution": event["instituicao"],
        }
        validation_code = participante["fingerprint"]
        role = {}
        presentations = []
        if "roles" in participante:
            if "participante" in participante["roles"]:
                role["participant"] = event["horas"]
            if "organizador" in participante["roles"]:
                role["organization"] = event["horas_organizacao"]
            if "palestrante" in participante["roles"]:
                for presentation in participante["palestras"]:
                    if isinstance(presentation, dict):
                        presentations.append(presentation)
                    else:
                        presentations.append({"title": presentation})
        else:
            role["participant"] = event["horas"]
        certs[validation_code] = {
            "validation_code": validation_code,
            "event": event_data,
            "role": role,
            "presentations": presentations,
        }
    # save certificate
    for id, data in gen_certificates.items():
        dir = "%s/certificates/%s" % (__cert_dir, id[0:2])
        if not os.path.isdir(dir):
            os.makedirs(dir)
        with open("%s/%s" % (dir, id), "wt") as cert_file:
            json.dump(data, cert_file, indent=4)


def extract_validation(filename):
    """Extract certificate validation data from input file."""
    with open(filename, "rt") as input_file:
        event = json.load(input_file)
    for participante in event.get("participantes", []):
        fingerprint = participante["fingerprint"]
        certificate = {
            "fingerprint": fingerprint,
            "nome": participante["nome"],
            "data": event["data"],
            "cidade": event["cidade"],
            "instituicao": event["instituicao"],
            "horas": 0,
            "organizacao": 0,
            "palestras": [],
        }
        if "roles" in participante:
            if "participante" in participante["roles"]:
                certificate["horas"] = event["horas"]
            if "organizador" in participante["roles"]:
                certificate["organizacao"] = event["horas_organizacao"]
            if "palestrante" in participante["roles"]:
                certificate["palestras"] = participante["palestras"]
        else:
            certificate["horas"] = event["horas"]
        # save certificate validation data
        dir = "%s/certificates/%s" % (__cert_dir, fingerprint[0:2])
        if not os.path.isdir(dir):
            os.makedirs(dir)
        with open("%s/%s" % (dir, fingerprint), "wt") as cert_file:
            json.dump(certificate, cert_file, indent=4)


if __name__ == "__main__":
    import socket

    if socket.getfqdn() != "jakku.local":
        print(
            """        \033[101;37;1m         ¡!  WARNING  !¡         \033[0m
        \033[101;37;1m  For Authorized Personnel Only  \033[0m

You should not run this if you are not \033[36mRafael Jeffman\033[0m.
Contact him at \033[36mrafasgj@gmail.com\033[0m
Or, even better for everyone, open an issue at

    \033[36;1mhttps://github.com/tchelinux/certificados/issues\033[0m
"""
        )
        sys.exit(1)

    print(f"Processing \033[32;1m{len(sys.argv)-1}\033[0m files.")

    for filename in sys.argv[1:]:
        extract_certificates(filename)
    for filename in sys.argv[1:]:
        extract_validation(filename)
    print_list = sorted(
        [
            "%s: %s..%s" % (email, hash[:8], hash[-8:])
            for email, hash in generated.items()
        ]
    )
    for item in print_list:
        print(item)
