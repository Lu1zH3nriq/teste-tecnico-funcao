using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace FI.WebAtividadeEntrevista.Models
{
    public class BeneficiarioModel
    {

        public long? Id { get; set; }

        [Required(ErrorMessage = "CPF é obrigatório")]
        [StringLength(14, ErrorMessage = "CPF deve seguir o formato 999.999.999-99")]
        public string CPF { get; set; }

        [Required]
        public string Nome { get; set; }
    }
}