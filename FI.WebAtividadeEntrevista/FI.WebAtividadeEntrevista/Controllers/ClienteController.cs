using FI.AtividadeEntrevista.BLL;
using FI.AtividadeEntrevista.DML;
using FI.WebAtividadeEntrevista.Models;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using WebAtividadeEntrevista.Models;

namespace WebAtividadeEntrevista.Controllers
{
    public class ClienteController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }


        public ActionResult Incluir()
        {
            return View();
        }

        [HttpPost]
        public JsonResult Incluir(ClienteModel model, string BeneficiariosJson)
        {
            if (!ModelState.IsValid)
            {
                Response.StatusCode = 400;
                var erros = ModelState.Values
                              .SelectMany(v => v.Errors)
                              .Select(e => e.ErrorMessage);
                return Json(string.Join("<br/>", erros));
            }

            try
            {

                model.Id = new BoCliente().Incluir(new Cliente()
                {
                    CEP = model.CEP,
                    Cidade = model.Cidade,
                    Email = model.Email,
                    Estado = model.Estado,
                    Logradouro = model.Logradouro,
                    Nacionalidade = model.Nacionalidade,
                    Nome = model.Nome,
                    Sobrenome = model.Sobrenome,
                    CPF = model.CPF,
                    Telefone = model.Telefone
                });


                if (!string.IsNullOrEmpty(BeneficiariosJson))
                {
                    var listModel = JsonConvert
                        .DeserializeObject<List<BeneficiarioModel>>(BeneficiariosJson);

                    var listDml = listModel.Select(b => new Beneficiario
                    {
                        CPF = b.CPF,
                        Nome = b.Nome,
                        IdCliente = model.Id
                    }).ToList();

                    new BoBeneficiario().Incluir(listDml);
                }

                return Json("Cadastro efetuado com sucesso");
            }
            catch (ArgumentException ex)
            {
                Response.StatusCode = 409;
                return Json(ex.Message);
            }
            catch (Exception ex)
            {
                Response.StatusCode = 500;
                return Json(ex.ToString());
            }
        }


        [HttpPost]
        public JsonResult Alterar(ClienteModel model, string BeneficiariosJson)
        {
            var boCliente = new BoCliente();
            var boBenef = new BoBeneficiario();

            
            if (!ModelState.IsValid)
            {
                Response.StatusCode = 400;
                var erros = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage);
                return Json(string.Join("<br/>", erros));
            }

            try
            {
                
                boCliente.Alterar(new Cliente
                {
                    Id = model.Id,
                    Nome = model.Nome,
                    Sobrenome = model.Sobrenome,
                    CPF = model.CPF,
                    Nacionalidade = model.Nacionalidade,
                    CEP = model.CEP,
                    Estado = model.Estado,
                    Cidade = model.Cidade,
                    Logradouro = model.Logradouro,
                    Email = model.Email,
                    Telefone = model.Telefone
                });

                
                var listaNovos = string.IsNullOrEmpty(BeneficiariosJson)
                    ? new List<BeneficiarioModel>()
                    : JsonConvert.DeserializeObject<List<BeneficiarioModel>>(BeneficiariosJson);

                
                var listaAntiga = boBenef
                    .ListarPorCliente(model.Id)
                    .Select(b => new
                    {
                        b.Id,
                        CPF = b.CPF.Replace(".", "").Replace("-", ""),
                        Nome = b.Nome
                    })
                    .ToList();

                
                var listaEnviada = listaNovos
                    .Select(m => new
                    {
                        Id = m.Id ?? 0L,   
                        CPF = m.CPF.Replace(".", "").Replace("-", ""),
                        Nome = m.Nome
                    })
                    .ToList();

                var alteracoes = listaEnviada
                    .Where(e => e.Id > 0)
                    .Join(listaAntiga,
                          e => e.Id,
                          a => a.Id,
                          (e, a) => new { e.Id, e.CPF, e.Nome, Orig = a })
                    .Where(x => x.CPF != x.Orig.CPF || x.Nome != x.Orig.Nome)
                    .Select(x => new Beneficiario
                    {
                        Id = x.Id,
                        CPF = x.CPF,
                        Nome = x.Nome,
                        IdCliente = model.Id
                    })
                    .ToList();
                alteracoes.ForEach(b => boBenef.Alterar(b));


                var removidos = listaAntiga
                    .Where(a => !listaEnviada.Any(e => e.CPF == a.CPF))
                    .Select(a => a.Id)
                    .ToList();
                removidos.ForEach(idRem => boBenef.Excluir(idRem));

                
                var insercoes = listaEnviada
                    .Where(e => e.Id == 0)
                    .Select(e => new Beneficiario
                    {
                        CPF = e.CPF,
                        Nome = e.Nome,
                        IdCliente = model.Id
                    })
                    .ToList();
                insercoes.ForEach(b => boBenef.Incluir(b));

                
                

                
                return Json("Cadastro alterado com sucesso");
            }
            catch (ArgumentException ex)
            {
                Response.StatusCode = 409;
                return Json(ex.Message);
            }
            catch (Exception ex)
            {
                Response.StatusCode = 500;
                return Json("Erro interno ao tentar alterar o cliente.");
            }
        }

        [HttpGet]
        public ActionResult Alterar(long id)
        {
            BoCliente bo = new BoCliente();
            Cliente cliente = bo.Consultar(id);
            Models.ClienteModel model = null;

            if (cliente != null)
            {
                model = new ClienteModel()
                {
                    Id = cliente.Id,
                    CEP = cliente.CEP,
                    Cidade = cliente.Cidade,
                    Email = cliente.Email,
                    Estado = cliente.Estado,
                    Logradouro = cliente.Logradouro,
                    Nacionalidade = cliente.Nacionalidade,
                    Nome = cliente.Nome,
                    Sobrenome = cliente.Sobrenome,
                    Telefone = cliente.Telefone,
                    CPF = cliente.CPF
                };

            
            }

            return View(model);
        }

        [HttpPost]
        public JsonResult ClienteList(int jtStartIndex = 0, int jtPageSize = 0, string jtSorting = null)
        {
            try
            {
                int qtd = 0;
                string campo = string.Empty;
                string crescente = string.Empty;
                string[] array = jtSorting.Split(' ');

                if (array.Length > 0)
                    campo = array[0];

                if (array.Length > 1)
                    crescente = array[1];

                List<Cliente> clientes = new BoCliente().Pesquisa(jtStartIndex, jtPageSize, campo, crescente.Equals("ASC", StringComparison.InvariantCultureIgnoreCase), out qtd);

                //Return result to jTable
                return Json(new { Result = "OK", Records = clientes, TotalRecordCount = qtd });
            }
            catch (Exception ex)
            {
                return Json(new { Result = "ERROR", Message = ex.Message });
            }
        }

        [HttpPost]
        public ActionResult Excluir(long id)
        {
            try
            {
                var boCliente = new BoCliente();
                var boBenef = new BoBeneficiario();


                var listaBenef = boBenef.ListarPorCliente(id);


                foreach (var b in listaBenef)
                {
                    boBenef.Excluir(b.Id);
                }


                boCliente.Excluir(id);

                return Json("Cliente e beneficiários excluídos com sucesso!");
            }
            catch (ArgumentException ex)
            {
                Response.StatusCode = 409;
                return Json("Não foi possível excluir: " + ex.Message);
            }
            catch (Exception ex)
            {
                Response.StatusCode = 500;
                return Json("Erro ao excluir cliente e beneficiários: " + ex.Message);
            }
        }

    }
}