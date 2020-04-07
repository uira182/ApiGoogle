function Upload() {
    var fileUpload = document.getElementById("file_upload");
    var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.csv|.txt)$/;
    if (regex.test(fileUpload.value.toLowerCase())) {
        if (typeof (FileReader) != "undefined") {
            var reader = new FileReader();
            reader.onload = function (e) {
                var rows = e.target.result.split("\n");
                for (var i = 1; i < 10; i++) {
                    if (rows[i].split(",").length > 1) {
                        var cells = rows[i].split(",");
                        console.log(rows[i].split(",").length);
                    }
                    if (rows[i].split(";").length > 1) {
                        cells = rows[i].split(";");
                        console.log(rows[i].split(";").length);
                    }
                    if (cells.length > 1) {
                        //console.log(cells[3] + " " + cells[4] + " " + cells[5]);
                        searchCsv(cells[0], cells[1] + "-" + cells[2] + "-" + cells[3]);
                    }
                }
            }
            reader.readAsText(fileUpload.files[0]);
        } else {
            alert("This browser does not support HTML5.");
        }
    } else {
        alert("Please upload a valid CSV file.");
    }
}

function searchCsv(id, csv) { // Formata os primeiros dados para realizar a pesquisa.
    if (!csv || csv === '') {
        alert("Insira algum dado para ser buscado");
    } else {
        let key = 'AIzaSyCpMbb74LSDVZ9JXSLqikQlI1H8vmZJ0QU'; // CHAVE GOOGLE API
        let value = csv; // DADOS DO FORMULARIO PARA REALIZAR PESQUISA SEM FORMATAR
        let search = ''; // INICIA A VARIAVEL QUE RECEBERA AS INFORMAÇÕES PARA PESQUISA FORMATADAS

        // ESTE LOOP VAI LER TODOS OS DADOS QUE SERÃO PESQUISADOS E VAI REMOVER OS ESPAÇOS PARA COLOCAR -
        // A API DO GOOGLE NÃO RECONHECE ESTAÇO ENTRE AS PALAVRAS POIS ESTA MESMA IRA NA URL DE PESQUISA
        // UTILIZANDO UMA REQUISIÇÃO DO TIPO GET E POR ESTE MOTIVO A IMPORTANCIA DE TROCAR TODOS OS ESPAÇOS
        // POR TRAÇOS: https://maps.googleapis.com/maps/api/geocode/json?address=exemplo-de-pesquisa-sem-espaço

        for (let i = 0; i < value.length; i++) {
            if (i == 0) {
                let r = i;
                let ru = 0;
                let ua = 0;
                if (value.charAt(r) == "R" || value.charAt(r) == "r") {
                    u = i + 1;
                    if (value.charAt(ru) == "U" || value.charAt(ru) == "u") {
                        a = u + 1;
                        if (value.charAt(ua) == "A" || value.charAt(ua) == "a") {
                            i++;
                        }
                        i++;
                    }
                    search += "Rua:";
                    i++;
                }
            }
            if (value.charAt(i) != " ") { // SE NÃO ESTIVER VASIO O PONTO DE VERIFICAÇÃO

                search += value.charAt(i); // ENVIA A LETRA PARA A VARIAVEL DE PESQUISA

            } else { // SE TIVER ESPAÇO O PONTO DE VERIFICAÇÃO
                search += '-'; // ENVIA O TRAÇO PARA A VARIAVEL DE PESQUISA
            }
        }

        // FORMATAÇÃO DA URL QUE VAI PARA A REQUISIÇÃO DE PESQUISA
        console.log(search);
        let url = new URL('https://maps.googleapis.com/maps/api/geocode/json?address=' + search + '&key=' + key);

        apiCsv(id, url); // ENVIA OS DADOS FORMATADOS E PRONTOS PARA A FUNÇÃO API
    }

}
/* ******************************** REALIZAÇÃO DA PESQUISA ******************************* */

