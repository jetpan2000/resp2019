using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Octacom.Odiss.OPG.Lib.EF;
using System.Configuration;
using System.Xml.Linq;
using System.Xml;
using Octacom.Odiss.OPG.Lib.Utils;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using System.Timers;

namespace Octacom.Odiss.OPG.Lib
{
    public class AribaHelper
    {
        private static string aribaExceptionsProcessFolder = GetAribaExceptionsProcessFolder();
        private static string aribaExceptionsBackupFolder = GetAribaExceptionsBackupFolder();

        private static System.Timers.Timer aTimer;

        private static volatile bool stopRequested = false;

        private static int aribaSerivceDailyProcessAtHour = GetAribaSerivceDailyProcessAtHour();
        private static int aribaSerivceDailyProcessAtMinute = GetAribaSerivceDailyProcessAtMinute();
        private static DateTime aribaExceptionsStartDate = GetAribaExceptionsStartDate(); 

        private static void CheckIfItsTimeToProcessExceptions(Object source, ElapsedEventArgs e)
        {// check every minute to see if it's time to process Ariba process.
            DateTime now = DateTime.Now;
            if (now.Hour == aribaSerivceDailyProcessAtHour && now.Minute == aribaSerivceDailyProcessAtMinute)
            {
                OdissLogger.Info($"It's time to process Ariba exceptions.");

                AribaServiceDailyProcess(now, true);
            }
        }

        public static int ProcessPrimaryFile(DateTime finalizationTime, string primaryFileName, out string processMessage)
        {
            string directoryId, pdfFileName;
            processMessage = "";

            int iret = GeneratePDFFile(primaryFileName, aribaExceptionsProcessFolder, finalizationTime, out directoryId, out pdfFileName, out processMessage);
            if (iret < 0)  // if 0, means file alread created.
            {
                return iret;
            }

            tblGroup aGroup;
            List<tblGroupLine> grouplines;

            iret = ParseAribaPrimaryXMLFile(aribaExceptionsProcessFolder, primaryFileName, finalizationTime, out aGroup, out grouplines, out processMessage);
            if (iret < 1)
                return iret;

            string batchType, sender, originalFileName, sourceImage;
            DateTime? fTime, receivedDate;
            iret = GetAribaExceptionBatchType(primaryFileName, out batchType, out fTime, out processMessage);
            if (iret == 1)
            {
                if (batchType == "OPG-EMAIL")// get sender from db
                {
                    iret = GetAribaExceptionSender(primaryFileName, out sender, out receivedDate, out sourceImage, out originalFileName);
                    if (iret == 1)
                    {
                        aGroup.Sender = sender;
                        aGroup.ReceivedDate = receivedDate;
                        aGroup.OriginalFilename = originalFileName;
                        aGroup.SourceImage = sourceImage;
                        aGroup.Source = "EMAIL";
                    }
                }
                else
                {
                    aGroup.Source = "SCAN";
                }
            }           

            string respXmlFileName = primaryFileName + ".resp";
            string statusCode, statusText, statusMessage;
            iret = ParseRespXMLFile($"{aribaExceptionsProcessFolder}{respXmlFileName}", out statusCode, out statusText, out statusMessage);

            aGroup.DirectoryID = directoryId;
            aGroup.Filename = pdfFileName;
            aGroup.ScanDate = finalizationTime;
            aGroup.XMLFile = primaryFileName.Substring(0, primaryFileName.IndexOf("XML"));
            aGroup.AribaExceptionCode = statusCode;
            aGroup.AribaExceptionReason = statusMessage;
            aGroup.DocType = "Ariba";
            aGroup.I_CaptureDate = DateTime.Now;

            //next save to table
            TblGroupHelper.AddTblGroup(aGroup);

            foreach (var line in grouplines)
            {
                TblGroupHelper.AddGroupLine(line);
            }

            processMessage = "";
            return 1;
        }

