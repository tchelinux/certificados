class OldCertificate extends BaseCertificate {

    constructor() {
        super()
        this.LEFT = 70
    }

    render(data) {
        // create a document and pipe to a blob
        var doc = this.create_pdf()
        var stream = doc.pipe(blobStream());

        if (data.role.organizer)
            this.add_organizer_certificate(doc, data)
        if (data.role.participant)
            this.add_participant_certificate(doc, data)

        data.presentations.forEach((presentation) => {
            this.add_presentation_certificate(doc, data, presentation)
        })

        doc.end();
        stream.on('finish', function() {
            window.open(stream.toBlobURL('application/pdf'),'_blank')
        });
    }

    add_organizer_certificate(doc, data) {
        const hours = data.role.organizer
        let event = data.event
        const text = `colaborou, por ${hours} horas, na organização do evento realizado em ${getDateString(event.date)}, nas dependências da ${event.institution}`

        this.new_page(doc, data, "Organizador",
                 (doc) => { doc.text(text, LEFT, 340, {align: "left"}) })
    }

    add_participant_certificate(doc, data) {
        const hours = data.role.participant
        let event = data.event
        const text = `participou do evento com ${hours} horas de duração, realizado em ${getDateString(event.date)}, nas dependências da ${event.institution}.`

        this.new_page(doc, data, "Participante",
            (doc) => { doc.text(text, LEFT, 340, {align: "left"}) })

    }

    add_presentation_certificate(doc, data, presentation) {
        let event = data.event
        const text = `apresentou a palestra ${presentation.title}, no evento realizado em ${getDateString(event.date)}, nas dependências da ${event.institution}.`

        this.new_page(doc, data, "Palestrante",
            (doc) => {
                doc.text("apresentou a palestra ", this.LEFT, 340, {align: "left", continued: true})
                   .font(this.BOLD)
                   .text(`${presentation.title}`, {continued: true,})
                   .font(this.REGULAR)
                   .text(` no evento realizado em ${getDateString(event.date)}, nas dependências da ${event.institution}.`)
               }
        )
    }

    new_page(doc, data, title, print_text) {
        // draw some text
        const url = "https://certificados.tchelinux.org"
        //const url = "http://localhost:4000/" // use it for debug.
        const year = data.event.date.split("-")[0]
        doc.addPage()
            .font(this.REGULAR)
            .image(getBase64Image('tux'), 250, -30, {fit: [790, 790], opacity: 0.3})

        this.add_header(doc, title, data.event.city, year)
        this.add_certificate_name(doc, data.name)

        doc.fontSize(16)
        print_text(doc)

        doc.fontSize(12).lineGap(2)
           .text("Código de Verificação:", 510, 510, {width: 220, align: "center"})
           .font(this.BOLD)
           .text(data.validation_code, {
               width: 220,
               align: "center",
               link: `${url}/?verify=${data.validation_code}`,
               underline: false})
           .font(this.REGULAR)
           .text(`${url}`, {
               width: 220,
               align: "center",
               link: `${url}`,
               underline: false
           })
    }

    add_header(doc, title, city, year) {
        doc.fontSize(36).font(this.BOLD).lineGap(10)
            .text(`Certificado de ${title}`.toUpperCase(), 0, 15, {align: "center"})
            .fontSize(24).text("Seminário de Software Livre", 0, 105, {align: "center"})
            .fontSize(32).text(`Tchelinux ${city} ${year}`, 0, 150, {align: "center"})
            .font(this.REGULAR).fontSize(16)
            .text("O Grupo de Usuários de Software Livre Tchelinux certifica que", this.LEFT, 250)
    }

    add_certificate_name(doc, name) {
        doc.fontSize(28)
            .font(this.BOLD).text(`${name}`, 0, 290, {align: "center"})
            .font(this.REGULAR)
    }
}
