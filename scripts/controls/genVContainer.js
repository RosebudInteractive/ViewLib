'use strict';

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(
    [UCCELLO_CONFIG.uccelloPath+'components/vContainer'],
    function (VContainer) {

        const GenVContainer = class GenVContainer extends VContainer {
            get className() { return "GenVContainer"; }
            get classGuid() { return UCCELLO_CONFIG.classGuids.GenVContainer; }
            get metaFields() {
                return [
                    {fname:"Background", ftype:"string"},
                    {fname:"HasPadding", ftype:"boolean"},
                    {fname:"SeparateChildren", ftype:"boolean"}
                ];
            }

            constructor(cm, params) {
                super(cm, params);
            }

            background(value) {
                return this._genericSetter("Background", value);
            }

            hasPadding(value) {
                return this._genericSetter("HasPadding", value);
            }

            separateChildren(value) {
                return this._genericSetter("SeparateChildren", value);
            }
        }
        return GenVContainer;
    });

