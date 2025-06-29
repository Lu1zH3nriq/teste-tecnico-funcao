
$(document).ready(function () {
    if (obj) {
        $('#formCadastro #Nome').val(obj.Nome);
        $('#formCadastro #CEP').val(obj.CEP);
        $('#formCadastro #CPF').val(obj.CPF);
        $('#formCadastro #Email').val(obj.Email);
        $('#formCadastro #Sobrenome').val(obj.Sobrenome);
        $('#formCadastro #Nacionalidade').val(obj.Nacionalidade);
        $('#formCadastro #Estado').val(obj.Estado);
        $('#formCadastro #Cidade').val(obj.Cidade);
        $('#formCadastro #Logradouro').val(obj.Logradouro);
        $('#formCadastro #Telefone').val(obj.Telefone);
    }

    $('#formCadastro').submit(function (e) {
        e.preventDefault();

        if (window.beneficiarios && window.beneficiarios.length > 0) {
            $("#BeneficiariosJson").val(JSON.stringify(window.beneficiarios));
            
        }

        
        $.ajax({
            url: urlPost,
            method: "POST",
            data: {
                Nome: $(this).find("#Nome").val(),
                Sobrenome: $(this).find("#Sobrenome").val(),
                CPF: $(this).find("#CPF").val(),
                Nacionalidade: $(this).find("#Nacionalidade").val(),
                CEP: $(this).find("#CEP").val(),
                Estado: $(this).find("#Estado").val(),
                Cidade: $(this).find("#Cidade").val(),
                Logradouro: $(this).find("#Logradouro").val(),
                Email: $(this).find("#Email").val(),
                Telefone: $(this).find("#Telefone").val(),
                BeneficiariosJson: $("#BeneficiariosJson").val()
            },
            error:
            function (r) {
                if (r.status == 400)
                    ModalDialog("Ocorreu um erro", r.responseJSON, r.status);
                else if (r.status === 409)
                    ModalDialog("Atenção", r.responseJSON, r.status)
                else if (r.status == 500)
                    ModalDialog("Ocorreu um erro", "Ocorreu um erro interno no servidor.", r.status);

            },
            success:
            function (r) {
                ModalDialog("Sucesso!", r, 200)
                $("#formCadastro")[0].reset();
            }
        });
    })
    
})

function ModalDialog(titulo, texto, status) {
    var random = Math.random().toString().replace('.', '');

    var modalHtml = '<div id="' + random + '" class="modal fade" tabindex="-1" role="dialog">' +
        '  <div class="modal-dialog" role="document">' +
        '    <div class="modal-content">' +
        '      <div class="modal-header">' +
        '        <h4 class="modal-title">' + titulo + '</h4>' +
        '      </div>' +
        '      <div class="modal-body">' +
        '        <p>' + texto + '</p>' +
        '      </div>' +
        '      <div class="modal-footer">' +
        '        <button type="button" class="btn btn-primary" id="btn-fechar-' + random + '">Fechar</button>' +
        '      </div>' +
        '    </div>' +
        '  </div>' +
        '</div>';

    $('body').append(modalHtml);

    var $modal = $('#' + random);
    $modal.modal({
        backdrop: 'static',
        keyboard: false
    }).modal('show');

    
    $('#btn-fechar-' + random).on('click', function () {
        if (status === 409)
            $modal.modal('hide');
        else
            window.location.href = urlRetorno;
    });
}

