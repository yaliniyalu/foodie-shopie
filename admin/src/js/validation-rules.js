import {isInt} from "src/js/utils";

export const ruleRequired = v => v !== null && v !== "" || 'Required'

export const ruleNumber = v => {
  if (!v) return true
  return !isNaN(v) || 'Accepts only number'
}

export const rulePositiveNumber = v => {
  if (!v) return true
  return (!isNaN(v) && v >= 0)  || 'Accepts only positive number'
}

export const rulePositiveInteger = v => {
  if (!v) return true
  return (isInt(v) && v >= 0)  || 'Accepts only positive number'
}

export const ruleGtZero = v => {
  if (!v) return true
  return (!isNaN(v) && v > 0)  || 'Number must be Greater than Zero'
}

export const ruleEmail = v => {
  if (!v) return true

  return v.includes('@') || 'Enter Valid Email Id'
}

export const ruleMobile = v => {
  if (!v) return true

  return isInt(v) && (v + "").length === 10 || 'Enter Valid Mobile Number'
}
