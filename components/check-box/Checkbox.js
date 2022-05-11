import React, { useEffect, useState } from "react";
import * as Icon from "react-feather";
import classNames from "classnames";

export default function Checkbox({
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

  return (
    <div className={classNames("c-form-check d-flex", className)}>
      <span onClick={() => toggleCheck()}>
        {val ? (
          <Icon.CheckSquare color="#9B64E6" />
        ) : (
          <Icon.Square color="#9B64E6" />
        )}
      </span>
      <label className="pl-3" onClick={() => toggleCheck()}>
        {text}
      </label>
    </div>
  );
}
