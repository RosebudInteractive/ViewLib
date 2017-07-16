/**
 * Created by levankiknadze on 25/01/2017.
 */

define(
    ['text!./templates/label.html', '/scripts/viewsets/v-base.js'],
    function(tpl, ViewBase) {
        const vLabel = class vLabel extends ViewBase {
            static getTemplate() {
                return tpl
            }

            createItem(component, options) {

            }

            initItem(pItem, component) {
            }
        }

        return vLabel
    }
);