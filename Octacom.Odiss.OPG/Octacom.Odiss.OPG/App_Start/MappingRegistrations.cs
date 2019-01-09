using AutoMapper;
using Octacom.Odiss.Core.Entities.User;
using Octacom.Odiss.Library;

namespace Octacom.Odiss.OPG
{
    public class MappingRegistrations
    {
        public static void Register()
        {
            Mapper.Initialize(cfg =>
            {
                cfg.CreateMap<User, Users>();
                cfg.CreateMap<Core.Entities.User.UserDocument, Library.UserDocument>();
                cfg.CreateMap<Core.Entities.User.UserPermission, Library.UserPermissionsEnum>();
            });
        }
    }
}