        public static int GeneratePDFFile(string primaryFileName, string originalPdfFileFolder, DateTime finalizationTime, out string directoryId, out string pdfFileName, out string processMessage)
        {
            string targetPDFBaseFolder = GetPDFRootFolder();
            pdfFileName = "";
            directoryId = "";
            processMessage = "";

            string pdfStorageFolder;

            int iret = DirLocation.PreparePDFFolderAndDirectoryId(targetPDFBaseFolder, finalizationTime, out directoryId, out pdfStorageFolder);
            if (iret != 1)
            {
                processMessage = $"Could not prepare directoryId and pdf storage folder: {primaryFileName}, {targetPDFBaseFolder}, {finalizationTime}";
                OdissLogger.Error(processMessage);
                return -1;
            }


            string pdfSourceFileName = primaryFileName.ToUpper().Replace("XML","pdf");
            pdfFileName = pdfSourceFileName + ".pdf";

            string sourceFullName, storageFullName;
            sourceFullName = originalPdfFileFolder + pdfSourceFileName;
            storageFullName = pdfStorageFolder + pdfFileName;

            if (!File.Exists(sourceFullName))
            {
                processMessage = $"Source pdf file:{sourceFullName} does not exist, primary file name: {primaryFileName}, finalization time: {finalizationTime.ToString()}";
                OdissLogger.Error(processMessage);
                return -2;
            }

            try
            {
                File.Copy(sourceFullName, storageFullName);
            }
            catch (Exception ex)
            {
                string details = ex.ToString();
                processMessage = $"Could not copy pdf file, from {sourceFullName} to {storageFullName}. Details:{details}";
                OdissLogger.Error(processMessage);

                if (details.IndexOf("already exists") > 0)
                {
                    processMessage = "Pdf file exists, process continues.";
                    return 0;
                }

                return -3;
            }

            processMessage = "";
            return 1;
        }

        public static int ParseRespXMLFile(string aribaRespXmlFullPath, out string statusCode, out string statusText, out string statusMessage)
        {
            XmlDocument doc = new XmlDocument();
            doc.Load(aribaRespXmlFullPath);

            XmlNode statusNode = doc.SelectSingleNode("/cXML/Response/Status");

            statusCode = statusNode.Attributes["code"].Value;
            statusText = statusNode.Attributes["text"].Value;
            statusMessage = statusNode.InnerText;

            return 1;
        }

        public static int ParseAribaPrimaryXMLFile(string sourceFullFolder, string primaryFileName, DateTime finalizationTime, out tblGroup group, out List<tblGroupLine> groupLines, out string processMessage)
        {
            group = new tblGroup();
            groupLines = new List<tblGroupLine>();
            processMessage = "";

            if (!File.Exists($"{sourceFullFolder}{primaryFileName}"))
            {
                processMessage = $"Primary XML file: { sourceFullFolder}{ primaryFileName} does not exist.";
                OdissLogger.Error(processMessage);
                return -1;
            }

            XmlDocument doc = new XmlDocument();
            doc.Load($"{sourceFullFolder}{primaryFileName}");

            XmlNode invoiceDetailRequest = doc.SelectSingleNode("/cXML/Request/InvoiceDetailRequest");

            XmlNode requestHeader = invoiceDetailRequest.SelectSingleNode("InvoiceDetailRequestHeader");
            string invoiceID = requestHeader.Attributes["invoiceID"].Value;
            group.InvoiceNo = invoiceID;
            XmlNode nodeGrossAmount = invoiceDetailRequest.SelectSingleNode("InvoiceDetailSummary/GrossAmount");

            string strGrossAmount = nodeGrossAmount.SelectSingleNode("Money").InnerText;

            decimal grossAmount;


            if (!decimal.TryParse(strGrossAmount, out grossAmount))
            {
                processMessage = $"File:{sourceFullFolder}{primaryFileName} has invalid GrossAmount:{strGrossAmount}";
                OdissLogger.Error(processMessage);
                return -2;
            }

            group.TotalAmount = grossAmount;
            group.GUID = Guid.NewGuid();
            group.I_CaptureDate = DateTime.Now;

            XmlNodeList invoiceDetailOrders = invoiceDetailRequest.SelectSingleNode("InvoiceDetailOrder").SelectNodes("InvoiceDetailItem");

            XmlNode nodeInvoiceDetailOrderInfo = invoiceDetailRequest.SelectSingleNode("InvoiceDetailOrder/InvoiceDetailOrderInfo/MasterAgreementIDInfo");
            string PONumber = nodeInvoiceDetailOrderInfo.Attributes["agreementID"].Value;
            group.PONumber = PONumber;

            foreach (XmlNode item in invoiceDetailOrders)
            {
                string uom = item.SelectSingleNode("UnitOfMeasure").InnerText;
                string unitPrice = item.SelectSingleNode("UnitPrice/Money").InnerText;
                string quantity = item.Attributes["quantity"].Value;
                string strLineNumber = item.Attributes["invoiceLineNumber"].Value;

                tblGroupLine aline = new tblGroupLine();
                aline.UOM = uom;
                aline.Qty = int.Parse(quantity);
                aline.UnitPrice = decimal.Parse(unitPrice);
                aline.Guid = Guid.NewGuid();
                aline.ReferenceId = group.GUID;
                aline.InvoiceLineNumber = int.Parse(strLineNumber);

                groupLines.Add(aline);
            }

            return 1;
        }       

