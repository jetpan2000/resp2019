using Octacom.Odiss.Library;
using Octacom.Odiss.Library.Auth;
using Octacom.Odiss.Library.Config;
using Octacom.Odiss.OPG.Globalization;
using System;
using System.Text.RegularExpressions;
using System.Web;
using System.Web.Helpers;
using System.Web.Mvc;
using System.Web.Security;

namespace Octacom.Odiss.OPG.Controllers
{
    public class AuthController : BaseController
    {
        #region Login

        /// <summary>
        /// Login page
        /// </summary>
        /// <returns></returns>
        [NoCache]
        public ActionResult Login()
        {
            if (HttpContext.Request.IsAjaxRequest())
            {
                return Json(new AjaxResult { IsAuthenticated = false, Success = false }, JsonRequestBehavior.AllowGet);
            }

            return View();
        }

        /// <summary>
        /// Login page (post)
        /// </summary>
        /// <param name="model"></param>
        /// <param name="returnUrl"></param>
        /// <returns></returns>
        [HttpPost]
        [AllowAnonymous]
        [NoCache]
        public ActionResult Login(LoginIndex model, string returnUrl)
        {
            try
            {
                AntiForgery.Validate();
            }
            catch (Exception ex)
            {
                ex.Log();

                ModelState.AddModelError(string.Empty, Words.Login_SessionExpired);
            }

            if (!ModelState.IsValid) return View();

            AuthLogin login = new AuthLogin();

            login.DeactivateTemporaryUsers();

            if (!login.IsUserLocked(model.Username))
            {
                if (login.ValidateUser(model.Username, model.Password))
                {
                    var user = Users.GetByUsername(model.Username);

                    login.CleanUserLocks(model.Username);
                    login.CleanUnusedSessions(user.ID);

                    if (ConfigBase.Settings.MaxConcurrentUsers != 0)
                    {
                        int totalLoggedUsers = login.GetTotalLoggedUsers();

                        if (ConfigBase.Settings.MaxConcurrentUsers <= totalLoggedUsers)
                        {
                            ModelState.AddModelError(string.Empty, Words.Login_LimitExceeded);

                            Audit.Save(new Audit() { Action = AuditTypeEnum.UserLoginMaxConcurrentReached, UserName = model.Username, Data = login.GetAuditData(false) });

                            return View();
                        }
                    }

                    if (login.DoLogin(model.Username))
                    {
                        Audit.Save(new Audit() { Action = AuditTypeEnum.Login, UserName = model.Username, Data = login.GetAuditData(true) });

                        if (login.ChangePassword)
                        {
                            if (!string.IsNullOrWhiteSpace(returnUrl))
                            {
                                return Redirect(Url.Action("ChangePassword", "Auth", new { returnUrl = returnUrl }));
                            }
                            else
                            {
                                return Redirect(Url.Action("ChangePassword", "Auth"));
                            }
                        }
                        else
                        {
                            if (IsLocalUrl(returnUrl))
                            {
                                return Redirect(returnUrl);
                            }
                            else
                            {
                                return Redirect(Url.Action("Index", "Home"));
                            }
                        }
                    }
                }
                else
                {
                    if (login.UserExists(model.Username))
                    {
                        login.SaveWrongAccessAttempt(model.Username);
                    }

                    Audit.Save(new Audit() { Action = AuditTypeEnum.UserInvalidLogin, UserName = model.Username, Data = login.GetAuditData(false) });
                    ModelState.AddModelError(string.Empty, Words.Login_InvalidPassword);
                }
            }
            else
            {
                ModelState.AddModelError(string.Empty, Words.Login_AccountLocked);
            }

            return View();
        }

        private bool ValidateEmail(string Email)
        {
            //Regex from https://msdn.microsoft.com/en-us/library/01escwtf(v=vs.110).aspx
            return Regex.IsMatch(Email,
                                 @"^(?("")("".+?(?<!\\)""@)|(([0-9a-z]((\.(?!\.))|[-!#\$%&'\*\+/=\?\^`\{\}\|~\w])*)(?<=[0-9a-z])@))" +
                                 @"(?(\[)(\[(\d{1,3}\.){3}\d{1,3}\])|(([0-9a-z][-\w]*[0-9a-z]*\.)+[a-z0-9][\-a-z0-9]{0,22}[a-z0-9]))$",
                                 RegexOptions.IgnoreCase);
        }

