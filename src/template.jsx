import React from "react";
import _ from "./utils";
import Config, {isValidUrl, getTemplate} from "./gql-state/config";
import {i18n} from "./lang";
import Screen from "./screen";

let pos = 0;

export default class Template extends React.Component {
    constructor(props) {
        super(props);

        const defaultState = {hasError: false};

        this.state = _.extend(defaultState, props.defaultState || {});
        this.mounted = false;
        this.formats = {};

        // Bind inheritable methods
        this.updateState = this.updateState.bind(this);
        this.countUpdate = this.countUpdate.bind(this);
    }

    uniqId() {
        pos++;

        return 'tpl_' + pos;
    }

    uniqCallback(callback, name) {
        let func = function() {
            return callback.apply(null, arguments);
        };

        Object.defineProperty(func, 'name', {value: name + '_callback'});

        return func;
    }

    updateState(state, callback) {
        let _callback;

        if (_.isFunction(callback)) {
            _callback = () => {callback.call(null, this.state, this)};
        }

        if (!this.mounted) {
            this.state = _.extend(this.state, state);

            if (_callback) {
                _callback();
            }

            return;
        }

        this.setState(state, _callback);
    }

    countUpdate() {
        let count = this.state.count || 1;
        count = parseInt(count) + 1;

        this.updateState({count});
    }

    componentDidCatch(error, errorInfo) {
        if (!error) {
            return;
        }

        this.updateState({hasError: true});
    }

    componentDidMount() {
        this.mounted = true;

        // Call init if exist
        if (this.init) {
            this.init();
        }

        // Call subscriber if exist
        if (this.subscribe) {
            this.subscribe();
        }
    }

    componentDidUpdate() {
        this.mounted = true;

        if (!this.subscribe) {
            return;
        }

        this.subscribe();
    }

    componentWillUnmount() {
        this.mounted = false;

        if (!this.unsubscribe) {
            return;
        }

        this.unsubscribe();
    }

    hasError() {
        return !!this.state.hasError;
    }

    getDataValue(key, dataList) {
        let keyName = key.replace("@data-", ""),
            value = dataList[keyName]||"";

        if ("null" === value || "undefined" === value) {
            value = "";
        }

        return value;
    }

    __getProps(childProps, dataList) {
        const props = {};

        for(const key of _.keys(childProps)) {
            // Skip children
            if ("children" === key) {
                continue;
            }

            let value = childProps[key];

            // Exclude functions and arrays
            if (_.isFunction(value) || _.isArray(value)) {
                props[key] = value;
                continue;
            }

            if (_.isObject(value)) {
                const obj = {};

                for(let objKey of _.keys(value)) {
                    let objValue = value[objKey];

                    // Check key
                    if (objKey.match(/@data-/)) {
                        objKey = this.getDataValue(objKey, dataList);
                    }

                    if (objValue && objValue.match(/@data-/)) {
                        objValue = this.getDataValue(objValue, dataList);
                    }

                    obj[objKey] = objValue;
                }

                props[key] = obj;

                continue;
            }

            props[key] = value;

            // Check if there's data set a property key
            if (key.match(/@data-/)) {
                const keyValue = this.getDataValue(key, dataList);

                if (keyValue && _.isObject(keyValue)) {
                    _.extend(props, keyValue);
                }

                // Remove attribute key
                delete props[key];
            }

            if (_.isUndefined(value)) {
                continue;
            }

            if (_.isNull(value) || !value.match) {
                props[key] = value;
                continue;
            }

            // Check for translation
            if (value.match(/@lang/)) {
                const lang = value.replace("@lang(", "").replace(")", "");
                value = i18n(lang);
                
                props[key] = value;
                continue;
            }

            // Check for event handler
            if (value.match(/^@event-/)) {
                const evName = value.replace("@event-", "");

                if (dataList[evName]) {
                    props[key] = dataList[evName];
                }

                continue;
            }

            if (!value.match(/@data-/g)) {
                continue;
            }

            if (value.match(/^@data-/)) {
                props[key] = this.getDataValue(value, dataList);

                continue;
            }

            value = value.replace(/@data-.?[^ ]*/gi, x => {
                const val = this.getDataValue(x, dataList);

                if (!val) {
                    return "";
                }

                return val;
            });

            props[key] = value;
        }

        return props;
    }

    iterateChildren(children, dataList) {
        return React.Children.map(children, child => {
            if (!React.isValidElement(child)) {
                return null;
            }

            const props = this.__getProps(child.props, dataList);

            if (!child.key) {
                props.key = this.uniqId();
            }

            if (child.ref && _.isString(child.ref)) {
                props.ref = ref => {this[child.ref] = ref};
            }

            if (_.isFunction(child.type)) {
                props.dataList = dataList;

                // Check for overrides
                const _child = React.cloneElement(child, props),
                    dataCallback = dataList[child.type.name];

                if (dataCallback && _.isFunction(dataCallback)) {
                    return dataCallback.call(null, _child, dataList);
                }

                const callback = this[`get${child.type.name}`];
                if (callback) {
                    return callback.call(this, _child, dataList);
                }

                return React.cloneElement(child, props);
            }

            if (dataList[child.type] && _.isFunction(dataList[child.type])) {
                const dataCallback2 = dataList[child.type];

                return dataCallback2.call(null, React.cloneElement(child, props), dataList);
            }

            if (this[`get${child.type}`]) {
                const callback2 = this[`get${child.type}`];

                return callback2.call(this, React.cloneElement(child, props), dataList);
            }

            if (child.props.children) {
                props.children = this.iterateChildren(child.props.children, dataList);
            }

            // Make <a> clickable
            if ("a" === child.type && isValidUrl(props.href) && !_.isFunction(props.onClick)) {
                props.onClick = ev => this.loadScreen(ev, props.href);
            }

            if (_.isString(child.type)) {
                return React.createElement(child.type, props);
            }

            return React.cloneElement(child, props);
        });
    }

    loadScreen(ev, url) {
        if (ev && ev.preventDefault) {
            ev.preventDefault();
        }

        Screen.load(url);
    }

    getData(child, dataList) {
        const {name} = child.props;

        return dataList[name]||null;
    }

    getDataList() {
        return this.props.dataList??this.state;
    }

    render() {
        if (this.hasError()) {
            return null;
        }

        const dataList = this.getDataList(),
            template = this.__getTemplate(this.props.templateId);

        return this.iterateChildren(template, dataList);
    }

    /**
     @private
    **/
    __getTemplate(templateId) {
        if (this.props.children) {
            return this.props.children;
        }

        const client = Config.getClient(),
            clientTemplate = `/${client}${templateId}`;

        return getTemplate(clientTemplate, templateId);
    }
}

export function templateId() {
    pos++;

    return "tpl_" + pos;
}

export function Render(props) {
    return (<Template {...props}/>);
}