        public void Start()
        {
            OdissLogger.Info("Starting Ariba Windows service...");
            OdissLogger.SetExceptionEmailSubject("OPG Ariba Service threw exceptions, please check log file for more details.");

            if (ConfigurationManager.AppSettings["Test_Mode_Process_One_Day_When_Start_Service"].ToLower() == "true")
            {
                string dateStr = ConfigurationManager.AppSettings["Test_Mode_Date_To_Process_When_Start_Service"];
                if (!string.IsNullOrWhiteSpace(dateStr))
                {
                    DateTime aDate;
                    if (DateTime.TryParse(dateStr, out aDate))
                    {
                        AribaServiceDailyProcess(aDate.AddDays(1), false);  //  the service will always process previous date, so add one day
                    }
                }                
            }

            // Create a timer with one minute interval.
            aTimer = new System.Timers.Timer(60000);
            // Hook up the Elapsed event for the timer. 
            aTimer.Elapsed += CheckIfItsTimeToProcessExceptions;
            aTimer.AutoReset = true;
            aTimer.Enabled = true;

            OdissLogger.Info("Ariba Windows service started...");
            OdissLogger.Info($"The service will process Ariba exceptions daily at hour:{aribaSerivceDailyProcessAtHour}, minute:{aribaSerivceDailyProcessAtMinute}, now is:{DateTime.Now.Hour}:{DateTime.Now.Minute}");
        }

        public void Stop()
        {
            stopRequested = true;

            OdissLogger.Info("Stopping Ariba Windows service...");
            aTimer.Stop();
            aTimer.Dispose();

            Thread.Sleep(3000);

            OdissLogger.Info("Ariba Windows service stopped...");
        }

        public static void AribaServiceDailyProcess(DateTime triggerTime, bool processDaysTillPreviousDay)
        {// if processDaysTillPreviousDay is true, then process multiple days, otherwise only process one day: previous day

            DateTime processEndDate = triggerTime.AddDays(-1);

            if (!processDaysTillPreviousDay)
                OdissLogger.Info($"Start to process Ariba exceptions: one day only:{processEndDate.ToString("yyyy-MM-dd")}");
            else
                OdissLogger.Info($"Start to process Ariba exceptions: from: {aribaExceptionsStartDate.ToShortDateString()} to:{processEndDate.ToShortDateString()}");

            ProcessAribaDayExceptions(processEndDate, processDaysTillPreviousDay);

        }

        public static int ProcessAribaDayExceptions(DateTime aDate, bool processDaysTillPreviousDay)
        {
            List<GetAribaWaitingExceptionList_Result> processList;

            int iret = GetDayExceptionList(aDate, processDaysTillPreviousDay, out processList);
            if (iret != 1)
                return iret;

            if (processList != null && processList.Count > 0)
            {
                if (processDaysTillPreviousDay)
                    OdissLogger.Info($"Found {processList.Count} exception records in OICSConnectorProcess table which FinalizationTime between {aribaExceptionsStartDate.ToString("yyyy-MM-dd")} and {aDate.ToString("yyyy-MM-dd")} and HasErrors is true. Processing started.");
                else
                    OdissLogger.Info($"Found {processList.Count} exception records in OICSConnectorProcess table which FinalizationTime is {aDate.ToString("yyyy-MM-dd")} and HasErrors is true. Processing started.");

                ProcessAribaDayExceptionList(aDate, processList);
            }
            else
            {
                if (processDaysTillPreviousDay)
                    OdissLogger.Info($"There is no unprocessed exception record between {aribaExceptionsStartDate.ToString("yyyy-MM-dd")} and {aDate.ToString("yyyy-MM-dd")}.");
                else
                    OdissLogger.Info($"There is no unprocessed exception record for date:{aDate.ToString("yyyy-MM-dd")}.");
            }

            return 1;
        }

