using System.Diagnostics;

namespace Octacom.Odiss.OPG.Code
{
    public static class OdissVersion
    {
        /// <summary>
        /// Get the current assembly version (Odiss Version)
        /// </summary>
        public static string Get => "v" + FileVersionInfo.GetVersionInfo(typeof(MvcApplication).Assembly.Location).FileVersion;
    }
}