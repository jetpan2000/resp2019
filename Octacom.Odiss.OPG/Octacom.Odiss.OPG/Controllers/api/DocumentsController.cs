using System;
using System.Linq;
using System.Web.Http;
using Octacom.Odiss.OPG.Lib.EF;
using Octacom.Odiss.OPG.Lib.Utils;
using Microsoft.VisualBasic;
using RefactorThis.GraphDiff;
using Newtonsoft.Json;
using System.Web;
using Octacom.Odiss.Library.Auth;

namespace Octacom.Odiss.ABCgroup.Web.Controllers.api
{
    [Authorize]
    [RoutePrefix("api/Documents")]
    public class DocumentsController : ApiController
    {
        [Route("{id}")]
        public IHttpActionResult Get(Guid? id)
        {
            if (!id.HasValue)
            {
                return NotFound();
            }

            using (var ctx = new Odiss_OPG_BaseEntities())
            {
                var group = ctx.tblGroups.FirstOrDefault(x => x.GUID == id);
                group.tblDirectory = new tblDirectory();
                group.lineItems = group.tblGroupLines;
                var json = JsonConvert.SerializeObject(group, new JsonSerializerSettings() { ReferenceLoopHandling = ReferenceLoopHandling.Ignore });
                return Ok(group);
            };
        }

        [Route("{id}")]
        public IHttpActionResult Post(Guid? id, [FromBody] ExceptionActionForm form)
        {
            Guid guid = id.Value;
            string notes = form.archiveComment;
            int iret;
            string message;

            if (string.IsNullOrWhiteSpace(notes))
            {
                iret = -1;
                message = "Please enter resubmit comments.";
                return Json(new { status = iret, message });
            }
            else if (notes.Length < 10 || notes.Length > 1000)
            {
                iret = -3;
                message = "Please make sure to enter resubmit comments of more than 9 characters and less then 1000 characters.";
                return Json(new { status = iret, message });
            }

            string user = (HttpContext.Current?.User as AuthPrincipal)?.UserName;
           
            if (form.action == "Archive")
            {              
                string referenceNo = form.referenceNo;
                notes = string.IsNullOrWhiteSpace(user) ? "Unknow user" : user + $" archived this document on : {DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss")}. Comment:{notes}";

                if (!Information.IsNumeric(referenceNo))
                {
                    iret = -2;
                    message = "Please enter a number for reference number.";
                }           
                else
                {
                    iret = DocHelper.ArchiveDoc(new Guid(form.appId), guid, referenceNo, notes);

                    if (iret >= 0)
                        message = "The document has been archived successfully.";
                    else
                        message = "Error occurred when archive document. Please contact technical support.";
                }

                return Json(new { status = iret, message });
            }
            else if (form.action == "Resubmit")
            {
                notes = string.IsNullOrWhiteSpace(user) ? "Unknow user" : user + $" resubmitted this document on : {DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss")}. Comment:{notes}";
                
                iret = DocHelper.ResubmitDoc(new Guid(form.appId), guid, notes);
                if (iret >= 0)
                    message = "Document has been resubmitted successfully.";
                else
                    message = "Error occurred when resubmit document. Please contact technical support.";

                return Json(new { status = iret, message });
            }

            return null;
        }

        [HttpPost]
        [Route("Upsert")]
        public IHttpActionResult Upsert([FromBody]tblGroup document)
        {
            try
            {
                using (var ctx = new Odiss_OPG_BaseEntities())
                {
                    var existing = ctx.tblGroups.SingleOrDefault(x => x.GUID == document.GUID);

                    document.tblGroupLines = document.lineItems;
                    foreach (var item in document.tblGroupLines)
                    {
                        if (item.Guid == Guid.Empty)
                            item.Guid = Guid.NewGuid();
                    }

                    if (existing != null)
                    {
                        ctx.Entry(existing).State = System.Data.Entity.EntityState.Detached;
                        ctx.UpdateGraph(document, map => map.OwnedCollection(x => x.tblGroupLines));
                    }
                    else
                    {
                        ctx.tblGroups.Add(document);
                    }

                    ctx.SaveChanges();
                }

                return Ok(new { status = 1, obj = document });
            }
            catch (Exception ex)
            {
                return Ok(new { status = -1, obj = ex });
            }
        }

        [Route("PUT")]
        public IHttpActionResult Put([FromBody]tblGroup document)
        {
            //return InternalServerError(); // Not ready yet

            //documentInvoiceRepository.Update(document, document.GUID);

            return Ok(document);
        }
    }

    public class ExceptionActionForm
    {
        public string appId { get; set; }
        public string action { get; set; } // Archive , Resubmit
        public string referenceNo { get; set; }
        public string archiveComment { get; set; }
    }
}