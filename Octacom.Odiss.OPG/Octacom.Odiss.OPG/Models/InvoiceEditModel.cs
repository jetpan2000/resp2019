using System;

namespace Octacom.Odiss.OPG.Models
{
    public class InvoiceEditModel
    {
        public string DataJson { get; set; }
        public Guid DocumentId { get; set; }
        public Guid AppId { get; set; }
    }
}