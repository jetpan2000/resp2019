using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Octacom.Odiss.OPG.Lib.EF;
using Octacom.Odiss.Library;
using System.Configuration;
using System.IO;

namespace Octacom.Odiss.OPG.Lib.Utils
{
    public class DocHelper
    {
        public static int ArchiveDoc(Guid appId, Guid docId, string referenceNo, string notes)
        {
            try
            {
                using (var db = new Odiss_OPG_BaseEntities())
                {
                    var doc = db.tblGroups.SingleOrDefault(x => x.GUID == docId);
                    if (doc == null)
                        return 0;

                    doc.Archived = 1;
                    doc.ReferenceNo = referenceNo;
                    doc.ArchiveComment = notes;
                    doc.ArchivedDate = DateTime.Now;
                    doc.Status = "Archive";

                    db.Entry(doc).State = System.Data.Entity.EntityState.Modified;
                    db.SaveChanges();

                    //audit
                    doc.tblDirectory = new tblDirectory(); // remove self reference loop
                    doc.tblGroupLines = new List<tblGroupLine>(); // 
                    Library.Audit.Save(AuditTypeEnum.ArchiveDocument, appId, doc );
                }
            }
            catch (Exception ex)
            {
                OdissLogger.Error($"Archive doc error:{ex.ToString()}");
                return -1;
            }
          
            return 1;
        }

        public static int ResubmitDoc(Guid appId, Guid docId, string notes)
        {
            try
            {
                using (var db = new Odiss_OPG_BaseEntities())
                {
                    var doc = db.tblGroups.SingleOrDefault(x => x.GUID == docId);
                    if (doc == null)
                        return 0;

                    //remove file first
                    int iret = MoveResubmitDocPDF(doc);
                    if (iret < 0)
                    {
                        return iret;
                    }

                    doc.Archived = 2; // Resubmitted
                    doc.ArchivedDate = DateTime.Now;
                    doc.ArchiveComment = notes;
                    doc.Status = "Resubmit";
                    doc.ReferenceNo = doc.InvoiceNo;

                    db.Entry(doc).State = System.Data.Entity.EntityState.Modified;
                    db.SaveChanges();

                    //audit
                    doc.tblDirectory = new tblDirectory(); // remove self reference loop
                    doc.tblGroupLines = new List<tblGroupLine>(); // 
                    Library.Audit.Save(AuditTypeEnum.ResubmitDocument, appId, doc);
                }
            }
            catch (Exception ex)
            {
                OdissLogger.Error($"ResubmitDoc doc error:{ex.ToString()}");
                return -1;
            }

            return 1;
        }

        public static string GetResubmitPDFRootFolder()
        {
            string resubmitPDFRootFolder = ConfigurationManager.AppSettings["ResubmitPDFRootFolder"];

            if (string.IsNullOrWhiteSpace(resubmitPDFRootFolder))
                throw new Exception("Please set ResubmitPDFRootFolder.");

            if (resubmitPDFRootFolder.LastIndexOf("\\") != resubmitPDFRootFolder.Length - 1)
                resubmitPDFRootFolder += "\\"; // add last back slash

            return resubmitPDFRootFolder;
        }

        public static int MoveResubmitDocPDF(tblGroup doc)
        {
            string pdfStorageRoot = ""; // ConfigurationManager.AppSettings["PDFRootFolder"];
            using (var db = new Odiss_OPG_BaseEntities())
            {
                var setting1 = db.Settings.FirstOrDefault(x => x.Name.ToLower() == "documentspath");
                if (setting1 == null)
                {
                    OdissLogger.Error($"DocumentsPath was not set.");
                    return -1;
                }

                if (setting1.Value.IndexOf("\\") < 0)
                {
                    OdissLogger.Error($"DocumentsPath was not set correctly.");
                    return -2;
                }

                pdfStorageRoot = setting1.Value;
            }


            if (pdfStorageRoot.LastIndexOf("\\") != pdfStorageRoot.Length - 1)
                pdfStorageRoot += "\\"; // add last back slash

            string resubmitPDFRootFolder = GetResubmitPDFRootFolder();

            string directoryId = doc.DirectoryID;
            string year = directoryId.Substring(0,4);
            string fileName = doc.Filename;

            string sourceFile = $"{pdfStorageRoot}{year}\\{directoryId}\\{fileName}";
            string destFolder = $"{resubmitPDFRootFolder}{year}\\{directoryId}";
            if (!Directory.Exists(destFolder))
                Directory.CreateDirectory(destFolder);

            string destFile = $"{destFolder}\\{fileName}";

            try
            {
                File.Copy(sourceFile, destFile);
                //File.Delete(sourceFile);  // dont delete for now, since tblGroup table record still there
            }
            catch (Exception ex)
            {
                string details = ex.ToString();
                if (details.IndexOf("already exist") > -1)
                    return 0;

                OdissLogger.Error($"MoveResubmitDocPDF error: {details}");
                return -3;
            }
            return 1;
        }
    }
}