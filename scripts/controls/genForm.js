'use strict';

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(
    [UCCELLO_CONFIG.uccelloPath+'components/form'],
    function (Form) {

        const GenForm = class GenForm extends Form {
            get className() { return "GenForm"; }
            get classGuid() { return UCCELLO_CONFIG.classGuids.GenForm; }
            get metaFields() {
                return [
                    {fname:"IsCentered", ftype:"boolean"}
                ];
            }

            constructor(cm, params) {
                super(cm, params);
            }

            isCentered(value) {
                return this._genericSetter("IsCentered", value);
            }

        }
        return GenForm;
    });

