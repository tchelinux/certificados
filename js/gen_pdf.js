function render_certificate(data) {
    let entries = data
    if (data.validation_code) {
        entries = Object()
        entries[data.validation_code] = data
    }
    for (entry_hash in entries) {
        const entry = entries[entry_hash]
        console.log("Preparing certificate for:")
        console.log(entry)
        if (entry) {
            date = entry.event.date.split("-")[0]
            if (date < "2020") {
                console.log("Old Certificate selected.")
                renderer = new OldCertificate()
            } else {
                console.log("Live Certificate selected.")
                renderer = new LiveCertificate()
            }
            console.log("Rendering certificate.")
            renderer.render(entry)
            console.log("Certificate rendered.")
        }
    }
}
