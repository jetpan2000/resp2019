using Octacom.Odiss.OPG.Globalization;
using System.ComponentModel.DataAnnotations;

namespace Octacom.Odiss.OPG
{
    public class UsernameReminder
    {
        [DataType(DataType.EmailAddress)]
        [Required(ErrorMessageResourceName = "Login_EmptyEmail", ErrorMessageResourceType = typeof(Words))]
        public string EmailAddressUsernameReminder { get; set; }
    }
}