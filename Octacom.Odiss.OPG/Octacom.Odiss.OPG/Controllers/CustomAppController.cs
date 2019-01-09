using Octacom.Odiss.Library;
using Octacom.Odiss.Library.Auth;
using Octacom.Odiss.Library.Config;
using Octacom.Odiss.Library.Custom;
using Octacom.Odiss.OPG.Code;
using Octacom.Odiss.OPG.Models;
using System;
using System.Linq;
using System.Web.Mvc;

namespace Octacom.Odiss.OPG.Controllers
{
    public class CustomAppController : Controller
    {
        [CustomActionFilter(CustomActionFilterEnum.ViewerTab)]
        public ActionResult Invoice(Guid? id, [ModelBinder(typeof(GuidArrayModelBinder))] Guid[] docs, string extra = null)
        {
            if (docs == null || !docs.Any())
            {
                return new HttpNotFoundResult();
            }

            var apConfig = ConfigBase.Settings.Applications.SelectForLoggedUser((AuthPrincipal)User, id.Value);

            if (apConfig == null)
            {
                return new HttpNotFoundResult();
            }

            var model = new InvoiceEditModel
            {
                DocumentId = docs.First(),
                DataJson = apConfig.GetAppDataJson(),
                AppId = id.Value
            };

            return View(model);
        }
    }
}