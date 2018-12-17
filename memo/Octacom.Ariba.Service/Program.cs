using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Topshelf;
using Serilog;
using System.Configuration;
using Octacom.Odiss.OPG.Lib;

namespace Octacom.Ariba.Service
{
    class Program
    {
        public static void Main()
        {
            var rc = HostFactory.Run((Topshelf.HostConfigurators.HostConfigurator x) =>
            {
                Log.Logger = new LoggerConfiguration().ReadFrom.AppSettings().CreateLogger();

                string aribaServiceName = ConfigurationManager.AppSettings["AribaServiceName"],

                   aribaServiceDisplayName = ConfigurationManager.AppSettings["AribaServiceDisplayName"],

                   aribaServiceDescription = ConfigurationManager.AppSettings["AribaServiceDescription"];

                if (string.IsNullOrWhiteSpace(aribaServiceName) || string.IsNullOrWhiteSpace(aribaServiceDisplayName))
                {
                    throw new ConfigurationErrorsException("AribaServiceName or AribaServiceDisplayName not set.");
                }

                x.Service<AribaHelper>(s =>
                {
                    s.ConstructUsing(name => new AribaHelper());
                    s.WhenStarted(tc => tc.Start());
                    s.WhenStopped(tc => tc.Stop());
                });

                x.StartManually();

                x.SetServiceName(aribaServiceName);

                x.SetDisplayName(aribaServiceDisplayName);

                if (!string.IsNullOrWhiteSpace(aribaServiceDescription))
                {
                    x.SetDescription(aribaServiceDescription);
                }

                //string str = ConfigurationManager.AppSettings["svcdepend"];

                //if (!string.IsNullOrWhiteSpace(str))
                //{
                //    string[] sa = str.Split(',');

                //    for (int i = 0; i < sa.Length; i++)
                //    {
                //        x.DependsOn(sa[i]);
                //    }
                //}

            });

            var exitCode = (int)Convert.ChangeType(rc, rc.GetTypeCode());
            Environment.ExitCode = exitCode;
        }

 
    }
}
