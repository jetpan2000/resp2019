using System.Linq;
using System.Web.Http;
using System.Web.Mvc;
using Octacom.Odiss.Core.Business;
using Octacom.Odiss.Core.Contracts.Repositories;
using Octacom.Odiss.Core.Contracts.Services;
using Octacom.Odiss.Core.DataLayer;
using Octacom.Odiss.Core.DataLayer.Application;
using Octacom.Odiss.Core.DataLayer.User;
using Octacom.Odiss.OPG.Adapters;
using Octacom.Odiss.OPG.Code;
using SimpleInjector;
using SimpleInjector.Integration.Web.Mvc;
using SimpleInjector.Integration.WebApi;

namespace Octacom.Odiss.OPG
{
    public class Inject
    {
        public static void Register()
        {
            var container = new Container();

            RegisterRepositories(container);
            RegisterServices(container);
            RegisterAdapters(container);

            DependencyResolver.SetResolver(new SimpleInjectorDependencyResolver(container));
            GlobalConfiguration.Configuration.DependencyResolver = new SimpleInjectorWebApiDependencyResolver(container);
        }

        private static void RegisterServices(Container container)
        {
            container.Register<ICachingService, NoopCachingService>();
            container.Register<IConfigService, ConfigService>();
            container.Register<IUserService, UserService>();
        }

        private static void RegisterRepositories(Container container)
        {
            container.Register<IUserRepository, UserRepository>();
            container.Register<ISettingsRepository, SettingsRepository>();
            container.Register<IApplicationRepository, ApplicationRepository>();
            container.Register<IUserDocumentRepository, UserDocumentRepository>();
            container.Register<IDatabaseRepository, DatabaseRepository>();
            container.Register<IFieldRepository, FieldRepository>();
            container.Register<IApplicationGridRepository, ApplicationGridRepository>();
        }

        private static void RegisterAdapters(Container container)
        {
            var adapterAssembly = typeof(UserAdapter).Assembly;

            var registrations =
                from type in adapterAssembly.GetExportedTypes()
                where type.Namespace.Contains(".Adapters")
                where type.GetInterfaces().Any()
                select new { Service = type.GetInterfaces().Single(), Implementation = type };

            foreach (var reg in registrations)
            {
                container.Register(reg.Service, reg.Implementation, Lifestyle.Transient);
            }
        }
    }
}