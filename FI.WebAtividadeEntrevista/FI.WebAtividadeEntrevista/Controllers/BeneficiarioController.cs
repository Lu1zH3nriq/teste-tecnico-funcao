using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using FI.AtividadeEntrevista.BLL;

namespace FI.WebAtividadeEntrevista.Controllers
{
    public class BeneficiarioController : Controller
    {
        [HttpGet]
        public JsonResult ListarPorCliente(long idCliente)
        {
            try
            {
                var lista = new BoBeneficiario().ListarPorCliente(idCliente);
                return Json(new { Result = "OK", Records = lista }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { Result = "ERROR", Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
    }
}