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
    
    public partial class tblAuditTrack
    {
        public System.Guid AID { get; set; }
        public string UserID { get; set; }
        public Nullable<System.DateTime> EventTime { get; set; }
        public string EventType { get; set; }
        public string Details { get; set; }
        public string referencetable { get; set; }
    }
}
