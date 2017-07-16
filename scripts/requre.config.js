/**
 * User: kiknadze
 * Date: 23.02.2015
 * Time: 15:02
 */
requirejs.config({
    baseUrl: 'scripts',
    nodeRequire: require,
    paths: {
        "text"              : '/scripts/uccello/uses/text',
        "lodash"            : '/scripts/uccello/uses/lodash.min',
        "wGrid"             : '/scripts/widgets/wGrid',
        "gPopup"            : '/scripts/widgets/popup',
        "flex-container"    : '/scripts/widgets/flex-container',
        "flex-min-dimension": '/scripts/widgets/flex-min-dimension',
        "devices"           : '/scripts/widgets/devices'/*,
        deviceHelper: '/scripts/deviceHelper'*/
    }
});
