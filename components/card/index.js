/* eslint-disable react/display-name */
/* eslint-disable react/react-in-jsx-scope */
import * as Icon from "react-feather";
import { createContext, useState, useContext, useEffect } from "react";
import classNames from "classnames";
import "./style.scss";

export const CardContext = createContext({
  setIsExpand: () => {},
  isExpand: false,
});

export const Card = ({ extraAction, isAutoExpand, children, className }) => {
  const [isExpand, setStateIsExpand] = useState();
  useEffect(() => {
    if (isAutoExpand) {
      setIsExpand(isAutoExpand);
    }
  }, []);

  const setIsExpand = (value) => {
    setStateIsExpand(value);
    if (extraAction) extraAction();
  };

  return (
    <CardContext.Provider value={{ setIsExpand, isExpand }}>
      <div
        className={classNames("app-simple-section", className)}
        style={{ flexDirection: "column" }}
      >
        {children?.length === 2 && (
          <>
            {children[0]}
            {isExpand && children[1]}
          </>
        )}
        {children?.length === 3 && (
          <>
            {children[0]}
            {!isExpand && children[1]}
            {isExpand && children[2]}
          </>
        )}
      </div>
    </CardContext.Provider>
  );
};

Card.Header = ({ children }) => {
  const { setIsExpand, isExpand } = useContext(CardContext);
  return (
    <div className="px-0 d-flex flex-row justify-content-between app-simple-section__title">
      <div className="flex-fill">{children}</div>
      <div style={{ cursor: "pointer" }} onClick={() => setIsExpand(!isExpand)}>
        {!isExpand && (
          <div className="d-flex align-items-center">
            <p className="expand-title pr-2">Expand to show more detail</p>
            <button className="expand-btn btn btn-primary">
              <Icon.Plus size={16} />
            </button>
          </div>
        )}
        {!!isExpand && (
          <button className="expand-btn btn btn-primary">
            <Icon.Minus size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

Card.Body = ({ children }) => {
  return <div className="card-body-1">{children}</div>;
};

Card.Preview = ({ children }) => {
  return <div className="card-preview">{children}</div>;
};

export const CardHeader = Card.Header;
export const CardBody = Card.Body;
export const CardPreview = Card.Preview;
