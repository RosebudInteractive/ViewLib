/**
 * Created by levankiknadze on 25/01/2017.
 */

define(
    ['text!./templates/dataEdit.html', '/scripts/viewsets/v-edit.js'],
    function(tpl, VEdit) {
        const vDataEdit = class vDataEdit extends VEdit {
            static getTemplate() {
                return tpl
            }

            createItem(component) {
            }

            initItem(pItem, component) {
            }

        }

        return vDataEdit;
    }
);
