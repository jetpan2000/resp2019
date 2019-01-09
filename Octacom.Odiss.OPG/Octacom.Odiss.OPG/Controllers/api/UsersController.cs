using System.Web.Http;
using Octacom.Odiss.Core.Contracts.Services;
using Octacom.Odiss.Core.Entities.User;

namespace Octacom.Odiss.ABCgroup.Web.Controllers.api
{
    [RoutePrefix("api/users")]
    public class UsersController : ApiController
    {
        private readonly IUserService userService;

        public UsersController(IUserService userService)
        {
            this.userService = userService;
        }

        [Route("hasPermission/{permission}")]
        [Authorize]
        [HttpGet]
        public IHttpActionResult HasPermission(Octacom.Odiss.OPG.Models.UserPermission permission)
        {
            var result = userService.HasPermission<Octacom.Odiss.OPG.Models.UserPermission, UserType>(User, permission);

            return Ok(result);
        }
    }
}
