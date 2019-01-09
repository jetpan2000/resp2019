using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Serilog;
using System.Configuration;
using System.Net.Mail;

namespace Octacom.Odiss.OPG.Lib.Utils
{
    public class OdissLogger
    {
        public static DateTime lastExceptionEmailNotificationDate = DateTime.Now.AddDays(-1);
        public static bool firstTime = true;
        private static string _emailSubject = "OPG Service threw exceptions, please check log file for more details.";

        public static void SetExceptionEmailSubject(string emailSubject)
        {
            _emailSubject = emailSubject;
        }

        public static void Error(string details)
        {
            if (firstTime)
            {
                Log.Logger = new LoggerConfiguration().ReadFrom.AppSettings().CreateLogger();
                firstTime = false;
            }

            Log.Error(details);

            DailyEmailServiceExceptionNotification(details);
        }

        public static void Info(string details)
        {
            if (firstTime)
            {
                Log.Logger = new LoggerConfiguration().ReadFrom.AppSettings().CreateLogger();
                firstTime = false;
            }

            Log.Information(details);
        }

        public static void Verbose(string details)
        {
            if (firstTime)
            {
                Log.Logger = new LoggerConfiguration().ReadFrom.AppSettings().CreateLogger();
                firstTime = false;
            }

            Log.Verbose(details);
        }

        public static int DailyEmailServiceExceptionNotification(string details)
        {
            if (lastExceptionEmailNotificationDate.Date == DateTime.Now.Date)
                return 1; // send email once a day. today's exception notification email has already been sent. 

            try
            {
                string emails = ConfigurationManager.AppSettings["ExceptionNoticeToEmails"];
                if (string.IsNullOrEmpty(emails))
                {
                    Error("ExceptionNoticeToEmails was not set, exception email notification can not be sent.");
                    return 0;
                }

                string[] toArray = emails.Replace(";", ",").Split(',');

                string fromEmail = ConfigurationManager.AppSettings["ExceptionNoticeFromEmail"];
                if (string.IsNullOrEmpty(fromEmail))
                    fromEmail = "Systems@octacom.ca";

                if (!toArray.Any()) return 0;

                using (var msg = new MailMessage())
                {
                    msg.From = new MailAddress(fromEmail);

                    foreach (string s in toArray.Where(s => !string.IsNullOrEmpty(s)))
                    {
                        msg.To.Add(s);
                    }

                    msg.Subject = _emailSubject;

                    msg.Body = "Details:" + details;

                    using (var smtp = new SmtpClient())
                    {
                        smtp.Send(msg);
                    }
                }

                lastExceptionEmailNotificationDate = DateTime.Now;

                return 1;
            }
            catch (Exception ex1)
            {
                Error($"Send exception email error: {ex1.ToString()}");
                return -1;
            }
        }
    }
}