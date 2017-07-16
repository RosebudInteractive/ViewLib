/**
 * Created by levankiknadze on 25/01/2017.
 */

define(
    ['/scripts/viewsets/viewset.js'],
    function (ViewSet) {
        const vBase = class vBase extends ViewSet {
            _setVisible(component) {
                var lid = component.getLid();
                var pItem = $("#ext_" + lid);

                var viz = (component.visible() !== undefined ? component.visible() : true);
                if (viz)
                    pItem.css("display", "");
                else
                    pItem.css("display", "none");
            }
        }

        return vBase;
    }
);