        public static int ProcessAribaDayExceptionList(DateTime aDate, List<GetAribaWaitingExceptionList_Result> processList)
        {
            string filename, processMessage;
            foreach (var process1 in processList)
            {
                if (stopRequested)
                    return 0;

                filename = process1.PrimaryFileName;
                try
                {
                    int iret = ProcessPrimaryFile(process1.FinalizationTime.Value, process1.PrimaryFileName, out processMessage);

                    if (iret == 1) // if all right, then move files to backup folder
                    {
                        MoveFilesToBackupFolder(process1.FinalizationTime.Value, process1.PrimaryFileName);                   
                    }

                    // insert into AribaProcessedException table, so it wont pricess it next time
                    AribaProcessedException processed1 = new AribaProcessedException();
                    processed1.OICSConnectorProcessId = process1.OICSConnectorProcessId;
                    processed1.ProcessedDate = DateTime.Now;
                    processed1.ServiceState = iret;
                    processed1.ServiceDetails = processMessage;

                    using (var db = new Octacom_OICS_Entities())
                    {
                        db.Entry(processed1).State = System.Data.Entity.EntityState.Added;
                        db.SaveChanges();
                    }
                }
                catch (Exception ex)
                {
                    OdissLogger.Error($"Error occurred when process {filename}: {ex.ToString()}");
                }
            }

            OdissLogger.Info($"Ariba service processed {processList.Count} exception records.");

            return 1;
        }

        public static int MoveFilesToBackupFolder(DateTime finalizationTime, string primaryFileName)
        { //primaryFileName: OPG_AP.20181109.000002.39XML1480844455713905 , move 4 files 

            string pdfFileName = primaryFileName.Replace("XML","pdf");
            string respFileName = primaryFileName + ".resp";
            string respHFileName = primaryFileName + ".respH";

            string dateSubfolder = finalizationTime.ToString("yyyyMMdd") + "\\";
            if (!Directory.Exists(aribaExceptionsBackupFolder + dateSubfolder))
                Directory.CreateDirectory(aribaExceptionsBackupFolder + dateSubfolder);

            try
            {
                File.Move(aribaExceptionsProcessFolder + primaryFileName, aribaExceptionsBackupFolder + dateSubfolder + primaryFileName);
                File.Move(aribaExceptionsProcessFolder + pdfFileName, aribaExceptionsBackupFolder + dateSubfolder + pdfFileName);
                File.Move(aribaExceptionsProcessFolder + respFileName, aribaExceptionsBackupFolder + dateSubfolder + respFileName);
                File.Move(aribaExceptionsProcessFolder + respHFileName, aribaExceptionsBackupFolder + dateSubfolder + respHFileName);
            }
            catch (Exception ex)
            {
                OdissLogger.Error($"MoveFilesToBackupFolder error: primaryFileName:{primaryFileName}, finalization time:{finalizationTime.ToShortDateString()}. {ex.ToString()}");
                return -1;
            }
            return 1;
        }

        public static int GetDayExceptionList(DateTime finalizationTime, bool processDaysTillfinalizationTime, out List<GetAribaWaitingExceptionList_Result> processList)
        {//if processDaysTillfinalizationTime == true, it will process multiple dates from aribaExceptionsStartDate to finalizationTime, if not, only process one date: finalizationTime
            int year = finalizationTime.Year;
            int month = finalizationTime.Month;
            int day = finalizationTime.Day;

            DateTime exceptionStartDate;

            if (processDaysTillfinalizationTime)
                exceptionStartDate = aribaExceptionsStartDate;
            else
                exceptionStartDate = finalizationTime; // only one day

            try
            {
                using (var db = new Octacom_OICS_Entities())
                {
                    processList = db.GetAribaWaitingExceptionList(exceptionStartDate, finalizationTime).ToList();

                    return 1;
                }
            }
            catch (Exception ex)
            {
                OdissLogger.Error($"GetDayExceptionList from database error: {ex.ToString()}");
                processList = null;
                return -1;
            }
        }

        public static int GetAribaExceptionBatchType(string primaryFileName, out string batchType, out DateTime? finalizationTime, out string processMessage )
        {
            batchType = "";
            finalizationTime = null;
            processMessage = "";

            try
            {
                using (var db = new Octacom_OICS_Entities())
                {
                    db.Database.CommandTimeout = 180;
                    var ret = db.GetAribaExceptionBatchType(primaryFileName).FirstOrDefault();
                    if (ret != null)
                    {
                        batchType = ret.BatchType;
                        finalizationTime = ret.FinalizationTime;
                    }
                }
            }
            catch (Exception ex)
            {
                processMessage = $"GetAribaExceptionBatchType error: {ex.ToString()}";
                OdissLogger.Error(processMessage);
                return -1;
            }

            return 1;
        }

