define(
    ['text!./templates/dataGrid.html', '/scripts/viewsets/v-base.js'],
    function(tpl, ViewBase) {
        const vDataGrid = class vDataGrid extends ViewBase {
            static getTemplate() {
                return tpl
            }

            get table() {
                return this._table;
            }

            set table(value) {
                this._table = value;
            }

            get grid() {
                return this._grid;
            }

            set grid(value) {
                this._grid = value;
            }

            get dataset() {
                return this._dataset
            }

            set dataset(value) {
                this._dataset = value;
            }

        }

        return vDataGrid;
    }
);