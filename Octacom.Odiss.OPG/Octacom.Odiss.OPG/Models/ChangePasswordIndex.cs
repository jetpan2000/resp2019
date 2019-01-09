using Octacom.Odiss.OPG.Globalization;
using System.ComponentModel.DataAnnotations;

namespace Octacom.Odiss.OPG
{
    public class ChangePasswordIndex
    {
        [DataType(DataType.Password)]
        [Required(ErrorMessageResourceName = "Login_EmptyPassword", ErrorMessageResourceType = typeof(Words))]
        //[MinLength(6, ErrorMessageResourceName = "", ErrorMessageResourceType = typeof(Words))]
        public string NewPassword { get; set; }

        [DataType(DataType.Password)]
        [Required(ErrorMessageResourceName = "Login_EmptyPassword", ErrorMessageResourceType = typeof(Words))]
        public string ConfirmNewPassword { get; set; }
    }
}