function apiCsv(id, url) { // RECEBE OS DADOS FORMATADOS E IRA BUSCAR OS DADOS DA API

    var xhr = new XMLHttpRequest(); // CRIA O OBJETO QUE REALIZARA A CONEXAO COM A API
    xhr.open("GET", url, true); // CONFIGURA A FORMA DE COMUNICAÇÃO GET E A URL E FORMA DE RETORNO DOS DADOS
    xhr.setRequestHeader("Accept", "application/json"); // FORMA DE RETORNO DE DADOS JSON

    xhr.onreadystatechange = function () { // REALIZA A COMUNICAÇÃO
        // SE O RETORNO FOR CORRETO COM RESULTADO 200
        if ((xhr.readyState == 0 || xhr.readyState == 4)) {
            switch (xhr.status) {
                case 200:

                    // EXECUTA A FUNÇÃO PREENCHE GOOGLE PARA PODER FORMATAR OS DADOS A SEREM EXIBIDOS
                    preencheGoogleCsv(id, xhr.responseText);
                    break;
                case 400:
                    alert('ERRO:400 - Informações incorretas');
                    break;
                default:
                    alert('Erro - Inesperado');
                    console.log(xhr.status);
                    break;
            }
        }
    };
    xhr.send();
}

/* *************************************************************************************** */

/* **************************** FORMATA OS DADOS PARA EXIBIR ***************************** */

function preencheGoogleCsv(id, dados) { // RECEBE OS DADOS DA COMUNICAÇÃO PARA FORMATAR CORRETAMENTE

    let search = JSON.parse(dados); // CONVERTE OS DADOS EM TEXTO JSON PARA OBJETO JSON

    //console.log(search);
    // RECEBE A QUANTIDADE DE COMPONENTES RESULTANTES DA PESQUISA
    let qd = search.results[0].address_components.length;

    if (qd > 4) { // SE O A QUANTIDADE DE DADOS DOR FOR MAIOR QUE 4 

        qd--; // DECREMENTA 1 PARA PODER ENCONTRAR A OPOSIÇÃO DO CEP

        // ENVIA OS DADOS DO CEP PARA A VARIAVEL CEP
        var cep = search.results[0].address_components[qd].short_name;

    } else { // SE A QUANTIDADE FOR MENOR QUE 4

        // ENVIA OS DADOS DA POSIÇÃO ZERO PARA A VARIAVEL CEP
        var cep = search.results[0].address_components[0].short_name;

    }

    var endereco = search.results[0].formatted_address; // CAPTURA OS DADOS DO ENDEREÇO
    var lat = search.results[0].geometry.location.lat; // CAPTURA OS DADOS DE LATITUDE
    var lng = search.results[0].geometry.location.lng; // CAPTURA OS DADOS DE LONGITUDE

    // EXECUTA A FUNÇÃO PARA EXIBIR OS DADOS NA TELA
    printListCsv(id, endereco, cep, lat, lng);

}

/* *************************************************************************************** */

/* ******************************* EXIBE OS DADOS NA TELA ******************************** */

function printListCsv(id, endereco, cep, lat, lng) { // EXIBE OS DADOS FORMATADOS NA TABELA

    tableSearch = document.querySelector("#dataSearch"); // BUSCA A POSIÇÃO ONDE SERA INSERIDO OS DADOS

    var htmlTable = ''; // CRIA A VARIAVEL QUE RECEBERA O CODIGO HTML PARA EXIBIR NA TABELA

    htmlTable = "<tr class='lineTable'>";
    htmlTable += "<td class='text-left'>" + id + "</td>";
    htmlTable += "<td class='text-left'>" + endereco + "</td>";
    htmlTable += "<td class='text-left'>" + cep + "</td>";
    htmlTable += "<td class='text-left'>" + lat + "</td>";
    htmlTable += "<td class='text-left'>" + lng + "</td>";
    htmlTable += "<th class='text-center'>";
    htmlTable += "<a href='#' id='delLine' onclick='delRow(this.parentNode.parentNode.rowIndex)'>";
    htmlTable += "<i class='fa fa-times-circle text-danger'>";
    htmlTable += "</i>";
    htmlTable += "</a>";
    htmlTable += "</th>";
    htmlTable += "</tr>";

    tableSearch.innerHTML += htmlTable; // INSERE OS DADOS NA TABELA

    clearInputCsv(); // EXECUTA A FUNÇÃO QUE LIMPARA OS DADOS DA PESQUISA PÓS EXIBIR
}

/* *************************************************************************************** */

/* ***************************** LIMPA OS DADOS DE PESQUISA ****************************** */

function clearInputCsv() { // FUNÇÃO PARA LIMPARA OS DADOS DE PESQUISA
    document.getElementById("srcInp").value = ''; // LIMPA OS DADOS DO IMPUT
}

/* *************************************************************************************** */


$(document).ready(function () {
    $("#myBtn").click(function () {
        $("#myModal").modal();
        $("#add_csv").click(function () {
            Upload();
        });
    });
});