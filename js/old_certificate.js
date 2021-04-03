class OldCertificate extends BaseCertificate {

    constructor() {
        super()
        this.LEFT = 70
        this.REGULAR = this.SANS_REGULAR
    }

    add_organizer_certificate(data) {
        const hours = data.role.organizer
        let event = data.event
        const text = `colaborou, por ${hours} horas, na organização do ` +
            `evento realizado em ${getDateString(event.date)}, nas ` +
            `dependências da ${event.institution}`

        this.new_page(data, "Organizador",
            (the_doc) => {
                the_doc.text(text, this.LEFT, 340, {align: "left"})
            }
        )
    }

    add_participant_certificate(data) {
        const hours = data.role.participant
        const event = data.event
        const text = `participou do evento com ${hours} horas de duração, realizado em ${getDateString(event.date)}, nas dependências da ${event.institution}.`

        this.new_page(data, "Participante",
            (the_doc) => {
                the_doc.text(text, this.LEFT, 340, {align: "left"})
            })

    }

    add_presentation_certificate(data, presentation) {
        const event = data.event
        const date = getDateString(event.date)
        const text = `apresentou a palestra ${presentation.title}, no evento` +
            ` realizado em ${date}, nas dependências da ${event.institution}.`

        this.new_page(data, "Palestrante",
            (the_doc) => {
                the_doc
                    .text("apresentou a palestra ", this.LEFT, 340,
                        {continued: true}
                    )
                    .font(this.SANS_BOLD)
                    .text(`${presentation.title}`, {continued: true})
                    .font(this.SANS_REGULAR)
                    .text(
                        ` no evento realizado em ${date}, nas dependências ` +
                        `da ${event.institution}.`
                    )
               }
        )
    }

    new_page(data, role, print_text) {
        const url = "https://certificados.tchelinux.org"
        //const url = "http://localhost:4000/" // use it for debug.
        const year = data.event.date.split("-")[0]
        this.doc.addPage()
            .font(this.SANS_REGULAR)
            .image(getBase64Image('tux', 0.4), 250, -30, {fit: [790, 790]})

        let title = "Seminário de Software Livre"
        if (data.title) {
            title = data.title
        }
        this.add_header(title, role, data.event.city, year)
        this.add_certificate_name(data.name)

        this.doc.fontSize(16)
        print_text(this.doc)

        this.add_verification_code(data, 510, 510)
    }

    add_header(title, role, city, year) {
        const intro_text = "O Grupo de Usuários de Software Livre Tchelinux " +
                           "certifica que"
        this.doc.fontSize(36).font(this.SANS_BOLD).lineGap(10)
            .text(`Certificado de ${role}`.toUpperCase(), 0, 15, {
                align: "center"
            })
            .fontSize(24).text(title, 0, 105, {
                align: "center"
            })
            .fontSize(32).text(`Tchelinux ${city} ${year}`, 0, 150, {
                align: "center"
            })
            .font(this.SANS_REGULAR).fontSize(16)
            .text(intro_text, this.LEFT, 250)
    }

    add_certificate_name(name) {
        this.doc.fontSize(28)
            .font(this.SANS_BOLD).text(`${name}`, 0, 290, {align: "center"})
            .font(this.SANS_REGULAR)
    }
}
