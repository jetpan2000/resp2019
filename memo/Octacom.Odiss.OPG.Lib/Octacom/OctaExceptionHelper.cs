using System;
using System.Collections.Generic;
using System.Linq;
using System.Configuration;
using Octacom.Odiss.OPG.Lib.Utils;
using System.IO;
using Octacom.Odiss.OPG.Lib.EF;
using System.Xml.Linq;

namespace Octacom.Odiss.OPG.Lib
{
    public class OctaExceptionHelper
    {
        public static int ProcessOctacomException(DateTime processDate, string xmlFullFileName)
        {
            if (!File.Exists(xmlFullFileName))
            {
                OdissLogger.Error($"Xml source file does not exist: xmlFullFileName");
                return -1;
            }

            string errorCode, batchType; 
            tblGroup aGroup;
            List<tblGroupLine> lines;

            int iret = ParseOctacomExceptionXmlFile(xmlFullFileName, out batchType, out errorCode, out aGroup, out lines);
            if (iret != 1)
            {
                OdissLogger.Error($"Parse {xmlFullFileName} error. Return code:{iret}");
                return -2;
            }

            if (errorCode == "E000")
            {
                OdissLogger.Info($"Error code is E000, no further process. File path: {xmlFullFileName} ");
                return 1;
            }

            int ind = xmlFullFileName.LastIndexOf("\\");
            string sourceFolder = xmlFullFileName.Substring(0, ind + 1); // with back slash at the end
            string xmlFileName = xmlFullFileName.Substring(ind + 1);


            string pdfFileName = errorCode + "_" + xmlFileName.ToUpper().Replace(".XML", ".PDF");  // error code like: E002
                      
            if (!File.Exists(sourceFolder + pdfFileName))
            {
                OdissLogger.Error($"Pdf file does not exist: {pdfFileName} at folder: {sourceFolder}");
                return -3;
            }        

            string pdfStorageFolder, directoryId;
            string targetPDFBaseFolder = GetPDFRootFolder();

            iret = DirLocation.PreparePDFFolderAndDirectoryId(targetPDFBaseFolder, processDate, out directoryId, out pdfStorageFolder);
            if (iret != 1)
            {
                OdissLogger.Error($"Could not prepare directoryId and pdf storage folder: {xmlFileName}, {targetPDFBaseFolder}, {processDate}");
                return -4;
            }

            if (batchType == "OPG-EMAIL")
            {
                string sender;
                DateTime? receivedDate;
                string shortProcessFileName = xmlFileName.ToUpper().Replace(".XML", "");    //OPG_AP.20181115.000002.03
                iret = GetSenderFromvwEmail(shortProcessFileName, out sender, out receivedDate);
                if (iret == 1)
                {
                    aGroup.Sender = sender;
                    aGroup.ReceivedDate = receivedDate;
                }

                aGroup.Source = "EMAIL";
            }
            else
            {
                aGroup.Source = "SCAN";
            }

            try
            {
                File.Copy(sourceFolder + pdfFileName, pdfStorageFolder + pdfFileName);
            }
            catch (Exception ex)
            {
                string details = ex.ToString();
                OdissLogger.Error($"Copy file error: from{sourceFolder + pdfFileName} to {pdfStorageFolder + pdfFileName}. Info:{details}");

                if (details.IndexOf("already exists") < 0)// ignore file exists error
                    return -5;
            }

            aGroup.DocType = "Octacom";
            aGroup.Filename = pdfFileName;
            aGroup.DirectoryID = directoryId;
            aGroup.GUID = Guid.NewGuid();
            aGroup.ProcessFilename = xmlFileName;
            aGroup.I_CaptureDate = DateTime.Now;

            TblGroupHelper.AddTblGroup(aGroup);

            return 1;
        }

        public static int GetSenderFromvwEmail(string shortProcessFileName, out string sender, out DateTime? receivedDate)
        {          
            sender = "";
            receivedDate = null;

            shortProcessFileName = shortProcessFileName.ToLower();

            try
            {
                using (var db = new OPG_EMAILEntities())
                {
                    db.Database.CommandTimeout = 180;
                    var email = db.vw_Email.SingleOrDefault(x => x.ProcessFileName.ToLower() == shortProcessFileName);

                    if (email == null)
                    {
                        OdissLogger.Info($"No record in vw_email with ProcessFileName = {shortProcessFileName}");
                    }
                    else
                    {
                        sender = email.Sender;
                        receivedDate = email.RecievedDate;
                    }
                }
            }
            catch (Exception ex)
            {
                OdissLogger.Error($"GetSenderFromEmail error:{ex.ToString()}");
                return -1;
            }

            return 1;
        }

        public static int ParseOctacomExceptionXmlFile(string xmlFullPathName, out string batchType, out string exceptionCode, out tblGroup aGroup, out List<tblGroupLine> lines)
        {
            aGroup = new tblGroup();
            lines = new List<tblGroupLine>();
            
            XElement xml = XElement.Load(xmlFullPathName);

            IEnumerable < XElement > codes = from node1 in xml.Descendants("ExceptionCode") select node1;
            exceptionCode = (string)codes.First();

            codes = from node1 in xml.Descendants("BatchType") select node1;
            batchType = (string)codes.First();

            codes = from node1 in xml.Descendants("Document") select node1;

            codes = from node1 in xml.Descendants("ScanDate")
                    select node1;

            DateTime scandate;
            if (DateTime.TryParse((string)codes.First(), out scandate))
            {
                OdissLogger.Error($"Invalid scan date: {(string)codes.First()}");
            }

            aGroup.ScanDate = scandate;

            IEnumerable <XElement> fields = from nodes in xml.Descendants("Field")
                                              select nodes;

            string invoiceNumber = (string)fields.Where(x => (string)x.Attribute("Type") == "invoicenumber").First();
            string ponumber = (string)fields.Where(x => (string)x.Attribute("Type") == "invoiceordernumber").First();
            string utility = (string)fields.Where(x => (string)x.Attribute("Type") == "utility").First();
            string strTotalAmount = (string)fields.Where(x => (string)x.Attribute("Type") == "invoicetotalvatincludedamount").First();

            aGroup.InvoiceNo = invoiceNumber;
            aGroup.ExceptionCode = exceptionCode;
            aGroup.PONumber = ponumber;
            aGroup.Utility = utility;
            aGroup.TotalAmount = decimal.Parse(strTotalAmount);

            return 1;
        }

        public static string GetOctacomExceptionsRootFolder()
        {
            string folder = ConfigurationManager.AppSettings["OctacomExceptionsRootFolder"];

            if (folder.LastIndexOf("\\") != folder.Length - 1)
                folder += "\\"; // add last back slash

            return folder;
        }

        public static string GetPDFRootFolder()
        {
            string folder = ConfigurationManager.AppSettings["PDFRootFolder"];

            if (folder.LastIndexOf("\\") != folder.Length - 1)
                folder += "\\"; // add last back slash

            return folder;
        }

        public static string GetOctaExceptionDateSubFolderName(DateTime date)
        {// return something like: 2018_11_16
            return date.ToString("yyyy_MM_dd");
        }

        //public static string GetOctaExceptionDateFullFolderPath(DateTime date)
        //{
        //    string octaExceptionRootFolder = GetOctacomExceptionsRootFolder();
        //    string octaDaySubFolder = GetOctaExceptionDateSubFolderName(date);

        //    return $"{octaExceptionRootFolder}{octaDaySubFolder}\\";
        //}
    }
}