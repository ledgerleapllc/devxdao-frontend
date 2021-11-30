import React from "react";
import "./form-input.scss";

export default function FormInput({
  type,
  required,
  value,
  placeholder,
  onChange,
  align,
  name,
  underlined,
  ...props
}) {
  const onChangeHandler = onChange || (() => {});
  let className =
    align && align == "center"
      ? "custom-form-control text-center"
      : "custom-form-control";
  if (underlined) className += " underlined";

  if (name) {
    return (
      <input
        type={type || "text"}
        required={required || false}
        value={value || ""}
        name={name}
        className={className}
        placeholder={placeholder || ""}
        autoComplete="off"
        autoSave="off"
        onChange={onChangeHandler}
        {...props}
      />
    );
  }

  return (
    <input
      type={type || "text"}
      required={required || false}
      value={value || ""}
      className={className}
      placeholder={placeholder || ""}
      autoComplete="off"
      autoSave="off"
      {...props}
      onChange={onChangeHandler}
    />
  );
}
