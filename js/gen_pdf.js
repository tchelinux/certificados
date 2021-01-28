function render_certificate(data) {
    console.log(data)
    if (data) {
        date = data.event.date.split("-")
        if (date < "2020") {
            renderer = new OldCertificate()
        } else {
            renderer = new LiveCertificate()
        }
        renderer.render(data)
    }
}
