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
    
    public partial class Session
    {
        public System.Guid ID { get; set; }
        public System.Guid IDUser { get; set; }
        public System.DateTime Expire { get; set; }
        public byte[] Data { get; set; }
        public System.DateTime Created { get; set; }
        public System.DateTime LastAction { get; set; }
    
        public virtual User User { get; set; }
    }
}
