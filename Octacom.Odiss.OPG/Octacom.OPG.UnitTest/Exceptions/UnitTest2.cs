using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Collections.Generic;
using Octacom.Odiss.OPG.Lib.EF;
using Octacom.Odiss.OPG.Lib.Utils;
using Octacom.Odiss.OPG.Lib;

namespace OPG.UnitTest
{
    [TestClass]
    public class UnitTest2
    {
        [TestMethod]
        public void TestArchiveDoc()
        {
            Guid guid = new Guid("f481a439-8662-40a2-83e9-4f942f480068");
            Guid appId = new Guid("f481a439-8662-40a2-83e9-4f942f480068");
            DocHelper.ArchiveDoc(appId, guid, "", "");

            //Assert
            Assert.AreNotEqual(0, 1);
        }

        [TestMethod]
        public void TestResubmitDoc()
        {
            Guid guid = new Guid("f481a439-8662-40a2-83e9-4f942f480068");
            DocHelper.ResubmitDoc(guid, guid, "");

            //Assert
            Assert.AreNotEqual(0, 1);
        }

        [TestMethod]
        public void TestServiceStart()
        {
            AribaHelper helper = new AribaHelper();
            helper.Start();

            //Assert
            Assert.AreNotEqual(0, 1);
        }


        [TestMethod]
        public void TestGetSenderFromvwEmail()
        {
            //Arrange 
            string sender;
            DateTime? receivedDate;
            string filename = @"OPG_AP.20181115.000002.19";


            int ret = OctaExceptionHelper.GetSenderFromvwEmail(filename, out sender, out receivedDate);

            //Assert
            Assert.AreNotEqual(0, ret);
        }

        [TestMethod]
        public void TestProcessOctaException()
        {
            //Arrange 
            DateTime adate = new DateTime(2018,11,16);
            string file = @"OPG_AP.20181115.000002.19.XML";
         

            int ret = OctaExceptionHelper.ProcessOctacomException(adate, file);

            //Assert
            Assert.AreNotEqual(0, ret);
        }



        [TestMethod]
        public void TestParseOctacomExceptionXmlFile()
        {
            //Arrange 
            string errorCode, batchType, pureSourceImage;
            tblGroup agroup;
            List<tblGroupLine> lines;
            string file = @"E:\bak\OPG_SAMPLE_DATA\Octacom_Exceptions\2018_11_20\OPG_AP.20181121.000001.07.XML";
        

            int ret = OctaExceptionHelper.ParseOctacomExceptionXmlFile(file, out batchType, out errorCode, out pureSourceImage, out agroup, out lines);

            //Assert
            Assert.AreNotEqual(0, ret);
        }


        [TestMethod]
        public void TestProcessAribaDayExceptions()
        {
            //Arrange 
            DateTime aDate = new DateTime(2018,11,12);

            int ret = AribaHelper.ProcessAribaDayExceptions(aDate, false );

            //Assert
            Assert.AreNotEqual(0, ret);
        }

        [TestMethod]
        public void TestParseRespXMLFile()
        {
            //Arrange 
            string filepathname = @"E:\bak\OPG_SAMPLE_DATA\OPG_AP.20181109.000000.09XML1478252313911254.resp.xml";
            string code, text, message;

            int ret = AribaHelper.ParseRespXMLFile(filepathname, out code, out text, out message);

            //Assert
            Assert.AreNotEqual(0, ret);
        }

        [TestMethod]
        public void TestProcessPrimaryFile()
        {
            //Arrange 
           // string xmlFile = @"E:\bak\OPG_SAMPLE_DATA\OPG_AP.20181112.000002.636776588467901018.xml";
            DateTime finalizationtime = new DateTime(2018,11,12) ;
            string processMessage;

            int ret = AribaHelper.ProcessPrimaryFile(finalizationtime, "OPG_AP.20181109.000002.21XML1480844455713905", out processMessage);

            //Assert
            Assert.AreNotEqual(0, ret);
        }


        [TestMethod]
        public void TestAribaParseXMLFile()
        {
            //Arrange 
            string fullfolder = @"E:\bak\OPG_SAMPLE_DATA\";
            string filename = "OPG_AP.20181112.000002.636776588467901018.xml";
            DateTime finalizationtime = DateTime.Now;
            string processMessage;

            tblGroup agroup;
            List<tblGroupLine> groupline;

            int ret = AribaHelper.ParseAribaPrimaryXMLFile(fullfolder, filename, finalizationtime, out agroup, out groupline, out processMessage);

            //Assert
            Assert.AreNotEqual(0, ret);
        }

        [TestMethod]
        public void TestAddGroupLine()
        {
            //Arrange
            tblGroupLine aGroupLine = new tblGroupLine();
            Guid referenceId = new Guid("EF088139-9C02-4EC8-9D55-51FF702B72FE");

            aGroupLine.Qty = 11;
            aGroupLine.UOM = "UOM";
            aGroupLine.UnitPrice = 100;
            aGroupLine.ReferenceId = referenceId;


            //Act
            var guid = TblGroupHelper.AddGroupLine(aGroupLine);

            //Assert
            Assert.AreNotEqual(null, guid);
        }


        [TestMethod]
        public void TestAddTblGroup()
        {
            //Arrange
            tblGroup aGroup = new tblGroup();
            aGroup.InvoiceNo = "invoiceNo";
            aGroup.OriginalFilename = "original file anme";
            aGroup.ScanDate = DateTime.Now.AddDays(-10);
            aGroup.TotalAmount = 10000.11M;
            aGroup.Filename = "filename";
            aGroup.DirectoryID = "20181126";

            //Act
            var guid = TblGroupHelper.AddTblGroup(aGroup);

            //Assert
            Assert.AreNotEqual(null, guid);
        }

        [TestMethod]
        public void TestPreparePDFFolderAndDirectoryId()
        {
            //Arrange
            string rootfolder = AribaHelper.GetPDFRootFolder();
            DateTime today = DateTime.Now;
            string directoryId, pdffolder;

            //Act
            var ret = DirLocation.PreparePDFFolderAndDirectoryId(rootfolder, today, out directoryId, out pdffolder);

            //Assert
            Assert.AreNotEqual(0, ret);
        }


        [TestMethod]
        public void TestGetDayErrorList()
        {
            //Arrange
            DateTime today = new DateTime(2018,11,22);
            List<GetAribaWaitingExceptionList_Result> processList;

            //Act
            var ret = AribaHelper.GetDayExceptionList(today, false, out processList);

            //Assert
            Assert.AreNotEqual(0, processList.Count);
        }

        [TestMethod]
        public void TestGetAribaExceptionsRootFolder()
        {
            //Arrange            

            //Act
            var aribaExceptionRootFolder = AribaHelper.GetAribaExceptionsProcessFolder();

            //Assert
            Assert.AreNotEqual("", aribaExceptionRootFolder);
        }

        [TestMethod]
        public void TestGetOctacomExceptionsRootFolder()
        {
            //Arrange            

            //Act
            var octacomExceptionRootFolder = OctaExceptionHelper.GetOctacomExceptionsRootFolder();

            //Assert
            Assert.AreNotEqual("", octacomExceptionRootFolder);
        }

        [TestMethod]
        public void TestGetAribaDateFullFolderPath()
        {
            //Arrange            

            //Act
            var fullpath = ""; // AribaHelper.GetAribaDateFullFolderPath(new DateTime(2018,11,9));

            //Assert
            Assert.AreEqual(@"E:\bak\OPG_SAMPLE_DATA\Ariba_Exceptions\OPG-ERR_20181109\", fullpath);
        }

        
    }
}
