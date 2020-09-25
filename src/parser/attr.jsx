import _ from "../utils";

export default function parseAttr(attr) {
    let keys = {
        class: 'className',
        colspan: 'colSpan',
        rowspan: 'rowSpan',
        autofocus: 'autoFocus',
        autoplay: 'autoPlay',
        crossorigin: 'crossOrigin',
        srcset: 'srcSet',
        tabindex: 'tabIndex',
        usemap: 'useMap',
        maxlength: 'maxLength',
        minlength: 'minLength',
        accesskey: 'accessKey',
        autocomplete: 'autoComplete',
        for: 'htmlFor',
        readonly: 'readOnly',
        cellpadding: 'cellPadding',
        cellspacing: 'cellSpacing',
        enctype: 'encType',
        inputmode: 'inputMode',
        value: 'defaultValue'
    };

    for(const key of _.keys(attr)) {
        let value = attr[key];

        if ("style" === key) {
            value = parseStyle(value);
        }

        // Transform boolean into literal
        if (_.indexOf(["true", "false"], value) >= 0) {
            value = "true" === value;
        }

        attr[key] = value;

        if (keys[key]) {
            attr[keys[key]] = value;
            delete attr[key];
        }
    }

    return attr;
}

function parseStyle(styleStr) {
    let str = styleStr.replace(/[{}]/g, ""),
        style = {};

    for(let key of str.split(",")) {
        key = key.split(":");

        style[key[0].trim()] = key[1].trim();
    }

    return style;
}