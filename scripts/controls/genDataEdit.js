'use strict';

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(
    [UCCELLO_CONFIG.uccelloPath+'components/data-edit'],
    function (DataEdit) {

        const GenDataEdit = class GenDataEdit extends DataEdit {
            get className() { return "GenDataEdit"; }
            get classGuid() { return UCCELLO_CONFIG.classGuids.GenDataEdit; }
            get metaFields() {
                return [
                    {fname:"Title", ftype:"string"}
                ];
            }

            constructor(cm, params) {
                super(cm, params);
            }

            title(value) {
                return this._genericSetter("Title", value);
            }

        }
        return GenDataEdit;
    });

