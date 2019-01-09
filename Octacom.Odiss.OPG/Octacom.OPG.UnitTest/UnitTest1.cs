using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Collections.Generic;
using Octacom.Odiss.OPG.Lib.EF;
using Octacom.Odiss.OPG.Lib.Utils;
using Octacom.Odiss.OPG.Lib;
using System.Linq;
using Octacom.OPG.UnitTest.OctacomService;

namespace OPG.UnitTest
{
    [TestClass]
    public class UnitTest1
    {
        [TestMethod]
        public void TestOctacomService()
        {
            var client = new InvoiceServiceSoapClient();
            string ret = client.SendInvoice(new DateTime(2018, 12, 27), @"\\dev-appsrv-01\Others\Data\OPG\PROD_DATA\2018-12-27\OPG_AP.20181220.000000.17.xml");

            Console.WriteLine(ret);

        }

        [TestMethod]
        public void TestMoveResubmitDocPDF()
        {
            using (var db = new Odiss_OPG_BaseEntities())
            {
                var doc = db.tblGroups.SingleOrDefault(x => x.GUID == new Guid("2D90B70D-0353-432D-B1AB-03D61F2B87AB"));

                int iret =  DocHelper.MoveResubmitDocPDF(doc);

                Assert.AreEqual(iret , 1);
            }

        }
    }
}
