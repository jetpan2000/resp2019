//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace Octacom.Odiss.OPG.Lib.EF
{
    using System;
    using System.Collections.Generic;
    
    public partial class tblGroupLine
    {
        public System.Guid Guid { get; set; }
        public System.Guid ReferenceId { get; set; }
        public Nullable<int> InvoiceLineNumber { get; set; }
        public string UOM { get; set; }
        public Nullable<int> Qty { get; set; }
        public Nullable<decimal> UnitPrice { get; set; }
        public Nullable<decimal> ExtendedPrie { get; set; }
    
        public virtual tblGroup tblGroup { get; set; }
    }
}