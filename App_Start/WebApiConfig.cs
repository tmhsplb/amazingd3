using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;
using System.Web.Http.Cors;

namespace AmazingD3
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            // Web API configuration and services
          //  var cors1 = new EnableCorsAttribute("autocomplete.wunderground.com", "*", "*");
          //  var cors2 = new EnableCorsAttribute("amazingd3.apphb.com", "*", "*");
          //  config.EnableCors(cors1);
          //  config.EnableCors(cors2);

            // Web API routes
            config.MapHttpAttributeRoutes();

            config.Routes.MapHttpRoute(
              name: "GetSuntimes",
              routeTemplate: "api/{controller}/{year}/{month}/{date}/{longitude}/{latitude}/{gmtOffset}/{dstOffset}"
            );

            config.Routes.MapHttpRoute(
              name: "GetSunyear",
              routeTemplate: "api/{controller}/{year}/{longitude}/{latitude}/{gmtOffset}"
            );

            config.Routes.MapHttpRoute(
                name: "DefaultApi",
                routeTemplate: "api/{controller}/{id}",
                defaults: new { id = RouteParameter.Optional }
            );

            config.Formatters.XmlFormatter.SupportedMediaTypes.Remove(
              config.Formatters.XmlFormatter.SupportedMediaTypes.FirstOrDefault(t => t.MediaType == "application/xml"));
        }
    }
}
