
class BaseCertificate {

    constructor() {
        this.BOLD = "Helvetica-Bold"
        this.REGULAR = "Helvetica"
    }

    create_pdf() {
        return  new PDFDocument({
            layout: "landscape",
            size: "a4",
            autoFirstPage: false,
            margin: 10
        });
    }

    render(data) {
        throw new Error('Certificate render() not implemented.')
    }
}

function render_certificate(data) {
    console.log(data)
    if (data) {
        date = data.event.date.split("-")
        if (date < "2020")
            renderer = new OldCertificate()
        else
            renderer = new LiveCertificate(data)
        renderer.render(data)
    }
}
