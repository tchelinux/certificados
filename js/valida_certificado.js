function display_validation_success(obj) {
    $('#certificate_list').css('display','none')
    $('#resultado').css('display','block');
    $('#result-data').css('display','block');
    $('#result-error').css('display','none');
    $('#resultado #participante').text(obj.nome)
    $('#resultado #data').text(obj.data)
    $('#resultado #cidade').text(obj.cidade)
    $('#resultado #instituicao').text(obj.instituicao)
    $('#resultado #horas').text(obj.horas)
    $('#resultado #fingerprint').text(obj.fingerprint)
    $('#resultado #horas_organizacao').text(obj.organizacao)
    if (obj.horas > 0) {
        $('#resultado #participacao').css('display', 'block')
    } else {
        $('#resultado #participacao').css('display', 'none')
    }
    if (obj.organizacao > 0) {
        $('#resultado #organizacao').css('display', 'block')
    } else {
        $('#resultado #organizacao').css('display', 'none')
    }
    if (obj.palestras.length > 0) {
        $('#resultado #palestras').css('display', 'block')
        $('#list_palestras').empty()
        for (p in obj.palestras) {
            titulo = obj.palestras[p]
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

function display_validation_error() {
    $('#certificate_list').css('display','none')
    $('#resultado').css('display','block')
    $('#result-data').css('display','none')
    $('#result-error').css('display','block')
    var msg = $('#validateform #event_info :selected').text()
    $('#result-error #msg').text(msg);
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
               display_validation_error()
           }
        })
        .fail(function(data, textStatus, response) {
            display_validation_error()
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
    user_certificates = {}
    $('#certificate_data #name').text(data.name)

    if (data.certificates) {
         $('#certificate_data #events').css('display', 'block')
         $('#list_events').empty()
         for (c in data.certificates) {
             var cert = data.certificates[c]
             cert.name = data.name
             user_certificates[c] = cert
             var date = getDateString(cert.event.date)
             $('#list_events').append(
                $('<li></li>').append($("<a></a>", {href: `javascript: render_certificate(user_certificates["${cert.validation_code}"])`}).text(`${cert.event.city}, ${date}`))
            )
         }
    } else {
         $('#resultado #palestras').css('display', 'none')
    }

    $('#resultado').css('display','none')
    $('#certificate_list').css('display','block')
    $('#certificate_data').css('display','block')
    $('#certificate-error').css('display','none')
}
