'use strict';

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(
    [UCCELLO_CONFIG.uccelloPath+'components/data-grid'],
    function (DataGrid) {

        const GenDataGrid = class GenDataGrid extends DataGrid {
            get className() { return "GenDataGrid"; }
            get classGuid() { return UCCELLO_CONFIG.classGuids.GenDataGrid; }
            get metaFields() {
                return [
                    {fname:"Alternate", ftype:"boolean"},
                    {fname:"HorizontalLines", ftype:"boolean"},
                    {fname:"VerticalLines", ftype:"boolean"},
                    {fname:"BigSize", ftype:"boolean"},
                    {fname:"WhiteHeader", ftype:"boolean"},
                    {fname:"HasFooter", ftype:"boolean"},
                    {fname:"Scroll", ftype:"boolean"},
                    {fname:"BodyBackground", ftype:"string"}
                ];
            }

            constructor(cm, params) {
                super(cm, params);
            }

            alternate(value) {
                return this._genericSetter("Alternate", value);
            }

            horizontalLines(value) {
                return this._genericSetter("HorizontalLines", value);
            }

            verticalLines(value) {
                return this._genericSetter("VerticalLines", value);
            }

            bigSize(value) {
                return this._genericSetter("BigSize", value);
            }

            whiteHeader(value) {
                return this._genericSetter("WhiteHeader", value);
            }

            hasFooter(value) {
                return this._genericSetter("HasFooter", value);
            }

            scroll(value) {
                return this._genericSetter("Scroll", value);
            }

            bodyBackground(value) {
                return this._genericSetter("BodyBackground", value);
            }
        }
        return GenDataGrid;
    });

