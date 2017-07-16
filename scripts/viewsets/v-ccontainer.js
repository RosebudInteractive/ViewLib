define(
    ['text!./templates/button.html', '/scripts/viewsets/v-container.js'],
    function(tpl, VContainer) {
        const vCContainer = class vCContainer extends VContainer {

        }

        return vCContainer;
    }
);