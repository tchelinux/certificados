class LiveCertificate extends BaseCertificate {

    constructor() {
        super()
        this.fonts = {
            REGULAR: {
                name: "Montserrat-Regular",
                url: '/fonts/Montserrat/Montserrat-Regular.ttf'
            },
            BOLD: {
                name: "Montserrat-Bold",
                url: '/fonts/Montserrat/Montserrat-Bold.ttf'
            },
            SEMIBOLD: {
                name: "Montserrat-SemiBold",
                url: '/fonts/Montserrat/Montserrat-SemiBold.ttf'
            },
            BLACK: {
                name: "Montserrat-Black",
                url: '/fonts/Montserrat/Montserrat-Black.ttf'
            }
        }
        this.LEFT = 80
        this.TEXT_SIZE = 14
    }

    add_organizer_certificate(data) {
        const hours = data.role.organizer
        let event = data.event
        const text = `colaborou, por ${hours} horas, na organização do evento realizado em ${getDateString(event.date)}, nas dependências da ${event.institution}`

        this.new_page(this.doc, data, "Organizador",
            (the_doc) => {
                the_doc.text(text, LEFT, 370, {align: "left"})
            })
    }

    add_participant_certificate(data) {
        const hours = data.role.participation
        let event = data.event
        let text = `participou do evento com ${hours} horas de duração, realizado em ${getDateString(event.date)}`
        if (event.institution) {
            text += `, nas dependências da ${event.institution}.`
        } else {
            text += "."
        }

        this.new_page(data, "Participante",
            (the_doc) => {
                the_doc.text(text, LEFT, 370, {align: "left"})
            })
    }

    add_presentation_certificate(data, presentation) {
        let event = data.event
        const date = getDateString(event.date)

        let extra_text = ` no evento realizado `
        if (data.type == "presential") {
            extra_text += `nas dependências da ${event.institution}`
        } else {
            extra_text += `remotamente`
        }
        extra_text += `, em ${date}.`

        this.new_page(data, "Palestrante",
            (the_doc) => {
                 the_doc.font(this.REGULAR).fontSize(this.TEXT_SIZE)
                 .text("apresentou a palestra ", this.LEFT, 370,
                       {align: "left", continued: true})
                 .font(this.BOLD)
                 .text(`${presentation.title}`, {continued: true})
                 .font(this.REGULAR)
                 .text(extra_text)
            }
        )
    }

    new_page(data, role, print_text) {
        const event = data.event
        let city = ""
        const url = "http://localhost:4000/" // use it for debug.
        const year = data.event.date.split("-")[0]
        const options = {
            size: 'A4',
            layout: 'landscape',
            margin: 20,
        }
        this.doc.addPage(options)
            .font(this.REGULAR)
            .image(getBase64Image('tchelinux', 1.0), 180, 60,
                   {fit: [650, 650]})

        let title = "Seminário de Software Livre"
        if (event.title) {
            title = event.title
        }
        this.add_header(title, role, city, year)
        this.add_certificate_name(data.name)

        this.doc.fontSize(this.TEXT_SIZE)
        print_text(this.doc)

        this.add_verification_code(data, 480, 483)
    }

    add_header(title, role, city, year) {
        this.doc.fontSize(36)
            .font(this.BOLD)
            .lineGap(10)
            .text(`Certificado de ${role}`.toUpperCase(), 50, 140, {align: "left"})
            .font(this.BLACK).fontSize   (36)
            .text(title, 80, 210, {align: 'center'})
            .font(this.REGULAR).fontSize(this.TEXT_SIZE)
            .text("O Grupo de Usuários de Software Livre Tchelinux certifica que", this.LEFT, 280)
    }

    add_certificate_name(name) {
        this.doc.fontSize(28)
            .font(this.BOLD).text(`${name}`, 80, 310, {align: "center"})
            .font(this.REGULAR)
    }

}
