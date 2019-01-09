using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Services;
using Octacom.Odiss.OPG.Lib;
using Octacom.Odiss.OPG.Lib.Utils;

namespace Octacom.Odiss.OPG.WebServices
{
    /// <summary>
    /// Summary description for InvoiceService
    /// </summary>
    [WebService(Namespace = "http://tempuri.org/")]
    [WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
    [System.ComponentModel.ToolboxItem(false)]
    // To allow this Web Service to be called from script, using ASP.NET AJAX, uncomment the following line. 
    // [System.Web.Script.Services.ScriptService]
    public class InvoiceService : System.Web.Services.WebService
    {  // http://host-domain-name/WebServices/InvoiceService.asmx   http://localhost:3950/WebServices/InvoiceService.asmx?op=SendInvoice
        [WebMethod]
        public string SendInvoice(DateTime processDate, string xmlFullFileName)
        { // xmlFullFileName: something like:  E:\bak\OPG_SAMPLE_DATA\Octacom_Exceptions\2018_11_16\OPG_AP.20181115.000002.21.XML
            int iret;

            OdissLogger.SetExceptionEmailSubject("OPG Web Service threw exceptions, please check log file for more details.");

            try
            {
                iret = OctaExceptionHelper.ProcessOctacomException(processDate, xmlFullFileName);
            }
            catch(Exception ex) {
                OdissLogger.Error($"SendInvoice error: {ex.ToString()}");
                iret = -11;
            }

            if (iret == 1)
                return "OK.";
            else
                return "Error code:" + iret;
        }
    }
}
