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
    
    public partial class GetAribaWaitingExceptionList_Result
    {
        public int OICSConnectorProcessId { get; set; }
        public string PrimaryFileName { get; set; }
        public System.DateTime InitializationTime { get; set; }
        public Nullable<System.DateTime> LastSendTime { get; set; }
        public bool Success { get; set; }
        public bool Finalized { get; set; }
        public string TerminalStage { get; set; }
        public Nullable<System.DateTime> FinalizationTime { get; set; }
        public bool HasErrors { get; set; }
        public bool HasWarnings { get; set; }
        public string DataForTramsmission { get; set; }
        public byte[] ProcessData { get; set; }
        public byte[] InitialData { get; set; }
        public short ReTryCount { get; set; }
        public string TerminationCode { get; set; }
        public string OriginalFileName { get; set; }
    }
}