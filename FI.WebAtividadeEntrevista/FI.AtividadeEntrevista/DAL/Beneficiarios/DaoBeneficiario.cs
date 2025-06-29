using FI.AtividadeEntrevista.DML;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;

namespace FI.AtividadeEntrevista.DAL.Beneficiarios
{
    internal class DaoBeneficiario : AcessoDados
    {

        internal List<Beneficiario> ListarPorCliente(long idCliente)
        {
            var parametros = new List<SqlParameter>
            {
                new SqlParameter("IDCLIENTE", idCliente)
            };

            DataSet ds = Consultar("FI_SP_ListarBeneficiariosPorCliente", parametros);

            var lista = new List<Beneficiario>();
            if (ds.Tables.Count == 0) return lista;

            foreach (DataRow row in ds.Tables[0].Rows)
            {
                lista.Add(new Beneficiario
                {
                    Id = row.Field<long>("ID"),
                    CPF = row.Field<string>("CPF"),
                    Nome = row.Field<string>("NOME"),
                    IdCliente = row.Field<long>("IDCLIENTE")
                });
            }

            return lista;
        }


        internal long Incluir(Beneficiario beneficiario)
        {
            var parametros = new List<SqlParameter>
            {
                new SqlParameter("CPF", beneficiario.CPF),
                new SqlParameter("NOME", beneficiario.Nome),
                new SqlParameter("IDCLIENTE", beneficiario.IdCliente)
            };

            DataSet ds = Consultar("FI_SP_IncluirBeneficiario", parametros);


            if (ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
            {
                var valor = ds.Tables[0].Rows[0]["ID"];

                if (valor is decimal dec)
                    return Convert.ToInt64(dec);
                if (valor is long lg)
                    return lg;

                if (long.TryParse(valor.ToString(), out var parsed))
                    return parsed;
            }

            return 0;
        }


        internal void Alterar(Beneficiario beneficiario)
        {
            var parametros = new List<SqlParameter>
            {
                new SqlParameter("ID",         beneficiario.Id),
                new SqlParameter("CPF",        beneficiario.CPF),
                new SqlParameter("NOME",       beneficiario.Nome),
                new SqlParameter("IDCLIENTE",  beneficiario.IdCliente)
            };

            // Assumimos que exista a SP FI_SP_AltBeneficiario que faz UPDATE na tabela
            Executar("FI_SP_AltBeneficiario", parametros);
        }

        internal void Excluir(long idBeneficiario)
        {
            var parametros = new List<SqlParameter>
            {
                new SqlParameter("ID", idBeneficiario)
            };

            Executar("FI_SP_DelBeneficiario", parametros);
        }
    }
}
