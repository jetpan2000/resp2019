﻿//------------------------------------------------------------------------------
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
    using System.Data.Entity;
    using System.Data.Entity.Infrastructure;
    
    public partial class OPG_EMAILEntities : DbContext
    {
        public OPG_EMAILEntities()
            : base("name=OPG_EMAILEntities")
        {
        }
    
        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            throw new UnintentionalCodeFirstException();
        }
    
        public virtual DbSet<tblAuditTrack> tblAuditTracks { get; set; }
        public virtual DbSet<tblBatchTrack> tblBatchTracks { get; set; }
        public virtual DbSet<tblBatchType> tblBatchTypes { get; set; }
        public virtual DbSet<vw_Email> vw_Email { get; set; }
    }
}