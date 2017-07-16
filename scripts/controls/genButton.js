'use strict';

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(
    [UCCELLO_CONFIG.uccelloPath+'components/button'],
    function (Button) {

        const GenButton = class GenButton extends Button {
            get className() { return "GenButton"; }
            get classGuid() { return UCCELLO_CONFIG.classGuids.GenButton; }
            get metaFields() {
                return [
                    {fname:"Background",ftype:"string"},
                    {fname:"Color",ftype:"string"},
                    {fname:"BorderColor",ftype:"string"},
                    {fname:"ExtendedClass",ftype:"string"},
                    {fname:"ContentAlign",ftype:"string"}
                ];
            }

            constructor(cm, params) {
                super(cm, params);
            }

            background(value) {
                return this._genericSetter("Background", value);
            }

            Ccolor(value) {
                return this._genericSetter("Color", value);
            }

            borderColor(value) {
                return this._genericSetter("BorderColor", value);
            }

            extendedClass(value) {
                return this._genericSetter("ExtendedClass", value);
            }

            contentAlign(value) {
                return this._genericSetter("ContentAlign", value);
            }

        }
        return GenButton;
    });

