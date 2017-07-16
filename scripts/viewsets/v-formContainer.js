/**
 * Created by levan.kiknadze on 06/05/2017.
 */

define(
    ['text!./templates/formContainer.html', '/scripts/viewsets/v-base.js'],
    function(tpl, VBaseView) {
        const vFormContainer = class vFormContainer extends VBaseView {
            static getTemplate() {
                return tpl
            }

            createItem(component) {
                var pItem = $(this._templates['container']).attr('data-id', "mid_" + component.getLid());
                var item = pItem.children(".control").attr('id', component.getLid());

                var c = item.children(".c-content");
                var scrollPos = null;
                var scrollRemembered = false;

                component._onGenetixInitResize = (function (c, component) {
                    return function () {
                        if (!scrollRemembered) {
                            scrollPos = c.scrollTop();
                            c.css("overflow", "none");
                        }
                    }
                })(c, component);

                $(window).on("genetix:initResize", component._onGenetixInitResize);

                this._bindScrollingHeader(component);

                return pItem;
            }

            initItem(pItem, component) {
                var item = $("#" + component.getLid())

                if (component.verticalAlign()) {
                    pItem.css("display", "table-cell");
                    var vAl = component.verticalAlign().toUpperCase();
                    if (vAl == "TOP")
                        pItem.css("vertical-align", "top");
                    else if (vAl == "BOTTOM")
                        pItem.css("vertical-align", "bottom");
                    else
                        pItem.css("vertical-align", "middle");
                }
                else {
                    pItem.css("display", "");
                    pItem.css("vertical-align", "");
                }

                var cont = item.children(".c-content");

                if ("isCentered" in component.getParentComp() && component.getParentComp().isCentered())
                    cont.css({"border-radius" : "0.25em"});

                if (component.getParentComp() && !component.getParentComp().getParentComp()) {
                    if (!(component.getParentComp().isCentered) ||
                        component.getParentComp().isCentered() === undefined ||
                        !component.getParentComp().isCentered())
                        cont.css("padding", "0");
                    item.addClass("m-container")
                }

                if (component.height() == "auto")
                    item.css({height: "auto"});

                if (component.resource()) {
                    var child = component.resource().getForm();
                    var divId = 'ch_' + child.getLid();
                    var div = $("#" + divId);
                    if (div.length == 0) {
                        item.empty();
                        var div = $('<div class="control-wrapper"></div>').attr('id', divId);
                        div.css("height", "100%");
                        item.append(div);
                    }
                } else {
                    item.empty();
                }

                this._setVisible(component);
                this._genEventsForParent(component);
            }

            static getFormDivId(component) {
                var divId = null;
                if (component.resource()) {
                    var child = component.resource().getForm();
                    divId = '#ch_' + child.getLid();
                }

                return divId;
            }

            _bindScrollingHeader(component) {
                var item = $('#' + component.getLid());
                var cont = item.children(".c-content");

                var t, l = (new Date()).getTime();
                item.children(".scroll-header").hide();

                cont.scroll(function(){
                    var now = (new Date()).getTime();

                    if(now - l > 400){
                        $(this).trigger('scrollStart');
                        l = now;
                    }

                    clearTimeout(t);
                    t = setTimeout(function(){
                        console.log("setTimeout vcontainer 1");
                        cont.trigger('scrollEnd');
                    }, 300);
                });

                cont.bind('scrollStart', function(){
                    console.log('scrollStart');
                    item.children(".scroll-header").show();
                    return false;
                });

                cont.bind('scrollEnd', function(){
                    console.log('scrollEnd');
                    item.children(".scroll-header").hide();
                    return false;
                });
            }

            _refreshScroll(component) {
            }

            /**
             * Оповещение парента об изменениях пропертей
             * @private
             */
            _genEventsForParent(component) {
                var genEvent = false;
                var changedFields = {};
                if (component.isFldModified("Width")) { changedFields.Width = true; genEvent = true; }
                if (component.isFldModified("Height")) { changedFields.Height = true; genEvent = true; }
                if (component.isFldModified("HorizontalAlign")) { changedFields.HorizontalAlign = true; genEvent = true; }
                if (component.isFldModified("VerticalAlign")) { changedFields.VerticalAlign = true; genEvent = true; }
                if (component.isFldModified("MinWidth")) { changedFields.MinWidth = true; genEvent = true; }
                if (component.isFldModified("MinHeight")) { changedFields.MinHeight = true; genEvent = true; }
                if (component.isFldModified("MaxWidth")) { changedFields.MaxWidth = true; genEvent = true; }
                if (component.isFldModified("MaxHeight")) { changedFields.MaxHeight = true; genEvent = true; }
                if (component.isFldModified("PadLeft")) { changedFields.PadLeft = true; genEvent = true; }
                if (component.isFldModified("PadRight")) { changedFields.PadRight = true; genEvent = true; }
                if (component.isFldModified("PadTop")) { changedFields.PadTop = true; genEvent = true; }
                if (component.isFldModified("PadBottom")) { changedFields.PadBottom = true; genEvent = true; }
                if (component.isFldModified("Visible")) { changedFields.Visible = true; genEvent = true; }

                if (genEvent) {
                    $('#ext_' + component.getLid()).trigger("genetix:childPropChanged", {
                        control: component,
                        properties: changedFields
                    });
                }
            }
        }

        return vFormContainer;
    }
);
