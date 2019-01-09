using System;
using System.Collections.Generic;
using System.Linq;
using System.Configuration;
using Octacom.Odiss.OPG.Lib.Utils;
using System.IO;
using Octacom.Odiss.OPG.Lib.EF;
using System.Xml.Linq;
using Newtonsoft.Json;

namespace Octacom.Odiss.OPG.Lib
{
    public class OctaExceptionHelper
    {
        public static int ProcessOctacomException(DateTime processDate, string xmlFullFileName)
        {
            if (!File.Exists(xmlFullFileName))
            {
                OdissLogger.Error($"Xml source file does not exist: {xmlFullFileName}");
                return -1;
            }

            string errorCode, batchType, pureSoureImage; 
            tblGroup aGroup;
            List<tblGroupLine> lines;

            int iret = ParseOctacomExceptionXmlFile(xmlFullFileName, out batchType, out errorCode, out pureSoureImage, out aGroup, out lines);
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
                iret = GetSenderFromvwEmail(pureSoureImage, out sender, out receivedDate);
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

                File.Delete(sourceFolder + pdfFileName); // delete pdf file as Yogesh requested
                File.Delete(xmlFullFileName); // delete xml file

                OdissLogger.Info($"File: {sourceFolder + pdfFileName} and {xmlFullFileName} have been deleted.");
            }
            catch (Exception ex)
            {
                string details = ex.ToString();

                if (details.IndexOf("already exists") < 0)// ignore file exists error
                {
                    OdissLogger.Error($"Copy file error: from {sourceFolder + pdfFileName} to {pdfStorageFolder + pdfFileName}. Info:{details}");
                    return -5;
                }
                else
                {
                    //File.Delete(sourceFolder + pdfFileName); // delete pdf file as Yogesh requested
                    //File.Delete(xmlFullFileName); // delete xml file

                    OdissLogger.Info($"{xmlFullFileName} has been processed previously.");
                }
            }

            aGroup.OctProcessFilename = pureSoureImage;
            aGroup.DocType = "Octacom";
            aGroup.Filename = pdfFileName;
            aGroup.DirectoryID = directoryId;
            aGroup.GUID = Guid.NewGuid();
            aGroup.XMLFile = xmlFileName;
            aGroup.I_CaptureDate = DateTime.Now;

            //check if process file name has been added, if added no more process
            using (var db = new Odiss_OPG_BaseEntities())
            {
                var group1 = db.tblGroups.FirstOrDefault(x => x.XMLFile == xmlFileName);

                if (group1 != null)
                {
                    OdissLogger.Info($"XML file:{xmlFileName} has been processed. The group record will be updated, the original record is: " + JsonConvert.SerializeObject(group1, new JsonSerializerSettings() { ReferenceLoopHandling = ReferenceLoopHandling.Ignore }));
                    group1.Filename = pdfFileName;
                    group1.DirectoryID = directoryId;
                    group1.I_CaptureDate = DateTime.Now;
                    group1.DocType = "Octacom";
                    db.Entry(group1).State = System.Data.Entity.EntityState.Modified;
                    db.SaveChanges();
                }
                else
                {
                    TblGroupHelper.AddTblGroup(aGroup);
                }
            }               

            return 1;
        }

        public static int GetSenderFromvwEmail(string pureSourceImage, out string sender, out DateTime? receivedDate)
        {          
            sender = "";
            receivedDate = null;

            pureSourceImage = pureSourceImage.ToUpper();

            try
            {
                using (var db = new OPG_EMAILEntities())
                {
                    db.Database.CommandTimeout = 180;
                    var email = db.vw_Email.SingleOrDefault(x => x.ProcessFileName.ToUpper() == pureSourceImage);

                    if (email == null)
                    {
                        OdissLogger.Info($"No record in vw_email with ProcessFileName = {pureSourceImage}");
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
                return -3;
            }

            return 1;
        }

        public static int ParseOctacomExceptionXmlFile(string xmlFullPathName, out string batchType, out string exceptionCode, out string pureSourceImage, out tblGroup aGroup, out List<tblGroupLine> lines)
        { // \\datacap-srv\opg_ap\IMAGES\SCAN\0007_OP_201811200045_001.TIF     pureSourceImage:OP_201811200045
            aGroup = new tblGroup();
            lines = new List<tblGroupLine>();
            
            XElement xml = XElement.Load(xmlFullPathName);

            IEnumerable < XElement > codes = from node1 in xml.Descendants("ExceptionCode") select node1;
            exceptionCode = (string)codes.First();

            codes = from node1 in xml.Descendants("BatchType") select node1;
            batchType = (string)codes.First();

            codes = from node1 in xml.Descendants("SourceImage") select node1;
            pureSourceImage = (string)codes.First();

            int ind = pureSourceImage.LastIndexOf("\\");
            if ( ind > 0)
            {
                pureSourceImage = pureSourceImage.Substring(ind + 1);
                pureSourceImage = pureSourceImage.Substring(5, 15);
            }


            codes = from node1 in xml.Descendants("Document") select node1;

            codes = from node1 in xml.Descendants("ScanDate")
                    select node1;

            string scanDateStr = (string)codes.First();

            DateTime scandate = new DateTime(1970, 1, 1);  //12/20/2018

            try
            {
                int year = int.Parse(scanDateStr.Substring(6));
                int month = int.Parse(scanDateStr.Substring(0, 2));
                int day = int.Parse(scanDateStr.Substring(3, 2));
                scandate = new DateTime(year,month, day);
            }
            catch (Exception ex)
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
            string folder;
            using (var db = new Odiss_OPG_BaseEntities())
            {
                var setting1 = db.Settings.SingleOrDefault(x => x.Name.ToLower() == "documentspath");

                if (setting1 == null)
                {
                    OdissLogger.Error($"There is no documentspath setting in database.");
                    throw new Exception("No DocumentsPath settings.");
                }

                folder = setting1.Value;

                if (folder.IndexOf("\\") < 0)
                {
                    OdissLogger.Error($"DocumentPath was not set correctly.");
                    throw new Exception("DocumentPath was not set correctly.");
                }
            }

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