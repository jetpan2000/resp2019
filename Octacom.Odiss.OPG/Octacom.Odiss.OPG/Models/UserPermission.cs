using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Octacom.Odiss.OPG.Models
{
    public enum UserPermission
    {
        None = 0,
        ViewDocuments = 1,
        ExportResults = 2,
        ViewNotes = 4,
        AddNotes = 8,
        DeleteNotes = 16,
        EditProperties = 32,
        PrintDocuments = 64,
        SaveDocuments = 128,
        ViewAudits = 256,
        AnyApplication = 512,
        SubmitDocuments = 1024,
        EmailDocument = 2048,
        ViewReports = 4096,
        ViewHiddenFields = 8192,
        DeleteDocuments = 16384,

        ArchiveDocuments = 32768,
        ResubmitDocument = 65536,

        All = int.MaxValue
    }
}