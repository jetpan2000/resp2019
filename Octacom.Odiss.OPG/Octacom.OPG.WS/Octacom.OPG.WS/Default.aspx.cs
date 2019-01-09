using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using Octacom.Odiss.OPG.Lib;
using Octacom.Odiss.OPG.Lib.Utils;

namespace Octacom.OPG.WS
{
    public partial class _Default : Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {  // processDate=2018-11-20&xmlFullFileName=\\dev-appsrv-01\Others\Data\OPG\PROD_DATA\2018-12-27\OPG_AP.20181220.000000.17.xml
            string processDate = Request.QueryString["processDate"];

            string xmlFullFileName = Request.QueryString["xmlFullFileName"];

            Response.Write("processDate: " + processDate + "; xml file: " + xmlFullFileName);

            if (!string.IsNullOrEmpty(processDate) && !string.IsNullOrEmpty(xmlFullFileName))
            {
                int iret = OctaExceptionHelper.ProcessOctacomException(DateTime.Parse(processDate), xmlFullFileName);

                Response.Write("return is:" + iret);
            }

        }
    }
}