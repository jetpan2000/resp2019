using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Octacom.Odiss.OPG.Lib.EF;
using System.Data.Entity;

namespace Octacom.Odiss.OPG.Lib
{
    public class TblGroupHelper
    {
        public static Guid AddTblGroup(tblGroup aGroup)
        {
            using (var db = new Odiss_OPG_BaseEntities())
            {
                if (aGroup.GUID == Guid.Empty)
                    aGroup.GUID = Guid.NewGuid();

                db.Entry(aGroup).State = EntityState.Added;
                db.SaveChanges();

                return aGroup.GUID;
            }
        }

        public static Guid AddGroupLine(tblGroupLine aGroupLine)
        {
            using (var db = new Odiss_OPG_BaseEntities())
            {
                if (aGroupLine.Guid == Guid.Empty)
                    aGroupLine.Guid = Guid.NewGuid();

                db.Entry(aGroupLine).State = EntityState.Added;
                db.SaveChanges();

                return aGroupLine.Guid;
            }
        }
    }
}