        /// <summary>
        /// Reset password (post)
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        [HttpPost]
        [AllowAnonymous]
        public ActionResult ResetPassword(ResetPassword model)
        {
            if (!ConfigBase.Settings.PasswordReset) return HttpNotFound();

            try
            {
                AntiForgery.Validate();
            }
            catch (Exception ex)
            {
                ex.Log();

                return null;

                ///TODO: Change the message
                return Json(new { status = "error", message = Words.Login_SessionExpired });
            }

            if (!ModelState.IsValid) return null;

            if (!ValidateEmail(model.EmailAddress))
            {
                return Json(new { status = "error", message = Words.Login_PasswordResetInvalidEmail });
            }

            if (new AuthLogin().ResetPassword(model.EmailAddress))
            {
                return Json(new { status = "success", message = Words.Login_PasswordResetEmailSent });
            }
            else
            {
                return Json(new { status = "error", message = Words.Login_PasswordResetInvalidEmail });
            }
        }

        /// <summary>
        /// Username reminder (post)
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        [HttpPost]
        [AllowAnonymous]
        public ActionResult UsernameReminder(UsernameReminder model)
        {
            if (!ConfigBase.Settings.UsernameReminder) return HttpNotFound();

            try
            {
                AntiForgery.Validate();
            }
            catch (Exception ex)
            {
                ex.Log();

                return null;

                ///TODO: Change the message
                return Json(new { status = "error", message = Words.Login_SessionExpired });
            }

            if (!ModelState.IsValid) return null;

            if (!ValidateEmail(model.EmailAddressUsernameReminder))
            {
                return Json(new { status = "error", message = Words.Login_PasswordResetInvalidEmail });
            }

            if (new AuthLogin().UsernameReminder(model.EmailAddressUsernameReminder))
            {
                return Json(new { status = "success", message = Words.Login_UsernameReminderEmailSent });
            }
            else
            {
                return Json(new { status = "error", message = Words.Login_PasswordResetInvalidEmail });
            }
        }

        #endregion

        #region Change Password

        [Authorize]
        [Angular(AngularControllerEnum.ChangePasswordController)]
        public ActionResult ChangePassword()
        {
            return View();
        }

        [HttpPost]
        [Authorize]
        [ValidateAntiForgeryToken]
        [Angular(AngularControllerEnum.ChangePasswordController)]
        public ActionResult ChangePassword(ChangePasswordIndex cpi, string returnUrl)
        {
            if (string.IsNullOrWhiteSpace(cpi.NewPassword) || string.IsNullOrWhiteSpace(cpi.ConfirmNewPassword))
            {
                ModelState.AddModelError(string.Empty, Words.PasswordEmpty);
            }

            if (cpi.NewPassword != cpi.ConfirmNewPassword)
            {
                ModelState.AddModelError(string.Empty, Words.PasswordDoesntMatch);
            }

            //if (cpi.NewPassword.Length < ConfigBase.Settings.MinimumPasswordLength || cpi.NewPassword.Length > ConfigBase.Settings.MaximumPasswordLength)
            //{
            //    ModelState.AddModelError(string.Empty, string.Format(Words.Password_Rules, ConfigBase.Settings.MinimumPasswordLength, ConfigBase.Settings.MaximumPasswordLength));
            //}

            bool bUpperLetters = Regex.IsMatch(cpi.NewPassword, "[A-Z]");
            bool bLowerLetters = Regex.IsMatch(cpi.NewPassword, "[a-z]");
            bool bSpecialChars = true; // System.Text.RegularExpressions.Regex.IsMatch(cpi.NewPassword, "[!@#$&*]");
            bool bNumbers = Regex.IsMatch(cpi.NewPassword, "[0-9]");

            string sPasswordStrengh = Words.User_PasswordStrengh;

            if (ConfigBase.Settings.ForcePasswordStrength == false)
            {
                bUpperLetters = bLowerLetters = bSpecialChars = bNumbers = true;
                sPasswordStrengh = "";
            }

            if (
                cpi.NewPassword.Length < ConfigBase.Settings.MinimumPasswordLength ||
                cpi.NewPassword.Length > ConfigBase.Settings.MaximumPasswordLength ||
                !bUpperLetters ||
                !bLowerLetters ||
                !bSpecialChars ||
                !bNumbers
                )
            {
                //return Json(new { status = false, ex = string.Format(Words.Password_Rules, ConfigBase.Settings.MinimumPasswordLength, ConfigBase.Settings.MaximumPasswordLength, sPasswordStrengh) });
                ModelState.AddModelError(string.Empty, string.Format(Words.Password_Rules, ConfigBase.Settings.MinimumPasswordLength, ConfigBase.Settings.MaximumPasswordLength, sPasswordStrengh));
            }

            if (ModelState.IsValid)
            {
                bool passwordChanged = User.ChangePassword(cpi.NewPassword);

                if (passwordChanged)
                {
                    if (IsLocalUrl(returnUrl))
                    {
                        return Redirect(returnUrl);
                    }
                    else
                    {
                        return Redirect(Url.Action("Index", "Home"));
                    }
                }

                ModelState.AddModelError(string.Empty, Words.ChangePassword_Error);
            }

            return View(cpi);
        }

