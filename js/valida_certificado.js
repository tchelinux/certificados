function display_validation_success(obj) {
    $('#certificate_list').css('display','none')
    $('#resultado').css('display','block');
    $('#result-data').css('display','block');
    $('#result-error').css('display','none');
    $('#resultado #participante').text(obj.name)
    $('#resultado #data').text(obj.date)
    if (obj.city) {
        $('#resultado #cidade').text(obj.city)
    } else {
        $('#resultado #cidade').text("Evento Remoto")
    }
    if (obj.institution) {
        $('#resultado #institution').css('display', 'block')
        $('#resultado #instituicaon').css('display', 'block')
        $('#resultado #instituicao').text(obj.institution)
    } else {
        $('#resultado #institution').css('display', 'none')
        $('#resultado #instituicao').css('display','none');
    }
    if (obj.validation_code) {
        $('#resultado #fingerprint').text(obj.validation_code)
    }
    if (obj.organization && obj.organization > 0) {
        $('#resultado #organizacao').css('display', 'block')
        $('#resultado #horas_organizacao').text(obj.organization)
    } else {
        $('#resultado #organizacao').css('display', 'none')
    }
    if (obj.hours && obj.hours > 0) {
        $('#resultado #participacao').css('display', 'block')
        $('#resultado #horas').text(obj.hours)
    } else {
        $('#resultado #participacao').css('display', 'none')
    }
    if (obj.presentations.length > 0) {
        $('#resultado #palestras').css('display', 'block')
        $('#list_palestras').empty()
        for (p in obj.presentations) {
            titulo = obj.presentations[p]
            if (titulo.title) {
                $('#list_palestras').append($('<li></li>').append($('<a></a>', {href: titulo.url}).text(titulo.title)))
            } else {
                $('#list_palestras').append($('<li></li>').text(titulo))
            }
        }
    } else {
        $('#resultado #palestras').css('display', 'none')
    }

    $('#validate_label').removeClass("label-danger")
    $('#validate_label').addClass("label-success")
    $('#validate_label').css('display','inline-block')
    $('#validate_label').css('font-size','14px')
    $('#validate_label').text("VÁLIDO")
}

function display_validation_error(code) {
    $('#certificate_list').css('display','none')
    $('#resultado').css('display','block')
    $('#result-data').css('display','none')
    $('#result-error').css('display','block')
    $('#result-error #fingerprint').text(code)
    $('#validate_label').removeClass("label-success")
    $('#validate_label').addClass("label-danger")
    $('#validate_label').css('display','inline-block')
    $('#validate_label').text("INVÁLIDO")
}

function validate_certificate(code) {
    let url = `certificates/${code.substr(0, 2)}/${code}`
    $.get(url)
        .done(function(data, textStatus, response) {
           if (response.status == 200) {
               display_validation_success(jQuery.parseJSON(data))
               document.location = "#resultado"
           } else {
               display_validation_error(code, textStatus)
           }
        })
        .fail(function(data, textStatus, response) {
            display_validation_error(code, textStatus)
        }
    )
}

/// -- retrieve certificates
function retrieve_certificates(email) {
    digest("SHA-512", email).then((hash) => {
        let url = `certificates/${hash.substr(0, 2)}/${hash}`
        $.get(url)
        .done(function(data, textStatus, response) {
           if (response.status == 200) {
               display_certificate_list(jQuery.parseJSON(data))
               document.location = "#certificate_list"
           } else {
               display_retrieve_error(email, response)
           }
        })
        .fail(function(data, textStatus, response) {
            display_retrieve_error(email)
        })
    })
}

function display_retrieve_error(email, resp) {
    $('#certificate-error #error-email').text(email)
    if (resp) {
        $('#certificate-error #error-msg').text(resp)
        $('#certificate-error #error-msg').css('display','block')
    } else {
        $('#certificate-error #error-msg').css('display','none')
    }
    $('#resultado').css('display','none')
    $('#certificate_list').css('display','block')
    $('#certificate_data').css('display','none')
    $('#certificate-error').css('display','block')
}

function display_certificate_list(data) {
    // user_certificates must be a global variable
    user_certificates = {}
    $('#certificate_data #name').text(data.name)

    if (data.certificates) {
         $('#certificate_data #events').css('display', 'block')
         $('#list_events').empty()
         for (c in data.certificates) {
             let cert = data.certificates[c]
             cert.name = data.name
             user_certificates[c] = cert
             let date = getDateString(cert.event.date)
             let location = `Tchelinux Live ${cert.event.date.split('-')[0]}`
             if (cert.event.city) {
                 location = cert.event.city
             }
             $('#list_events').append(
                $('<li></li>').append($("<a></a>", {href: `javascript: render_certificate(user_certificates["${cert.validation_code}"])`}).text(`${location}, ${date}`))
            )
         }
         $('#list_events').append(
            $('<li></li>').append($("<a></a>", {href: `javascript: render_certificate(user_certificates)`}).text("Todos Certificados"))
        )
    } else {
         $('#resultado #palestras').css('display', 'none')
    }

    $('#resultado').css('display','none')
    $('#certificate_list').css('display','block')
    $('#certificate_data').css('display','block')
    $('#certificate-error').css('display','none')
}