        public static int GetAribaExceptionSender(string primaryFileName, out string sender, out DateTime? receivedDate, out string sourceImage, out string originalFileName)  //  only if batch type is OPG-EMAIL, use this to get sender
        {
            sender = "";
            originalFileName = "";
            sourceImage = "";
            receivedDate = null;
            try
            {
                using (var db = new Octacom_OICS_Entities())
                {
                    db.Database.CommandTimeout = 180;
                    var ret = db.GetAribaExceptionSender(primaryFileName).FirstOrDefault();
                    if (ret != null)
                    {
                        sender = ret.Sender;
                        receivedDate = ret.ReceivedDate;
                        originalFileName = ret.Filename;
                        sourceImage = ret.SourceImage;
                    }
                }
            }
            catch (Exception ex)
            {
                OdissLogger.Error($"GetAribaExceptionSender error: {ex.ToString()}");
                return -1;
            }

            return 1;
        }
     
        public static string GetAribaExceptionsProcessFolder()  // this folder is for all the files daily, no date folder as Yogesh suggested
        {
            string folder = ConfigurationManager.AppSettings["AribaExceptionsProcessFolder"];

            if (string.IsNullOrWhiteSpace(folder))
            {
                OdissLogger.Error("Please config AribaExceptionsProcessFolder.");
                throw new Exception("Please config AribaExceptionsProcessFolder.");
            }

            if (folder.LastIndexOf("\\") != folder.Length - 1)
                folder += "\\"; // add last back slash

            return folder;
        }

        public static string GetAribaExceptionsBackupFolder()   
        {
            string folder = ConfigurationManager.AppSettings["AribaExceptionsBackupFolder"];

            if (string.IsNullOrWhiteSpace(folder))
            {
                OdissLogger.Error("Please config AribaExceptionsBackupFolder.");
                throw new Exception("Please config AribaExceptionsBackupFolder.");
            }

            if (folder.LastIndexOf("\\") != folder.Length - 1)
                folder += "\\"; // add last back slash

            return folder;
        }

        public static int GetAribaSerivceDailyProcessAtHour()
        {
            string strHour = ConfigurationManager.AppSettings["AribaSerivceDailyProcessAtHour"];

            if (string.IsNullOrWhiteSpace(strHour))
            {
                OdissLogger.Error("Please config AribaSerivceDailyProcessAtHour.");
                throw new Exception("Please config AribaSerivceDailyProcessAtHour.");
            }

            int hour;
            if (!int.TryParse(strHour, out hour)  || hour > 23 || hour < 0)
            {
                OdissLogger.Error($"AribaSerivceDailyProcessAtHour is not a valid hour number:{strHour}.");
                throw new Exception($"AribaSerivceDailyProcessAtHour is not a valid hour number:{strHour}.");
            }

            return hour;
        }

        public static int GetAribaSerivceDailyProcessAtMinute()
        {
            string strMinute = ConfigurationManager.AppSettings["AribaSerivceDailyProcessAtMinute"];

            if (string.IsNullOrWhiteSpace(strMinute))
            {
                OdissLogger.Error("Please config AribaSerivceDailyProcessAtMinute.");
                throw new Exception("Please config AribaSerivceDailyProcessAtMinute.");
            }

            int minute;
            if (!int.TryParse(strMinute, out minute) || minute > 59 || minute < 0)
            {
                OdissLogger.Error($"AribaSerivceDailyProcessAtMinute is not a valid minute number:{strMinute}.");
                throw new Exception($"AribaSerivceDailyProcessAtMinute is not a valid minute number:{strMinute}.");
            }

            return minute;
        }
        
        public static DateTime GetAribaExceptionsStartDate()
        {
            string dateStr = ConfigurationManager.AppSettings["AribaExceptionsStartDate"];

            DateTime aDate;

            if (!DateTime.TryParse(dateStr, out aDate))
            {
                OdissLogger.Error($"AribaExceptionsStartDate is not a valid Datetime.");
                throw new Exception($"AribaExceptionsStartDate is not a valid Datetime.");
            }

            return aDate;             
        }

        public static string GetPDFRootFolder()
        {
            string folder = ConfigurationManager.AppSettings["PDFRootFolder"];

            if (folder.LastIndexOf("\\") != folder.Length - 1)
                folder += "\\"; // add last back slash

            return folder;
        }
    }
}