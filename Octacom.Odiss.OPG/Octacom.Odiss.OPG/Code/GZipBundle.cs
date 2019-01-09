﻿using System;
using System.IO.Compression;
using System.Net;
using System.Web;
using System.Web.Optimization;

namespace Octacom.Odiss.OPG
{
    /// <summary>
    /// Compress bundles
    /// </summary>
    public class GZipBundle : Bundle
    {
        public GZipBundle(string virtualPath, params IBundleTransform[] transforms)
            : base(virtualPath, null, transforms) { }

        public override BundleResponse CacheLookup(BundleContext context)
        {
            if (null != context) GZipEncodePage(context.HttpContext);
            return base.CacheLookup(context);
        }

        // Sets up the current page or handler to use GZip through a Response.Filter.
        public static void GZipEncodePage(HttpContextBase httpContext)
        {
            if (httpContext?.Request == null)
                return;

            if (httpContext?.Response == null)
                return;

            if ((httpContext.Response.Filter != null &&
               (httpContext.Response.Filter is GZipStream || httpContext.Response.Filter is DeflateStream)))
                return;

            // Is GZip supported?
            string acceptEncoding = httpContext.Request.Headers["Accept-Encoding"];

            if (null != acceptEncoding
                && acceptEncoding.IndexOf(DecompressionMethods.GZip.ToString(), StringComparison.OrdinalIgnoreCase) >= 0)
            {
                if (httpContext.Response.Filter != null)
                {
                    httpContext.Response.Filter = new GZipStream(httpContext.Response.Filter, CompressionMode.Compress);
                    httpContext.Response.AddHeader("Content-Encoding", DecompressionMethods.GZip.ToString().ToLowerInvariant());
                }
            }
            else if (null != acceptEncoding
                     && acceptEncoding.IndexOf(DecompressionMethods.Deflate.ToString(), StringComparison.OrdinalIgnoreCase) >= 0)
            {
                httpContext.Response.Filter = new DeflateStream(httpContext.Response.Filter, CompressionMode.Compress);
                httpContext.Response.AddHeader("Content-Encoding", DecompressionMethods.Deflate.ToString().ToLowerInvariant());
            }

            // Allow proxy servers to cache encoded and unencoded versions separately
            httpContext.Response.AppendHeader("Vary", "Content-Encoding");
        }
    }

    // Represents a bundle that does CSS minification and GZip compression.
    public sealed class GZipStyleBundle : GZipBundle
    {
        public GZipStyleBundle(string virtualPath, params IBundleTransform[] transforms) : base(virtualPath, transforms) { }
    }

    // Represents a bundle that does JS minification and GZip compression.
    public sealed class GZipScriptBundle : GZipBundle
    {
        public GZipScriptBundle(string virtualPath, params IBundleTransform[] transforms)
            : base(virtualPath, transforms)
        {
            ConcatenationToken = ";" + Environment.NewLine;
        }
    }
}