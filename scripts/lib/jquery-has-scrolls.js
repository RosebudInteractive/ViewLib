/**
 * User: kiknadze
 * Date: 31.07.2015
 * Time: 20:18
 */
(function($) {
    $.fn.hasScrollBar = function() {
        var hasScrollBar = {}, e = this.get(0);
        hasScrollBar.vertical = (e.scrollHeight > e.clientHeight ? true : false);
        hasScrollBar.horizontal = (e.scrollWidth > e.clientWidth ? true : false);
        return hasScrollBar;
    }
})(jQuery);