import { Base64 } from "js-base64";
import { CookieType } from './index.d'

// eslint-disable-next-line import/no-anonymous-default-export
const Cookie: CookieType = {
  setCookie: (name, value, days = 7) => {
    const expires = new Date();
    expires.setDate(expires.getDate() + days);
    const serializedValue = Base64.encode(value);
    document.cookie = `${name}=${serializedValue}; expires=${expires.toUTCString()}; path=/`;
  },
  getCookie: (name) => {
    const cookies: any = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith(`${name}=`)) {
        const serializedValue = cookie.substring(name.length + 1);
        return Base64.decode(serializedValue);
      }
    }
    return null;
  },
  deleteCookie: (name) => {
    // 将Cookie的过期日期设置为过去的时间
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
  },
};

export default Cookie;