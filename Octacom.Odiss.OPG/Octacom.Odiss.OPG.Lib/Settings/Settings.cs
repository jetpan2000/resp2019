using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Octacom.Odiss.OPG.Lib.EF;
using Octacom.Odiss.OPG.Lib.Utils;

namespace Octacom.Odiss.OPG.Lib
{
    public class AppSettingWithFields
    {
        public Application app { get; set; }
        public List<Field> fields { get; set; }
    }

    public class OdissAppSettings
    {
        public static AppSettingWithFields GetAppSettingsWithFields(Guid appId)
        {
            try
            {
                using (var db = new Odiss_OPG_BaseEntities())
                {
                    db.Configuration.LazyLoadingEnabled = false;
                    var app = db.Applications.FirstOrDefault(x => x.ID == appId);
                    if (app == null)
                        return null;

                    var settings = new AppSettingWithFields();

                    settings.app = app;

                    var fields = db.Fields.Where(x => x.IDApplication == appId).ToList();

                    foreach (var field1 in fields)
                    {
                        field1.Application = null; // remove it to avoid loop serialization
                    }

                    settings.fields = fields;

                    return settings;
                }
            }
            catch (Exception ex) {
                OdissLogger.Error($"GetAppSettingsWithFields error: {ex.ToString()}");
                return null;
            }
        }
    }
}