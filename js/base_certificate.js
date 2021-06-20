class BaseCertificate {

    constructor() {
        this.SANS_BOLD = "Helvetica-Bold"
        this.SANS_REGULAR = "Helvetica"
        this.SERIF_BOLD = "Times-Roman-Bold"
        this.SERIF_REGULAR = "Times-Roman"
        this.doc = null
        this.fonts = {}
    }

    create_pdf() {
        return  new PDFDocument({
            layout: "landscape",
            size: "a4",
            autoFirstPage: false,
            margin: 10
        });
    }

    prepare() {
        console.log("WARNING: prepare() sould be overwritten.")
    }

    async load_font(font, font_desc) {
        const _font = await fetch(font_desc.url)
        const arrayBuffer = await _font.arrayBuffer()
        this[font] = font_desc.name
        this.doc.registerFont(font_desc.name, arrayBuffer)
     }

    async render(data) {
        this.doc = this.create_pdf()

        for (let font in this.fonts) {
            await this.load_font(font, this.fonts[font])
        }

        this.prepare()

        let stream = this.doc.pipe(blobStream());

        if (data.role.organization || data.role.organizer) {
            console.log("Addinng organizer certificate.")
            this.add_organizer_certificate(data)
        }
        if (data.role.participation || data.role.participant) {
            console.log("Addinng partacipant certificate.")
            this.add_participant_certificate(data)
        }
        data.presentations.forEach((presentation) => {
            console.log("Addinng presentation certificate.")
            this.add_presentation_certificate(data, presentation)
        })

        this.doc.end();
        stream.on('finish',
            function() {
                window.open(stream.toBlobURL('application/pdf'),'_blank')
            }
        );
    }

    add_organizer_certificate(data) {
        throw new Error(
            'Certificate add_organizer_certificate() not implemented.'
        )
    }
    add_participant_certificate(data) {
        throw new Error(
            'Certificate add_participant_certificate() not implemented.'
        )
    }
    add_presentation_certificate(data, presentation) {
        throw new Error(
            'Certificate add_presentation_certificate() not implemented.'
        )
    }

    add_verification_code(data, left, top) {
        const url = "https://certificados.tchelinux.org"
        const width = 192
        this.doc.fontSize(10).lineGap(2)
           .text("Código de Verificação:", left, top,
                 {width: width, align: "center"})
           .font("Courier-Bold").fontSize(10)
           .text(data.validation_code, left, top + 17, {
               width: width,
               align: "center",
               link: `${url}/?verify=${data.validation_code}`,
               underline: false})
           .lineGap(2).font(this.REGULAR).fontSize(10)
           .text(`${url}`, {
               width: width,
               align: "center",
               link: `${url}`,
               underline: false
           })
    }

}
