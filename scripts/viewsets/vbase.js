/**
 * User: kiknadze
 * Date: 07.09.2015
 * Time: 17:02
 */
define(
    function () {
        var vBase = {};

        vBase._setVisible = function() {
            var lid = this.getLid();
            var pItem = $("#ext_" + lid);

            var viz = (this.visible() !== undefined ? this.visible() : true);
            if (viz)
                pItem.css("display", "");
            else
                pItem.css("display", "none");
        };

        return vBase;
    }
);