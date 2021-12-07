import React from "react";
import { Link } from "react-router-dom";

import "./back-button.scss";

export default function BackButton({ link, onClick }) {
  const onClickHandler = onClick || (() => {});

  if (link) {
    return (
      <Link to={link} className={"back-btn"} onClick={onClickHandler}>
        <img src="/back.png" alt="" />
      </Link>
    );
  }

  return (
    <a className={"back-btn"} onClick={onClickHandler}>
      <img src="/back.png" alt="" />
    </a>
  );
}
