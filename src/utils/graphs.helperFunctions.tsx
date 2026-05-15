export function breakHeader(header, length = 45) {
  let reg = new RegExp(".{1," + length + "}", "g");
  let arr = header?.match(reg);
  let newHeader = "";
  for (let [index, value] of arr.entries()) {
    if (value[value.length - 1] === " ") {
      newHeader = newHeader + value + `<br/>`;
    } else if (index + 1 === arr.length) {
      newHeader = newHeader + value;
    } else if (value[value.length - 1] !== " ") {
      newHeader = newHeader + value + `- <br/>`;
    }
  }
  return newHeader;
}

export function breakLabel(string, length = 15) {
  let reg = new RegExp(".{1," + length + "}", "g");
  let arr = string.match(reg);
  let newStr = "";
  for (let [index, value] of arr.entries()) {
    if (value[value.length - 1] === " ") {
      newStr = newStr + value + `<br/>`;
    } else if (index + 1 === arr.length) {
      newStr = newStr + value;
    } else if (value[value.length - 1] !== " ") {
      newStr = newStr + value + `- <br/>`;
    }
  }
  return newStr;
}

export function roundOfMaxYAxisValue(value) {
  let divValue = value,
    val = Number(divValue).toFixed(0).toString();
  let len = val.length - 1;
  let lenNO = Number(val.charAt(0)) + 2;
  for (let i = 0; i < len; i++) lenNO += "0";
  divValue = Math.ceil(divValue / Number(lenNO)) * Number(lenNO);
  return divValue;
}

export function roundOfpositive_NegativeMaxValue(max, min) {
  if (max < -1) max = max * -1;
  if (min < -1) min = min * -1;
  if (max < min) max = min;
  return Math.ceil(max / 5) * 5;
}

export function maximumStack(data) {
  let arr = [];
  data.map((elm) => {
    elm.data.map((item, i) => {
      if (arr[i] === undefined) {
        arr[i] = +item.value;
      } else {
        arr[i] += +item.value;
      }
    });
  });
  arr.sort((a, b) => b - a);
  return arr[0] * 1.15;
}

export function placeValueOutside(data) {
  let total = 0;
  for (let item of data) {
    total += parseInt(item.value);
  }
  for (let item of data) {
    let percent = (item.value / total) * 100;

    if (percent < 4) {
      if (percent < 2) {
        item["labelPosition"] = "none";
        item["valuePosition"] = "none";
        item["showValue"] = false;
      } else {
        item["labelPosition"] = "outside";
        item["valuePosition"] = "outside";
        item["labelFontColor"] = "#7f7f7f";
        item["showValue"] = true;
      }
    }
  }
  return data;
}

export function removeLegends(data) {
  let total = 0;
  for (let item of data) {
    total += parseInt(item.value);
  }
  let delete_items = [];
  for (let [index, item] of data.entries()) {
    let percent = (item.value / total) * 100;
    if (percent === 0) delete_items.push(index);
  }
  delete_items.reverse();
  for (let item of delete_items) {
    data.splice(item, 1);
  }
  return data;
}

export function data_length(data) {
  let datalength = 0;
  for (let item of data) {
    let count = (item.label + "").match(/<br/g);
    if (count !== null) datalength += count.length;
    if (item.label !== "") datalength++;
  }
  return datalength;
}
