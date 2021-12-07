import { combineReducers } from "redux";
import global from "./global";
import admin from "./admin";
import user from "./user";
import modal from "./modal";
import table from "./table";

export default combineReducers({ global, admin, user, modal, table });
