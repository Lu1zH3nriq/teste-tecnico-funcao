document.addEventListener("DOMContentLoaded", function () {
    const cpfInput = document.getElementById("CPF");
    const form = document.getElementById("formCadastro");

    const feedbackInvalido = document.getElementById("cpf-invalido");
    const feedbackIncompleto = document.getElementById("cpf-incompleto");

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

    function ocultarMensagens() {
        feedbackInvalido.style.display = "none";
        feedbackIncompleto.style.display = "none";
    }

    if (typeof obj !== 'undefined' && obj.CPF && cpfInput) {
        cpfInput.value = obj.CPF;
    }

    if (cpfInput) {
        cpfInput.addEventListener("input", function () {
            
            const raw = cpfInput.value.replace(/\D/g, "");
            cpfInput.value = formatarCPF(raw);
            ocultarMensagens();

            if (raw.length > 0 && raw.length < 11) {
                feedbackIncompleto.style.display = "block";
            } else if (raw.length === 11 && !isValidCPF(raw)) {
                feedbackInvalido.style.display = "block";
            }
        });

        if (form) {
            form.addEventListener("submit", function (e) {
                ocultarMensagens();
                const rawCpf = cpfInput.value.replace(/\D/g, "");

                if (rawCpf.length < 11) {
                    feedbackIncompleto.style.display = "block";
                    cpfInput.focus();
                    e.preventDefault();
                } else if (!isValidCPF(rawCpf)) {
                    feedbackInvalido.style.display = "block";
                    cpfInput.focus();
                    e.preventDefault();
                }
            });
        }
    }
});
