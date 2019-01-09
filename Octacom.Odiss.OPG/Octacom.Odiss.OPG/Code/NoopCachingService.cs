using System;
using Octacom.Odiss.Core.Contracts.Services;

namespace Octacom.Odiss.OPG.Code
{
    public class NoopCachingService : ICachingService
    {
        public T GetOrSet<T>(string key, Func<T> setCache)
        {
            // TODO Replace with real caching mechanism
            return setCache();
        }
    }
}