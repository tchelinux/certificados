const BOLD = "Helvetica-Bold"
const REGULAR = "Helvetica"
const LEFT = 70

}

function render_certificate(data) {
    console.log(data)
    if (data) {
        date = data.event.date.split("-")
        if (date < "2020")
            render_old_certificate(data)
        else
            render_2020_certificate(data)
    }
}

function render_old_certificate(data) {
    // create a document and pipe to a blob
    var doc = create_pdf()
    var stream = doc.pipe(blobStream());

    if (data.role.organizer)
        add_organizer_certificate(doc, data)
    if (data.role.participant)
        add_participant_certificate(doc, data)

    data.presentations.forEach((presentation) => {
        add_presentation_certificate(doc, data, presentation)
    })

    doc.end();
    stream.on('finish', function() {
        window.open(stream.toBlobURL('application/pdf'),'_blank')
    });
}

function create_pdf() {
    return  new PDFDocument({
        layout: "landscape",
        size: "a4",
        autoFirstPage: false,
        margin: 10
    });
}


function getDateString(date) {
    month = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ]
    dateparts = date.split("-")
    return `${dateparts[2]} de ${month[dateparts[1] - 1]} de ${dateparts[0]}`
}

function add_organizer_certificate(doc, data) {
    var hours = data.role.organizer
    var event = data.event
    text = `colaborou, por ${hours} horas, na organização do evento realizado em ${getDateString(event.date)}, nas dependências da ${event.institution}`

    new_page(doc, data, "Organizador",
             (doc) => { doc.text(text, LEFT, 340, {align: "left"}) })
}

function add_participant_certificate(doc, data) {
    var hours = data.role.participant
    var event = data.event
    text = `participou do evento com ${hours} horas de duração, realizado em ${getDateString(event.date)}, nas dependências da ${event.institution}.`

    new_page(doc, data, "Participante",
        (doc) => { doc.text(text, LEFT, 340, {align: "left"}) })

}

function add_presentation_certificate(doc, data, presentation) {
    var hours = data.role.participant
    var event = data.event
    text = `apresentou a palestra ${presentation.title}, no evento realizado em ${getDateString(event.date)}, nas dependências da ${event.institution}.`

    new_page(doc, data, "Palestrante",
        (doc) => {
            doc.text("apresentou a palestra ", LEFT, 340, {align: "left", continued: true})
               .font(BOLD)
               .text(`${presentation.title}`, {continued: true,})
               .font(REGULAR)
               .text(` no evento realizado em ${getDateString(event.date)}, nas dependências da ${event.institution}.`)
           }
    )
}

function new_page(doc, data, title, print_text) {
    // draw some text
    const url = "https://certificados.tchelinux.org"
    //const url = "http://localhost:4000/" // use it for debug.
    year = data.event.date.split("-")[0]
    doc.addPage()
        .font(REGULAR)
        .image(getBase64Image('tux'), 250, -30, {fit: [790, 790], opacity: 0.3})

    add_header(doc, title, data.event.city, year)
    add_certificate_name(doc, data.name)

    doc.fontSize(16)
    print_text(doc)

    doc.fontSize(12).lineGap(2)
       .text("Código de Verificação:", 510, 510, {width: 220, align: "center"})
       .font(BOLD)
       .text(data.validation_code, {
           width: 220,
           align: "center",
           link: `${url}/?verify=${data.validation_code}`,
           underline: false})
       .font(REGULAR)
       .text(`${url}`, {
           width: 220,
           align: "center",
           link: `${url}`,
           underline: false
       })
}

function add_header(doc, title, city, year) {
    doc.fontSize(36).font(BOLD).lineGap(10)
        .text(`Certificado de ${title}`.toUpperCase(), 0, 15, {align: "center"})
        .fontSize(24).text("Seminário de Software Livre", 0, 105, {align: "center"})
        .fontSize(32).text(`Tchelinux ${city} ${year}`, 0, 150, {align: "center"})
        .font(REGULAR).fontSize(16)
        .text("O Grupo de Usuários de Software Livre Tchelinux certifica que", LEFT, 250)
}

function add_certificate_name(doc, name) {
    doc.fontSize(28)
        .font(BOLD).text(`${name}`, 0, 290, {align: "center"})
        .font(REGULAR)
}
