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
    
    public partial class OPG_PO_IMPORTEntities : DbContext
    {
        public OPG_PO_IMPORTEntities()
            : base("name=OPG_PO_IMPORTEntities")
        {
        }
    
        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            throw new UnintentionalCodeFirstException();
        }
    
        public virtual DbSet<tblEmailExclusionList> tblEmailExclusionLists { get; set; }
        public virtual DbSet<tblRegion> tblRegions { get; set; }
        public virtual DbSet<tblREJECT_LIST_PO_LEGACY> tblREJECT_LIST_PO_LEGACY { get; set; }
        public virtual DbSet<tblRejectList> tblRejectLists { get; set; }
        public virtual DbSet<tblRTVReturn> tblRTVReturns { get; set; }
        public virtual DbSet<tblVendorAddress> tblVendorAddresses { get; set; }
        public virtual DbSet<tblVendorProcess> tblVendorProcesses { get; set; }
    }
}