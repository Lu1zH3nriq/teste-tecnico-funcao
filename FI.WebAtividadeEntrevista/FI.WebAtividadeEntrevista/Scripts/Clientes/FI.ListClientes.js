
$(document).ready(function () {

    if (document.getElementById("gridClientes"))
        $('#gridClientes').jtable({
            title: 'Clientes',
            paging: true,
            pageSize: 5,
            sorting: true,
            defaultSorting: 'Nome ASC',
            actions: {
                listAction: urlClienteList,
            },
            fields: {
                Nome: {
                    title: 'Nome',
                    width: '50%'
                },
                Email: {
                    title: 'Email',
                    width: '35%'
                },
                Acoes: {
                    title: 'Ações',
                    width: '15%',
                    sorting: false,
                    display: function (data) {
                        return `
                            <button onclick="window.location.href='${urlAlteracao}/${data.record.Id}'" class="btn btn-primary btn-sm">Alterar</button>
                            <button onclick="excluirCliente(${data.record.Id})" class="btn btn-danger btn-sm" style="margin-left: 5px;">Excluir</button>
                        `;
                    }
                }
            }
        });

    if (document.getElementById("gridClientes"))
        $('#gridClientes').jtable('load');
})


function excluirCliente(id) {
    if (confirm("Tem certeza que deseja excluir este cliente?")) {
        $.ajax({
            url: '/Cliente/Excluir/' + id,
            type: 'POST',
            success: function (result) {
                alert("Cliente excluído com sucesso!");
                $('#gridClientes').jtable('load');
            },
            error: function () {
                alert("Erro ao tentar excluir o cliente.");
            }
        });
    }
}