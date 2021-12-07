/* eslint-disable no-useless-escape */
const USER_KEY = "@devdao_user";
const THEME_KEY = "@devdao_theme";
const GUEST_KEY = "@devdao_guest";

class Helper {
  // Get File Extension
  static getFileEXT(string) {
    const temp = string.split(".");
    const ext = temp[temp.length - 1].toLowerCase();
    return ext;
  }

  // Validate Email
  static validateEmail(value) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(value.toLowerCase());
  }

  // Please use a password with at least 8 characters including at least one number, one letter and one symbol
  static checkPassword(password) {
    if (password.length < 8) return false;

    let re = /[0-9]/;
    if (!re.test(password)) return false;

    re = /[a-zA-Z]/;
    if (!re.test(password)) return false;

    re = /(?=.*[.,=+;:\_\-?()\[\]<>{}!@#$%^&*])^[^'"]*$/;

    if (!re.test(password)) return false;

    return true;
  }

  // Save User
  static storeUser(userData) {
    window.localStorage.setItem(USER_KEY, JSON.stringify(userData));
  }

  // Remove Saved User
  static removeUser() {
    window.localStorage.removeItem(USER_KEY);
  }

  // Return Saved User
  static fetchUser() {
    const jsonData = window.localStorage.getItem(USER_KEY);
    if (jsonData) return JSON.parse(jsonData);
    return {};
  }

  // Unformat Price String
  static unformatPriceNumber(string) {
    let stringNew = string.toString();
    const last = stringNew[stringNew.length - 1];
    if (last == ".") stringNew = stringNew.substring(0, stringNew.length - 1);

    stringNew = stringNew.replaceAll(".", "");
    stringNew = stringNew.replaceAll(",", ".");

    if (last == ".") stringNew = stringNew + ".";

    return stringNew;
  }

  // Unformat Telegram
  static unformatTelegram(str) {
    return `${str}`.replaceAll("@", "");
  }

  // Format Telegram
  static formatTelegram(string) {
    string = this.unformatTelegram(string);
    if (string) return "@" + string;
    return "";
  }

  static ordinalSuffixOf(i) {
    var j = i % 10,
      k = i % 100;
    if (j == 1 && k != 11) {
      return i + "st";
    }
    if (j == 2 && k != 12) {
      return i + "nd";
    }
    if (j == 3 && k != 13) {
      return i + "rd";
    }
    return i + "th";
  }

  // Unformat Percentage
  static unformatPercentage(str) {
    return str ? `${str}`.replaceAll("%", "") : "";
  }

  // Format Percentage
  static formatPercentage(string) {
    string = this.unformatPercentage(string);
    if (string) return string + "%";
    return "";
  }

  // Unformat Float String
  static unformatNumber(str) {
    return str ? `${str}`.replaceAll(",", "") : "";
  }

  // Format Price String
  static formatPriceNumber(str, unit = "") {
    if (+str === 0) return `${unit}0`;
    str = this.unformatNumber(str);
    if (isNaN(str) || str.trim() == "") return "";
    const temp = str.split(".");
    if (temp.length > 1) {
      return `${unit}${
        new Intl.NumberFormat("de-DE").format(parseInt(temp[0])) + "," + temp[1]
      }`;
    } else {
      return `${unit}${new Intl.NumberFormat("de-DE").format(+str)}`;
    }
  }

  // Format Float String
  static formatNumber(str) {
    str = `${str}`.replaceAll(",", "");

    if (isNaN(str) || str.trim() == "") return "";
    const temp = str.split(".");
    if (temp.length > 1) {
      return (
        new Intl.NumberFormat("en-US").format(parseInt(temp[0])) + "." + temp[1]
      );
    } else {
      return new Intl.NumberFormat("en-US").format(parseInt(str));
    }
  }

  // Adjust String to Precision - Fixed Float String
  static adjustNumericString(string, digit = 0) {
    if (isNaN(string) || string.trim() == "") return "";
    const temp = string.split(".");
    if (temp.length > 1) {
      const suffix = temp[1].substr(0, digit);
      return `${temp[0]}.${suffix}`;
    } else return string;
  }

  // Get Excerpt
  static getExcerpt(text) {
    const length = 150;
    if (text?.length > length) return text.substring(0, length) + "...";
    else return text;
  }

  // Get Color Theme
  static getTheme() {
    let theme = window.localStorage.getItem(THEME_KEY);
    if (!theme) theme = "dark";
    return theme;
  }

  // Save Color Theme
  static saveTheme(theme) {
    window.localStorage.setItem(THEME_KEY, theme);
  }

  // Get Saved Guest Key or Generate a New One
  static getGuestKey(generateNew = true) {
    let key = window.localStorage.getItem(GUEST_KEY);
    if (key) return key;

    if (generateNew) {
      key =
        "devdao_guest_user_" +
        Date.now() +
        "_" +
        Math.floor(Math.random() * 100);
      window.localStorage.setItem(GUEST_KEY, key);
      return key;
    } else return "";
  }

  // Remove Guest Key
  static removeGuestKey() {
    window.localStorage.removeItem(GUEST_KEY);
  }

  // IS DEV
  static isDEV() {
    const href = window.location.href;
    if (href.includes("localhost:")) return true;
    return false;
  }

  static joinURL(hostname, path) {
    if (path && path.startsWith("/")) {
      return `${hostname}${path.substring(1)}`;
    } else {
      return `${hostname}/${path}`;
    }
  }
}

export default Helper;
