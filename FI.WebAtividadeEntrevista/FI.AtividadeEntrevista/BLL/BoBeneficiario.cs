using FI.AtividadeEntrevista.DAL.Beneficiarios;
using FI.AtividadeEntrevista.DML;
using System;
using System.Collections.Generic;

namespace FI.AtividadeEntrevista.BLL
{
    public class BoBeneficiario
    {
        private readonly DaoBeneficiario _dao = new DaoBeneficiario();


        public long Incluir(Beneficiario beneficiario)
        {
            if (beneficiario == null)
                throw new ArgumentNullException(nameof(beneficiario));
            if (string.IsNullOrWhiteSpace(beneficiario.CPF))
                throw new ArgumentException("CPF é obrigatório.", nameof(beneficiario.CPF));
            if (string.IsNullOrWhiteSpace(beneficiario.Nome))
                throw new ArgumentException("Nome é obrigatório.", nameof(beneficiario.Nome));
            if (beneficiario.IdCliente <= 0)
                throw new ArgumentException("IdCliente inválido.", nameof(beneficiario.IdCliente));

            return _dao.Incluir(beneficiario);
        }


        public void Incluir(List<Beneficiario> beneficiarios)
        {
            if (beneficiarios == null)
                throw new ArgumentNullException(nameof(beneficiarios));

            foreach (var b in beneficiarios)
                Incluir(b);
        }


        public List<Beneficiario> ListarPorCliente(long idCliente)
        {
            if (idCliente <= 0)
                throw new ArgumentException("IdCliente inválido.", nameof(idCliente));

            return _dao.ListarPorCliente(idCliente);
        }


        public void Alterar(Beneficiario beneficiario)
        {
            if (beneficiario == null)
                throw new ArgumentNullException(nameof(beneficiario));
            if (beneficiario.Id <= 0)
                throw new ArgumentException("Id do beneficiário inválido.", nameof(beneficiario.Id));
            if (string.IsNullOrWhiteSpace(beneficiario.CPF))
                throw new ArgumentException("CPF é obrigatório.", nameof(beneficiario.CPF));
            if (string.IsNullOrWhiteSpace(beneficiario.Nome))
                throw new ArgumentException("Nome é obrigatório.", nameof(beneficiario.Nome));

            _dao.Alterar(beneficiario);
        }

        public void Excluir(long idBeneficiario)
        {
            if (idBeneficiario <= 0)
                throw new ArgumentException("Id do beneficiário inválido.", nameof(idBeneficiario));

            _dao.Excluir(idBeneficiario);
        }
    }
}