        /// <summary>
        /// Request to change user password
        /// </summary>
        /// <param name="currentP">Current password</param>
        /// <param name="newP">New password</param>
        /// <param name="confirmP">Confirm the new password</param>
        /// <returns></returns>
        [HttpPost]
        [Authorize]
        [ValidateAntiForgeryToken]
        public JsonResult SavePassword(string currentP, string newP, string confirmP)
        {
            if (string.IsNullOrWhiteSpace(currentP))
            {
                return Json(new { status = false, ex = Words.PasswordEmptyCurrent });
            }

            if (string.IsNullOrWhiteSpace(newP) || string.IsNullOrWhiteSpace(confirmP))
            {
                return Json(new { status = false, ex = Words.PasswordEmpty });
            }

            if (newP != confirmP)
            {
                return Json(new { status = false, ex = Words.PasswordDoesntMatch });
            }

            bool bUpperLetters = Regex.IsMatch(newP, "[A-Z]");
            bool bLowerLetters = Regex.IsMatch(newP, "[a-z]");
            bool bSpecialChars = true; // System.Text.RegularExpressions.Regex.IsMatch(newP, "[!@#$&*]");
            bool bNumbers = Regex.IsMatch(newP, "[0-9]");

            string sPasswordStrengh = Words.User_PasswordStrengh;

            if (ConfigBase.Settings.ForcePasswordStrength == false)
            {
                bUpperLetters = bLowerLetters = bSpecialChars = bNumbers = true;
                sPasswordStrengh = "";
            }

            if (
                newP.Length < ConfigBase.Settings.MinimumPasswordLength ||
                newP.Length > ConfigBase.Settings.MaximumPasswordLength ||
                !bUpperLetters ||
                !bLowerLetters ||
                !bSpecialChars ||
                !bNumbers
                )
            {
                return Json(new { status = false, ex = string.Format(Words.Password_Rules, ConfigBase.Settings.MinimumPasswordLength, ConfigBase.Settings.MaximumPasswordLength, sPasswordStrengh) });
            }

            bool passwordChanged = User.ChangePassword(currentP, newP);

            return passwordChanged ?
                Json(new { status = true, message = Words.PasswordChanged }) :
                Json(new { status = false, ex = Words.PasswordNotChanged });
        }

        #endregion

        #region Logoff

        /// <summary>
        /// Logoff user
        /// </summary>
        /// <returns></returns>
        [Authorize]
        public ActionResult Logoff()
        {
            AuthLogin.KillUserSession(User.ID);

            FormsAuthentication.SignOut();

            new AuthLogin().CleanupSessions();

            return RedirectToRoute("Login");
        }

        #endregion

        private bool IsLocalUrl(string url)
        {
            if (string.IsNullOrEmpty(url))
                return false;

            return
                (url[0] == '/' && (url.Length == 1 || (url[1] != '/' && url[1] != '\\'))) ||
                (url.Length > 1 && url[0] == '~' && url[1] == '/')
                ;
        }
    }
}