import React, { useEffect, useState } from "react";
import * as Icon from "react-feather";
import classNames from "classnames";

export default function CheckboxX({
  className,
  value,
  text,
  onChange,
  readOnly,
}) {
  const [val, setVal] = useState();

  const toggleCheck = () => {
    if (!readOnly) {
      setVal(!val);
      if (onChange) onChange(!val);
    }
  };

  useEffect(() => {
    setVal(value);
  }, [value]);

  const renderCheck = () => {
    if (val === 1) {
      return <Icon.CheckSquare color="#9B64E6" />;
    } else if (val === 0) {
      return <Icon.X color="#e85558" />;
    } else {
      return <Icon.Square color="#9B64E6" />;
    }
  };

  return (
    <div
      className={classNames(
        className,
        "c-form-check d-flex align-items-center"
      )}
    >
      <span onClick={() => toggleCheck()}>{renderCheck()}</span>
      <label className="pl-3" onClick={() => toggleCheck()}>
        {text}
      </label>
    </div>
  );
}
