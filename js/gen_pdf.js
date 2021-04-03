function render_certificate(data) {
    let entries = data
    if (data.validation_code) {
        entries = Object()
        entries[data.validation_code] = data
    }
    for (entry_hash in entries) {
        const entry = entries[entry_hash]
        console.log(entry)
        if (entry) {
            date = entry.event.date.split("-")[0]
            if (date < "2020") {
                renderer = new OldCertificate()
            } else {
                renderer = new LiveCertificate()
            }
            renderer.render(entry)
        }
    }
}
