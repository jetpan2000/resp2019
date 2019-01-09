using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Octacom.Odiss.OPG.Lib.EF;
using System.IO;
using System.Data.Entity;

namespace Octacom.Odiss.OPG.Lib.Utils
{
    public class DirLocation
    {
        private static object _threadlock = new object();
        static Dictionary<string, string> directoryIdDict = new Dictionary<string, string>(); // key:20181101 --> directoryId: PDF20181101
        static Dictionary<string, bool> pdfDayFolderExists = new Dictionary<string, bool>(); // key:20181101 --> true

        public static int PreparePDFFolderAndDirectoryId(string baseFolder, DateTime receivedDate, out string directoryId, out string pdfStorageFolder)
        { //the new directoryId will always in this format:  20181101

            lock (_threadlock) // avoid to create same location id and directoryid
            {
                string volume = receivedDate.ToString("yyyy");
                string dictKey = receivedDate.ToString("yyyyMMdd");

                if (directoryIdDict.ContainsKey(dictKey))
                {
                    pdfStorageFolder = baseFolder + volume + "\\" + dictKey + "\\";
                    directoryId = directoryIdDict[dictKey];
                    return 1;
                }

                using (var db = new Odiss_OPG_BaseEntities())
                {
                    var directory = db.tblDirectories.SingleOrDefault(x => x.DirectoryID == dictKey); // the dictionaryId is like: 20181101

                    if (directory != null)// created previously
                    {
                        directoryId = dictKey;
                        directoryIdDict.Add(dictKey, dictKey); // saved in dictionary, so we dont need to check db again and again
                        pdfStorageFolder = baseFolder + volume + "\\" + dictKey + "\\";
                        return 1;
                    }

                    //need to create new directory
                    //first prepare folder
                    PrepareFolder(baseFolder, receivedDate);


                    // insert records into tblLocation and tblDirectory table              
                    var loc1 = new tblLocation();
                    loc1.LocationId = dictKey;
                    loc1.Volume = volume;
                    loc1.RPath = baseFolder;

                    var dir1 = new tblDirectory();
                    dir1.DirectoryID = dictKey;
                    dir1.LocationID = dictKey;
                    dir1.Directory = dictKey;

                    db.Entry(loc1).State = EntityState.Added;
                    db.Entry(dir1).State = EntityState.Added;
                    db.SaveChanges();

                    directoryIdDict.Add(dictKey, dictKey); // saved in dictionary, so we dont need to check db again and again
                    directoryId = dictKey;
                    pdfStorageFolder = baseFolder + volume + "\\" + dictKey + "\\";
                }

                return 1;
            }
        }

        public static int PrepareFolder(string baseFolder, DateTime receivedDate)
        {
            string dictKey = receivedDate.ToString("yyyyMMdd");
            if (pdfDayFolderExists.ContainsKey(dictKey) && pdfDayFolderExists[dictKey]) // folder has been created
                return 1;

            if (baseFolder.LastIndexOf("\\") != baseFolder.Length - 1)
                baseFolder += "\\";

            string year = receivedDate.ToString("yyyy");
            string newFolder = baseFolder + year + "\\" + dictKey;
            if (!Directory.Exists(newFolder))
                Directory.CreateDirectory(newFolder);

            pdfDayFolderExists.Add(dictKey, true);

            return 1;
        }
    }
}
