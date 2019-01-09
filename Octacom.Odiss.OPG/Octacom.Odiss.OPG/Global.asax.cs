using Octacom.Odiss.Library;
using Octacom.Odiss.Library.Auth;
using Octacom.Odiss.OPG.Controllers;
using System;
using System.Security.Authentication;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;
using System.Web.Script.Serialization;
using System.Web.Security;

namespace Octacom.Odiss.OPG
{
    public class MvcApplication : HttpApplication
    {
        protected virtual void Application_Start()
        {
            Inject.Register();
            MappingRegistrations.Register();

            MvcHandler.DisableMvcResponseHeader = true; // Remove "X-AspNetMvc-Version" header

            AreaRegistration.RegisterAllAreas();
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);

            AppConfig.Start(this);

            GlobalConfiguration.Configure(WebApiConfig.Register);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);
        }

        protected void Application_BeginRequest(object sender, EventArgs e)
        {
            var app = sender as HttpApplication;

            if (app?.Context?.Response != null)
            {
                // Remove "Server" header
                app.Context.Response.Headers.Remove("Server");
            }
        }

        protected void Application_EndRequest()
        {
        }


        protected void Application_AuthenticateRequest(object sender, EventArgs e)
        {
            if (HttpContext.Current.User != null && HttpContext.Current.User.Identity.IsAuthenticated)
            {
                if (VirtualPathUtility.MakeRelative("~", Request.Url.AbsolutePath).StartsWith("octviewer") ||
                    VirtualPathUtility.MakeRelative("~", Request.Url.AbsolutePath) == "logo" ||
                    VirtualPathUtility.MakeRelative("~", Request.Url.AbsolutePath) == "words_js")
                {
                    HttpContext.Current.SkipAuthorization = true;
                    return;
                }

                HttpCookie authCookie = Request.Cookies[FormsAuthentication.FormsCookieName];

                if (authCookie != null)
                {
                    FormsAuthenticationTicket authTicket = FormsAuthentication.Decrypt(authCookie.Value);

                    if (authTicket == null)
                        return;

                    JavaScriptSerializer serializer = new JavaScriptSerializer();
                    AuthPrincipalSerializeModel sm = serializer.Deserialize<AuthPrincipalSerializeModel>(authTicket.UserData);

                    Sessions session = new Sessions(sm.ID);
                    sm = session.Get(); // Get and save the last user action

                    if (sm != null)
                    {
                        UserData userData = sm.DecryptUserData();

                        AuthPrincipal newUser = new AuthPrincipal(authTicket.Name)
                        {
                            ID = userData.ID,
                            UserName = userData.UserName,
                            UserType = userData.UserType,
                            Permissions = userData.Permissions,
                            Applications = userData.Applications,
                            Groups = userData.Groups,
                            Email = userData.Email,
                            FirstName = userData.FirstName,
                            LastName = userData.LastName
                        };

                        HttpContext.Current.User = newUser;

                        return;
                    }
                }

                FormsAuthentication.SignOut();
                new AuthLogin().CleanupSessions();

                HttpContext.Current.User = null;
            }
        }
        /*
        protected void Application_PostAuthenticateRequest(Object sender, EventArgs e) // Used by roles
        {
            HttpCookie authCookie = Request.Cookies[FormsAuthentication.FormsCookieName];

            if (authCookie != null)
            {
                FormsAuthenticationTicket authTicket = FormsAuthentication.Decrypt(authCookie.Value);

                JavaScriptSerializer serializer = new JavaScriptSerializer();
                AuthPrincipalSerializeModel sm = serializer.Deserialize<AuthPrincipalSerializeModel>(authTicket.UserData);

                Sessions session = new Sessions(sm.ID);
                sm = session.Get();

                if (sm != null)
                {
                    UserData userData = sm.DecryptUserData();

                    AuthPrincipal newUser = new AuthPrincipal(authTicket.Name)
                    {
                        ID = userData.ID,
                        UserName = userData.UserName,
                        UserType = userData.UserType,
                        Permissions = userData.Permissions,
                        Applications = userData.Applications,
                        Email = userData.Email
                    };

                    HttpContext.Current.User = newUser;
                }
                else // Session expired
                {

                }
            }
        }
        */

        protected void Application_Error(object sender, EventArgs e)
        {
            if (!HttpContext.Current.IsCustomErrorEnabled) return;

            try
            {
                var httpContext = ((MvcApplication)sender).Context;

                var currentRouteData = RouteTable.Routes.GetRouteData(new HttpContextWrapper(httpContext));
                var currentController = " ";
                var currentAction = " ";

                if (currentRouteData != null)
                {
                    if (!string.IsNullOrEmpty(currentRouteData.Values["controller"]?.ToString()))
                    {
                        currentController = currentRouteData.Values["controller"].ToString();
                    }

                    if (!string.IsNullOrEmpty(currentRouteData.Values["action"]?.ToString()))
                    {
                        currentAction = currentRouteData.Values["action"].ToString();
                    }
                }

                var ex = Server.GetLastError();

                if (ex != null)
                {
                    System.Diagnostics.Trace.WriteLine(ex.Message);

                    if (ex.InnerException != null)
                    {
                        System.Diagnostics.Trace.WriteLine(ex.InnerException);
                        System.Diagnostics.Trace.WriteLine(ex.InnerException.Message);
                    }
                }

                var controller = new ErrorController();
                var routeData = new RouteData();
                var action = "CustomError";
                var statusCode = 500;

                if (ex is HttpException)
                {
                    var httpEx = ex as HttpException;
                    statusCode = httpEx.GetHttpCode();

                    switch (httpEx.GetHttpCode())
                    {
                        //case 400:
                        //    action = "BadRequest";
                        //    break;

                        //case 401:
                        //    action = "Unauthorized";
                        //     break;

                        case 403:
                            action = "Forbidden";
                            break;

                        case 404:
                            action = "NotFound";
                            break;

                        case 500:
                            action = "CustomError";
                            break;

                        default:
                            action = "CustomError";
                            break;
                    }
                }
                else if (ex is AuthenticationException)
                {
                    action = "Forbidden";
                    statusCode = 403;
                }

                httpContext.ClearError();
                httpContext.Response.Clear();
                httpContext.Response.StatusCode = statusCode;
                httpContext.Response.TrySkipIisCustomErrors = true;
                routeData.Values["controller"] = "Error";
                routeData.Values["action"] = action;

                if (ex != null)
                {
                    controller.ViewData.Model = new HandleErrorInfo(ex, currentController, currentAction);
                    ((IController)controller).Execute(new RequestContext(new HttpContextWrapper(httpContext),
                        routeData));
                }
            }
            catch (Exception ex)
            {
                ex.Log();
            }
        }
    }
}