/**
 * Given a date in the format YYYY-MM-DD returns the date in the
 * format "DD de Month de YYYY".
 */
function getDateString(date) {
    month = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ]
    dateparts = date.split("-")
    return `${dateparts[2]} de ${month[dateparts[1] - 1]} de ${dateparts[0]}`
}

/**
 * Compute the digest for a given data, using a selected algorithm, and
 * return a Promise containing the hexstring of the digest.
 */
async function digest(algo, str) {
    const buf = await crypto.subtle.digest(
        algo, new TextEncoder("utf-8").encode(str)
    )
    return Array.prototype.map.call(
        new Uint8Array(buf), x=>(('00'+x.toString(16)).slice(-2))
    ).join('')
}

/**
 * Retrieve a list of parameters passed in the URL, similar to a CGI script.
 */
function getUrlVars() {
    var vars = {};
    var remove_hash = window.location.href.replace(/#.*/gi, "")
    var parts = remove_hash.replace(/[?&]+([^=&]+)=([^&]*)/gi,
        function(m,key,value) {
            vars[key] = value;
        }
    );
    return vars;
}

/**
 * Convert image data from an IMG element to Base64 using Canvas.
 */
 function getBase64Image(img_id, opacity) {
     // Create an empty canvas element
     img = document.getElementById(img_id)
     var canvas = document.createElement("canvas")
     canvas.width = img.width
     canvas.height = img.height
     // Copy the image contents to the canvas
     var ctx = canvas.getContext("2d")
     ctx.globalAlpha = opacity
     ctx.drawImage(img, 0, 0)
     // Get the data-URL formatted image
     var dataURL = canvas.toDataURL("image/png")
     return dataURL
 }
