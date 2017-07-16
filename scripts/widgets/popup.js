/**
 * User: kiknadze
 * Date: 03.03.2015
 * Time: 11:00
 */

define(
    'gPopup',
    ['/scripts/uccello/uses/template.js', 'text!./widgets/templates/popup.html'],
    function(template, tpl) {
        var templates = template.parseTemplate(tpl);

        $.widget( "custom.genetixPopup", {
            options: {
                title: null,
                leftIcons: false,
                rightIcons: true,
                bigArrowInterval: true,
                buttonControl: null,
                offsetX: 0,
                offsetY: 0,
                leftViewBoxSize: 38,
                extendedClass: "",
                menuItems: []
            },

            _create: function() {
                this._clearContent();
                this._renderTitle();
                this._MouseInside = false;

                if (this.options.bigArrowInterval)
                    this.element.addClass("big-interval");
                if (this.options.leftIcons)
                    this.element.addClass("has-left-icons");
                if (this.options.rightIcons)
                    this.element.addClass("has-right-icons");
                if (this.options.extendedClass != "")
                    this.element.addClass(this.options.extendedClass);


                var that = this;

                this.element.mouseleave(function () {
                    that._MouseInside = false;
                    setTimeout(function () {
                        console.log("setTimeout popup 1");
                        if (!that._MouseInside)
                            that.hide();
                    }, 500);
                }).mouseenter(function () {
                    that._MouseInside = true;
                });
            },

            _clearContent: function() {
                this.element.addClass("dropdown2-b is-disableselect");
                this.element.removeAttr('style');
                this.element.css({"display": "none"});
                this.element.empty();
                this.element.append($(templates["arrow"]));
            },

            _renderTitle: function() {
                if(!this.options.title) {
                    this.element.remove(".dropdown-menu-item2-b.is-title");
                    return;
                }

                var titleEl = this.element.children(".dropdown-menu-item2-b.is-title");
                if (titleEl.length == 0 && this.options.title) {
                    titleEl = $(templates["title"]);
                    this.element.prepend(titleEl);
                }
                titleEl.find(".text-bl").text(this.options.title)
            },

            _renderContent: function() {
                var popupData = this.options.menuItems;
                var that = this;

                this.element.children(".dropdown-menu-item2-b").remove();
                for (i = 0; i < popupData.length; i++) {
                    var data = popupData[i];
                    var itemEl = $("#" + data.id);
                    if (itemEl.length == 0) {

                        var curTemplate = "";
                        if (data.type == "separator")
                            curTemplate = templates["separator"];
                        else {
                            curTemplate = templates["menuItem"];
                            curTemplate = curTemplate.replace("###RIGHT_ICON_REF###", data.rightIcon);
                            curTemplate = curTemplate.replace("###LEFT_ICON_REF###", data.leftIcon);
                        }
                        itemEl = $(curTemplate);
                        itemEl.attr("id", data.id);
                        this.element.append(itemEl);
                        if (data.type != "separator") {
                            itemEl.find(".left-icon svg").each(function () {
                                $(this)[0].setAttribute("viewBox", "0 0 " + that.options.leftViewBoxSize + " " + that.options.leftViewBoxSize);
                            });
                            itemEl.find(".left-icon").css({color: data.leftIconColor});
                        }
                    }
                    itemEl.find(".dropdown-menu-item-wrapper .text-bl").text(data.title);
                    itemEl.data("itemData", data);

                    itemEl.children(".dropdown-menu-item-wrapper").off("click").click(data, function (event) {
                        event.data.custom.buttonControl = that.options.buttonControl;
                        that._trigger("click", null, event.data);
                        that.hide();
                    });
                    itemEl.children(".dropdown-menu-item-wrapper").find(".right-icon").off("click").click(data, function (event) {
                        $(this).addClass("is-pressed");
                        that._trigger("righticonclick", null, {button: $(this), data: event.data});
                        return false;
                    });

                    var subContent = itemEl.children(".content-bl");
                    itemEl.children(".arrow-be-wrapper").click(subContent, function(event) {
                        var opened = $(this).parent().hasClass("is-open");
                        if (opened) {
                            event.data.hide();
                            $(this).parent().removeClass("is-open");
                        } else {
                            event.data.show();
                            $(this).parent().addClass("is-open");
                        }
                    });
                    subContent.show();
                    subContent.parent().addClass("is-open");

                    if (!(data.subTree) || data.subTree.length == 0) {
                        itemEl.children(".arrow-be-wrapper").hide();
                        itemEl.removeClass("is-header");
                        subContent.hide();
                        subContent.parent().removeClass("is-open");
                    }
                    else {
                        itemEl.children(".arrow-be-wrapper").show();
                        itemEl.addClass("is-header");

                        for (var j = 0; j < data.subTree.length; j++) {
                            var subItemData = data.subTree[j];
                            var subItemEl = $("#" + subItemData.id);
                            if (subItemEl.length == 0) {
                                var curTemplate2 = templates["menuItem"];
                                curTemplate2 = curTemplate2.replace("###RIGHT_ICON_REF###", subItemData.rightIcon);
                                subItemEl = $(curTemplate2);
                                subItemEl.attr("id", subItemData.id);
                                subContent.append(subItemEl);
                                subItemEl.children(".dropdown-menu-item-wrapper").click(subItemData, function (event) {
                                    that._trigger("click", null, event.data);
                                    that.hide();
                                });
                                subItemEl.children(".dropdown-menu-item-wrapper").find(".right-icon").click(subItemData, function (event) {
                                    $(this).addClass("is-pressed");
                                    that._trigger("righticonclick", null, {button: $(this), data: event.data});
                                    return false;
                                });

                            }
                            subItemEl.find(".dropdown-menu-item-wrapper .text-bl").text(subItemData.title);
                            subItemEl.data("itemData", subItemData);
                            var subContent2 = subItemEl.children(".content-bl");
                            subContent2.hide();
                            subItemEl.children(".arrow-be-wrapper").hide();
                            subItemEl.removeClass("is-header");
                        }
                    }
                }
            },


            show: function(popupData, buttonControl, firstItem) {
                // Если не передано, то пытаемся использовать старые данные
                // иначе запоминаем новые и используем их
                if (popupData)
                    this.options.menuItems = popupData;
                if (buttonControl)
                    this.options.buttonControl = buttonControl;

                var hasLeftIcons = this.options.leftIcons;
                if (hasLeftIcons) {
                    // проверим передана ли хотябы одна
                    var found = false;
                    for (var i = 0; i < this.options.menuItems.length; i++) {
                        if (this.options.menuItems[i].leftIcon) {
                            found = true;
                            break;
                        }
                    }
                    hasLeftIcons &= found;
                }


                if (this.options.bigArrowInterval)
                    this.element.addClass("big-interval");
                else
                    this.element.removeClass("big-interval");
                if (hasLeftIcons)
                    this.element.addClass("has-left-icons");
                else
                    this.element.removeClass("has-left-icons");
                if (this.options.rightIcons)
                    this.element.addClass("has-right-icons");
                else
                    this.element.removeClass("has-right-icons");

                this._renderContent();

                // уберем все стили, относящиеся к позиции выпирающего уголка
                this.element.removeClass("is-right is-top is-left is-bottom-right is-bottom-left is-top-right is-top-left");

                this.element.children(".dropdown-menu-item2-b").find(".right-icon").removeClass("is-pressed");
                var cRight = 0;
                var cBott = 0;
                var parentIsBody = this.element.parent().is('body');
                if (parentIsBody) {
                    cRight = this.options.buttonControl.offset().left +  this.options.buttonControl.width();
                    cBott = this.options.buttonControl.offset().top +  this.options.buttonControl.innerHeight();
                } else {
                    cRight = this.options.buttonControl.offset().left + this.options.buttonControl.width();
                    cBott = this.options.buttonControl.offset().top +  this.options.buttonControl.innerHeight();
                }

                this.element.css({
                    right: $('body').innerWidth() - cRight + this.options.offsetX,
                    top: cBott + this.options.offsetY,
                    bottom: ""
                });

                if (this.options.bigArrowInterval)
                    this.element.addClass("big-interval");
                else
                    this.element.removeClass("big-interval");

                if (firstItem) {
                    $("#" + firstItem).prependTo(this.element);
                }

                var $w = $(window);
                var partial = false,
                    $t        = this.element,
                    t         = $t.get(0),
                    vpWidth   = $w.width(),
                    vpHeight  = $w.height(),
                    direction = 'vertical',
                    clientSize = true;//t.offsetWidth * t.offsetHeight;
                var viewTop         = $w.scrollTop(),
                    viewBottom      = viewTop + vpHeight,
                    viewLeft        = $w.scrollLeft(),
                    viewRight       = viewLeft + vpWidth,
                    offset          = this.options.buttonControl.offset(),
                    _top            = offset.top + this.options.buttonControl.outerHeight(),
                    _bottom         = _top + $t.outerHeight(),
                    _left           = offset.left,
                    _right          = _left + $t.width(),
                    compareTop      = partial === true ? _bottom : _top,
                    compareBottom   = partial === true ? _top : _bottom,
                    compareLeft     = partial === true ? _right : _left,
                    compareRight    = partial === true ? _left : _right;
                var vis = true;
                if(direction === 'both')
                    vis = !!clientSize && ((compareBottom <= viewBottom) && (compareTop >= viewTop)) && ((compareRight <= viewRight) && (compareLeft >= viewLeft));
                else if(direction === 'vertical')
                    vis =  !!clientSize && ((compareBottom <= viewBottom) && (compareTop >= viewTop));
                else if(direction === 'horizontal')
                    vis = !!clientSize && ((compareRight <= viewRight) && (compareLeft >= viewLeft));


                if (!vis) {
                    this.element.css({
                        top: "",
                        bottom: viewBottom - cBott + this.options.offsetY + this.options.buttonControl.height()
                    });
                    this.element.addClass("is-right is-bottom ");
                } else
                    this.element.addClass("is-right is-top ");

                if (this.options.menuItems.length != 0) {
                    this.element.find(".dropdown2-b").hide();
                    this.element.show("fast");
                }





                this._MouseInside = false;
                var that = this;
                setTimeout(function () {
                    console.log("setTimeout popup 2");
                    if (!that._MouseInside)
                        that.hide();
                }, 1000);

            },

            hide: function() {
                this.element.hide();
                this._trigger("hide", null, this);
            }

        });


    });