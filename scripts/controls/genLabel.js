'use strict';

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(
    [UCCELLO_CONFIG.uccelloPath+'components/label'],
    function (Label) {

        const GenLabel = class GenLabel extends Label {
            get className() { return "GenLabel"; }
            get classGuid() { return UCCELLO_CONFIG.classGuids.GenLabel; }
            get metaFields() {
                return [
                    {fname:"FontSize",ftype:"string"},
                    {fname:"Color",ftype:"string"},
                    {fname:"FontFamily",ftype:"string"},
                    {fname:"FontWeight",ftype:"string"},
                    {fname:"AlignLeft",ftype:"boolean"}
                ];
            }

            constructor(cm, params) {
                super(cm, params);
            }

            fontSize(value) {
                return this._genericSetter("FontSize", value);
            }

            color(value) {
                return this._genericSetter("Color", value);
            }

            fontFamily(value) {
                return this._genericSetter("FontFamily", value);
            }

            fontWeight(value) {
                return this._genericSetter("FontWeight", value);
            }

            alignLeft(value) {
                return this._genericSetter("AlignLeft", value);
            }

        }
        return GenLabel;
    });

