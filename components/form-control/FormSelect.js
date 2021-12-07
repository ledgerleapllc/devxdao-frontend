import React from "react";

export default function FormSelect({
  required,
  value,
  placeholder,
  onChange,
  options,
  name,
  underlined,
}) {
  const className = underlined
    ? "custom-form-control underlined"
    : "custom-form-control";
  const onChangeHandler = onChange || (() => {});
  const selectOptions = [];
  if (options && options.length) {
    options.forEach((item, index) => {
      selectOptions.push(
        <option value={item} key={name + "_" + index}>
          {item}
        </option>
      );
    });
  }

  return (
    <select
      className={className}
      onChange={onChangeHandler}
      required={required || false}
      value={value || ""}
    >
      <option value="">{placeholder}</option>
      {selectOptions}
    </select>
  );
}
