/*
  Description: A minalistic class to manipulate cookies on webpage
  Creator: Melchisedek Hengue Touomo
  inspired from https://www.w3schools.com/js/js_cookies.asp
  License: MIT https://opensource.org/licenses/MIT
*/

// Cunstructor
function SimpleCookies(){

}

// reads a cookie by name
SimpleCookies.prototype.getCookie = function(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

// set/create a cookie
SimpleCookies.prototype.setCookie = function (cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

SimpleCookies.prototype.deleteCookie = function(cname) {
  document.cookie = cname + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}
