import React from "react";
import Checkbox from "../check-box/Checkbox";

export default function UnvotedFilter({ votes, show_unvoted, onChange }) {
  return (
    <div className="ml-5 d-flex align-items-center">
      <label className="mr-5">{`${votes} votes to do`}</label>
      <Checkbox
        value={show_unvoted}
        onChange={onChange}
        text={`Show only unvoted`}
      />
    </div>
  );
}
