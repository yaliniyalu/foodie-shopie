import {date} from "quasar";

import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en.json'
TimeAgo.addDefaultLocale(en)
const timeAgoObj = new TimeAgo('en-US')

export function getFileFromUrl(url) {
  return url.substring(url.lastIndexOf('/') + 1);
}

export function getAssetsUrl(filename, type) {
  if (filename.startsWith("http") || filename.startsWith('/uploads')) {
    return filename
  }

  return `${process.env.UPLOADS_URL}/${type}/${filename}`;
  if (!filename) {
    return 'https://picsum.photos/250/250?random=' + Math.random()
  }

  if (filename.includes("http") && filename.includes("storage")) {
    filename = filename.split('http')[2]
    if (filename)
      filename = 'http' + filename
    else
      filename = `${process.env.UPLOADS_URL}/${type}/${filename}`
  }

  if (filename.startsWith("http")) {
    return filename
  }

  return 'http://placehold.jp/250x250.png'
}

export function formatCurrency(price, preferInt = false) {
  if (!price) {
    return "₹0"
  }

  if (isInt(price) && preferInt) {
    return "₹" + parseFloat(price).toFixed(0)
  }

  return "₹" + parseFloat(price).toFixed(2)
}

export function isInt(value) {
  return !isNaN(value) &&
    parseInt(Number(value)) == value &&
    !isNaN(parseInt(value, 10));
}

export function humanDateTime(d) {
  const timeStamp = new Date(d)
  return date.formatDate(timeStamp, 'DD-MM-YYYY h:mm a')
}

export function humanDate(d) {
  const timeStamp = new Date(d)
  return date.formatDate(timeStamp, 'DD-MM-YYYY')
}

export function humanTime(d) {
  const timeStamp = new Date(d)
  return date.formatDate(timeStamp, 'h:mm a')
}

export function timeAgo(d) {
  return timeAgoObj.format(new Date(d))
}

export const isToday = (someDate) => {
  const today = new Date()
  return someDate.getDate() === today.getDate() &&
    someDate.getMonth() === today.getMonth() &&
    someDate.getFullYear() === today.getFullYear()
}

export const isTomorrow = (someDate) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  return someDate.getDate() === tomorrow.getDate() &&
    someDate.getFullYear() === tomorrow.getFullYear() &&
    someDate.getMonth() === tomorrow.getMonth()
}

export function getAvatarUrl(user) {
  if (user.image) {
    return getAssetsUrl(user.image, 'admin')
  }

  return `${generateAvatar(user.name)}`
}

export function trimWithEllipsis(text, length) {
  if (!text) return '';
  if (text.length > length - 3) {
    return text.substring(0, length).trimEnd() + "..."
  }
  else {
    return text
  }
}

export function getXPercentOfY(x, y) {
  return x * y / 100
}

export function formatNumberWithFloat(qty) {
  if (!qty) {
    return "0"
  }

  if (isInt(qty)) {
    return parseFloat(qty).toFixed(0)
  }

  return parseFloat(qty).toFixed(2)
}

export function getDiscountStr(value, type) {
  if (type === 'Percent') {
    return formatNumberWithFloat(value) + "%"
  } else {
    return "₹" + formatNumberWithFloat(value)
  }
}

function stringToHslColor(str, s, l) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const h = hash % 360;
  return 'hsl('+h+', '+s+'%, '+l+'%)';
}

export function downloadFile(uri, name = '') {
  const link = document.createElement("a");
  link.setAttribute('download', name);
  link.href = uri;
  link.target = "_blank"
  document.body.appendChild(link);
  link.click();
  link.remove();
}


function generateAvatar(text) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  canvas.width = 200;
  canvas.height = 200;

  // Draw background
  context.fillStyle = stringToHslColor(text, 30, 80);
  context.fillRect(0, 0, canvas.width, canvas.height);

  text = (text => text.map((n, i)=>(i===0||i===text.length-1)&&n[0]).filter(n=>n).join(""))(text.split(" "));

  // Draw text
  context.font = "bold 100px Assistant";
  context.fillStyle = "#fff";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, canvas.width / 2, canvas.height / 2);

  return canvas.toDataURL("image/png");
}
