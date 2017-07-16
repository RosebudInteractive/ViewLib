define(
    ['text!./templates/button.html', '/scripts/viewsets/v-container.js'],
    function(tpl, VContainer) {
        const vVContainer = class vVContainer extends VContainer {

        }

        return vVContainer;
    }
);