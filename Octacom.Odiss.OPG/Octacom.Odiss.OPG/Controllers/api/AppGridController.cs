using Octacom.Odiss.Core.Contracts.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using Octacom.Odiss.OPG.Lib;

namespace Octacom.Odiss.OPG.Controllers.api
{
    [RoutePrefix("api/app-grid/{appId}")]
    public class AppGridController : ApiController
    {
        private readonly IApplicationGridRepository applicationGridRepository;

        public AppGridController(IApplicationGridRepository applicationGridRepository)
        {
            this.applicationGridRepository = applicationGridRepository;
        }

        [Route("")]
        [HttpGet]
        public IHttpActionResult Get(Guid appId)
        {
            var result = this.applicationGridRepository.GetAll(appId);

            return Ok(result);
        }

        [Route("")]
        [HttpPost]
        public IHttpActionResult Create(Guid appId, [FromBody] Dictionary<Guid, object> item)
        {
            var createdItem = this.applicationGridRepository.Insert(appId, item);

            return Ok(createdItem);
        }

        [Route("")]
        [HttpPut]
        public IHttpActionResult Update(Guid appId, [FromBody] Dictionary<Guid, object> item)
        {
            this.applicationGridRepository.Update(appId, item);

            return Ok();
        }

        [Route("")]
        [HttpDelete]
        public IHttpActionResult Delete(Guid appId, [FromUri] object key)
        {
            this.applicationGridRepository.Delete(appId, key);

            return Ok();
        }
    }
}