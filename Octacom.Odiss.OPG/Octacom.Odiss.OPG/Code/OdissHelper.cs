using System;
using System.Net.Http;
using System.Text.RegularExpressions;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Octacom.Odiss.Library;

namespace Octacom.Odiss.OPG.Code
{
    public static class OdissHelper
    {
        public static Guid? GetApplicationIdFromReferrer(this HttpRequestMessage request)
        {
            var url = request.Headers.Referrer;

            var regex = new Regex(@"app/(.*?)(/|\z)", RegexOptions.IgnoreCase);
            var match = regex.Match(url.ToString());
            var appId = match.Groups[1].ToString();

            Guid.TryParse(appId, out var result);

            return result;
        }

        public static bool IsValidJson(string strInput)
        {
            strInput = strInput.Trim();
            if ((strInput.StartsWith("{") && strInput.EndsWith("}")) || //For object
                (strInput.StartsWith("[") && strInput.EndsWith("]"))) //For array
            {
                try
                {
                    var obj = JToken.Parse(strInput);
                    return true;
                }
                catch (JsonReaderException jex)
                {
                    //Exception in parsing json
                    Console.WriteLine(jex.Message);
                    return false;
                }
                catch (Exception ex) //some other exception
                {
                    Console.WriteLine(ex.ToString());
                    return false;
                }
            }
            else
            {
                return false;
            }
        }

        public static string GetAppDataJson(this Settings.Application apConfig)
        {
            return JsonConvert.SerializeObject(apConfig, new JsonSerializerSettings
            {
                ReferenceLoopHandling = ReferenceLoopHandling.Ignore,
                StringEscapeHandling = StringEscapeHandling.EscapeHtml,
                Converters = new[] { new ApplicationJsonConverter() }
            });
        }
    }
}