
$(document).ready(function () {
    $('#formCadastro').submit(function (e) {
        e.preventDefault();

        if (window.beneficiarios && window.beneficiarios.length > 0) {
            $("#BeneficiariosJson").val(JSON.stringify(window.beneficiarios));
        }

        $.ajax({
            url: urlPost,
            method: "POST",
            data: {
                Nome: $("#Nome").val(),
                Sobrenome: $("#Sobrenome").val(),
                CPF: $("#CPF").val(),
                Nacionalidade: $("#Nacionalidade").val(),
                CEP: $("#CEP").val(),
                Estado: $("#Estado").val(),
                Cidade: $("#Cidade").val(),
                Logradouro: $("#Logradouro").val(),
                Email: $("#Email").val(),
                Telefone: $("#Telefone").val(),
                BeneficiariosJson: $("#BeneficiariosJson").val()
            },
            error: function (r) {
                if (r.status == 400)
                    ModalDialogConfirm("Ocorreu um erro", r.responseJSON, r.status);
                else if (r.status == 409)
                    ModalDialogConfirm("Atenção", r.responseJSON, r.status);
                else if (r.status == 500)
                    ModalDialogConfirm("Ocorreu um erro", "Ocorreu um erro interno no servidor.", r.status);
            },
            success: function (r) {
                ModalDialogConfirm("Sucesso!", r, 200);
                $("#formCadastro")[0].reset();
            }
        });
    });
});

function ModalDialogConfirm(titulo, texto, status) {
    var random = Math.random().toString().replace('.', '');

    var modalHtml = `
        <div id="${random}" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="modalLabel-${random}" aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h4 class="modal-title" id="modalLabel-${random}">${titulo}</h4>
                    </div>
                    <div class="modal-body">
                        <p>${texto}</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" id="btn-fechar-${random}">Fechar</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    $('#' + random).remove();
    $('body').append(modalHtml);
    var $modal = $('#' + random);
    $modal.modal({
        backdrop: 'static',
        keyboard: false
    }).modal('show');

    $('#btn-fechar-' + random).on('click', function () {
        if (status === 409) {
            $modal.modal('hide');
        } else {
            window.location.href = '/';
        }
    });
}


