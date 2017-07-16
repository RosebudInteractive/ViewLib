define(
    ['/scripts/uccello/uses/template.js'],
    function(template) {

        const ViewSet = class ViewSet {
            get templates() {
                return this._templates;
            }

            set templates(value) {
                this._templates = value
            }

            static getTemplate() {
                throw new Error('Abstract error! Implametation in subclass');
            }

            static get instance() {
                if (!this._instance) {
                    this._instance = new this(this.getTemplate())
                }

                return this._instance;
            }

            constructor(tpl){
                this.templates = template.parseTemplate(tpl)
            }

            static render(component, options) {
                var lid = component.getLid();
                var isMain = component.getParentComp() == null && options.rootContainer == "#v-toolbar";
                var isSubMain = component.getParentComp() == null && options.rootContainer == "#testDiv";
                var par = null;
                if (isMain) par = $(options.rootContainer);
                else if (isSubMain) par = $("#root-form-container");
                else par = $("#ch_" + lid);
                var item = par.find('[data-id="mid_' + lid + '"]');

                var str = "Render test for '" + component.getClassName() + "' (" + lid + "). ";
                var start = new Date();
                if (item.length == 0) {
                    item = this.instance.createItem(component, options);
                    item.attr("data-debug", component.resElemName())

                    var parent = null;
                    if (component.getParentComp())
                        parent = '#ch_' + lid
                    else if (options.rootContainer == "#testDiv")
                        parent = "#root-form-container";
                    else
                        parent = options.rootContainer;
                    $(parent).append(item);
                }

                this.instance.initItem(item, component, options);
            }

            createItem(component) {
                // Empty. Implametation in subclass
            }

            initItem(item, component) {
                // Empty. Implametation in subclass
            }

            destroyUI(item, component) {

            }

            static disableRender(component) {
                var item = $('[data-id="mid_' + component.getLid() + '"]');
                this.instance.destroyUI(item, component);
            }

        };

        return ViewSet;
    }
);
