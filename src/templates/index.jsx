import React from "react";
import {addComponent} from "../component";
import Header from "./header";
import Footer from "./footer";
import If from "./if";
import Lang from "./lang";
import Link from "./link";
import Logo from "./logo";
import Alert from "./alert";
import Button from "../input/button";
import InputField from "../input/field";
import TextInput from "../input/text";
import CheckInput from "../input/checkbox";
import CheckListInput from "../input/checklist";
import Textarea from "../input/textarea";
import SelectInput from "../input/select";
import UploadInput from "../input/upload";
import ImageMedia from "../media/image";
import ScreenAlert from "../screen/alert";
import Menu from "../menu";
import MenuItem from "../menu/menu-item";
import SubMenu from "../menu/submenu";

addComponent(<Header/>);
addComponent(<Footer/>);
addComponent(<If/>);
addComponent(<Lang/>);
addComponent(<Link/>);
addComponent(<Logo/>);
addComponent(<Button/>);
addComponent(<InputField/>);
addComponent(<TextInput/>);
addComponent(<CheckInput/>);
addComponent(<CheckListInput/>);
addComponent(<Textarea/>);
addComponent(<SelectInput/>);
addComponent(<UploadInput/>);
addComponent(<ImageMedia/>);
addComponent(<ScreenAlert/>);
addComponent(<Menu/>);
addComponent(<MenuItem/>);
addComponent(<SubMenu/>);
addComponent(<Alert/>);