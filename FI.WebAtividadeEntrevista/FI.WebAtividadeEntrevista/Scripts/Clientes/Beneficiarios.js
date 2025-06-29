$(document).ready(function () {
    window.beneficiarios = [];
    let beneficiarioEditandoIndex = null;
    let _clienteBeneficiariosCarregados = null;

    function formatarCPF(valor) {
        const num = valor.replace(/\D/g, "").slice(0, 11);
        if (num.length > 9)
            return num.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, "$1.$2.$3-$4");
        if (num.length > 6)
            return num.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3");
        if (num.length > 3)
            return num.replace(/(\d{3})(\d{1,3})/, "$1.$2");
        return num;
    }

    function isValidCPF(cpf) {
        cpf = cpf.replace(/\D/g, '');
        if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

        let soma = 0, resto;
        for (let i = 1; i <= 9; i++)
            soma += parseInt(cpf.charAt(i - 1)) * (11 - i);
        resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;
        if (resto !== parseInt(cpf.charAt(9))) return false;

        soma = 0;
        for (let i = 1; i <= 10; i++)
            soma += parseInt(cpf.charAt(i - 1)) * (12 - i);
        resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;

        return resto === parseInt(cpf.charAt(10));
    }

    function ocultarMensagensBeneficiario() {
        $("#cpf-benef-incompleto").hide();
        $("#cpf-benef-invalido").hide();
    }

    function initGridLocal() {
        const $g = $("#gridBeneficiarios");
        if ($g.data("jtable")) $g.jtable("destroy");

        $g.jtable({
            title: '',
            paging: false,
            sorting: false,
            messages: { noDataAvailable: 'Nenhum beneficiário adicionado.' },
            actions: {
                listAction: () => ({ Result: "OK", Records: window.beneficiarios })
            },
            fields: {
                CPF: { title: 'CPF', width: '30%', display: d => formatarCPF(d.record.CPF) },
                Nome: { title: 'Nome', width: '40%' },
                Acoes: {
                    title: 'Ações', width: '30%', sorting: false,
                    display: function (d) {
                        const cpf = d.record.CPF.replace(/\D/g, "");
                        const i = window.beneficiarios.findIndex(b => b.CPF === cpf);
                        if (i < 0) return '<span class="text-danger">Erro</span>';
                        return `
                            <button class="btn btn-primary btn-sm" onclick="editarBeneficiario(${i})">Alterar</button>
                            <button class="btn btn-danger btn-sm" onclick="removerBeneficiario(${i})">Remover</button>
                          `;
                    }
                }
            }
        }).jtable('load');
    }

    function carregarGridBeneficiarios(url) {
        $.getJSON(url)
            .done(function (resp) {
                window.beneficiarios = resp.Records.map(r => ({
                    CPF: r.CPF.replace(/\D/g, ''),
                    Nome: r.Nome,
                    Id: r.Id
                }));
                initGridLocal();
            })
            .fail(function () {
                ModalDialogBeneficiarios("Erro", "Não foi possível carregar beneficiários.");
            });
    }

    window.removerBeneficiario = function (index) {

        if (index >= 0 && index < window.beneficiarios.length) {

            window.beneficiarios.splice(index, 1);
            $('#gridBeneficiarios').jtable('load');
        }
    };


    window.editarBeneficiario = function (index) {
        if (index < 0 || index >= window.beneficiarios.length) {
            ModalDialogBeneficiarios("Erro", "Não foi possível localizar o beneficiário para edição.");
            return;
        }

        const beneficiario = window.beneficiarios[index];
        $("#cpfBeneficiario").val(formatarCPF(beneficiario.CPF));
        $("#nomeBeneficiario").val(beneficiario.Nome);
        $("#btnAddBeneficiario").text("Salvar");
        beneficiarioEditandoIndex = index;
    };

    function limparFormularioBeneficiario() {
        $("#cpfBeneficiario").val('');
        $("#nomeBeneficiario").val('');
        $("#btnAddBeneficiario").text("Adicionar");
        beneficiarioEditandoIndex = null;
    }

    $("#btnBeneficiarios").on("click", function () {
        const urlBase = $(this).data("url-beneficiarios");
        limparFormularioBeneficiario();

        if (typeof obj !== "undefined" && obj.Id && obj.Id > 0) {
            const idCliente = obj.Id;
            const urlFinal = `${urlBase}?idCliente=${idCliente}`;

            if (_clienteBeneficiariosCarregados !== idCliente) {
                _clienteBeneficiariosCarregados = idCliente;
                carregarGridBeneficiarios(urlFinal);
            }
            else {

                initGridLocal();
            }
        }
        else {

            initGridLocal();
        }

        $("#modalBeneficiarios").modal("show");
    });


    $("#cpfBeneficiario").on("input", function () {
        const raw = $(this).val().replace(/\D/g, "");
        const formatado = formatarCPF(raw);
        $(this).val(formatado);
        ocultarMensagensBeneficiario();

        if (raw.length > 0 && raw.length < 11) {
            $("#cpf-benef-incompleto").show();
        } else if (raw.length === 11 && !isValidCPF(raw)) {
            $("#cpf-benef-invalido").show();
        }
    });

    $("#formBeneficiario").on("submit", function (e) {
        e.preventDefault();
        ocultarMensagensBeneficiario();

        const rawCpf = $("#cpfBeneficiario").val().replace(/\D/g, "");
        const nome = $("#nomeBeneficiario").val().trim();

        if (rawCpf.length < 11) {
            $("#cpf-benef-incompleto").show();
            return;
        }
        if (!isValidCPF(rawCpf)) {
            $("#cpf-benef-invalido").show();
            return;
        }
        if (!nome) {
            ModalDialogBeneficiarios("Atenção", "O nome do beneficiário é obrigatório.");
            return;
        }

        if (beneficiarioEditandoIndex === null) {
            if (window.beneficiarios.some(b => b.CPF === rawCpf)) {
                ModalDialogBeneficiarios("Atenção", "Este CPF já foi adicionado como beneficiário.");
                return;
            }
        } else {
            if (window.beneficiarios.some((b, i) => i !== beneficiarioEditandoIndex && b.CPF === rawCpf)) {
                ModalDialogBeneficiarios("Atenção", "Este CPF já foi adicionado como beneficiário.");
                return;
            }
        }

        let idDoBeneficiario = null;
        if (beneficiarioEditandoIndex !== null) {
            idDoBeneficiario = window.beneficiarios[beneficiarioEditandoIndex].Id || null;
        }

        const registro = {
            Id: idDoBeneficiario,  
            CPF: rawCpf,
            Nome: nome
        };

        if (beneficiarioEditandoIndex !== null) {
            window.beneficiarios[beneficiarioEditandoIndex] = registro;
        } else {
            window.beneficiarios.push(registro);
        }

        limparFormularioBeneficiario();
        $("#gridBeneficiarios").jtable("load");
    });

    window.editarBeneficiario = function (index) {
        if (index < 0 || index >= window.beneficiarios.length) {
            ModalDialogBeneficiarios("Erro", "Beneficiário não encontrado.");
            return;
        }
        const b = window.beneficiarios[index];
        $("#cpfBeneficiario").val(formatarCPF(b.CPF));
        $("#nomeBeneficiario").val(b.Nome);
        $("#btnAddBeneficiario").text("Salvar");
        beneficiarioEditandoIndex = index;
    };

});

function ModalDialogBeneficiarios(titulo, texto) {
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
                        <button type="button" class="btn btn-primay" id="btn-fechar-${random}modal">Fechar</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    $('body').append(modalHtml);
    var $modal = $('#' + random);
    $modal.modal({
        backdrop: 'static',
        keyboard: false
    }).modal('show');

    $('#btn-fechar-' + random + 'modal').on('click', function () {
        $modal.modal('hide');
    });
}


window.editarBeneficiario = function (index) {
    if (index < 0 || index >= window.beneficiarios.length) {
        ModalDialogBeneficiarios("Erro", "Não foi possível localizar o beneficiário para edição.");
        return;
    }

    const beneficiario = window.beneficiarios[index];
    $("#cpfBeneficiario").val(formatarCPF(beneficiario.CPF));
    $("#nomeBeneficiario").val(beneficiario.Nome);
    $("#btnAddBeneficiario").text("Salvar");
    beneficiarioEditandoIndex = index;
};


function limparFormularioBeneficiario() {
    $("#cpfBeneficiario").val('');
    $("#nomeBeneficiario").val('');
    $("#btnAddBeneficiario").text("Adicionar");
    beneficiarioEditandoIndex = null;
}
