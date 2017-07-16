'use strict';

requirejs.config({
    baseUrl: 'scripts',
    nodeRequire: require,
    paths: {
        "text"       : '/scripts/uccello/uses/text',
        "underscore" : '/scripts/uccello/uses/underscore'//,
        //"dataset"    : '/scripts/uccello/components/dataset',
        //"adata-model": '/scripts/uccello/components/adata-model',
        //"designer-control": '/scripts/uccello/components/designer-control',
        //"data-field": '/scripts/uccello/components/data-field',
        //"acomponent": '/scripts/uccello/components/acomponent',
        //"dataset-base": '/scripts/uccello/components/dataset-base',
        //"event": '/scripts/uccello/system/event',
        //"acomponent": '/scripts/uccello/components/acomponent',
        //"acomponent": '/scripts/uccello/components/acomponent',
        //"acomponent": '/scripts/uccello/components/acomponent'
    }
});


var UCCELLO_CONFIG = null, uccelloClt = null, $u=null, DEBUG = false;

var roortDiv = "#v-toolbar"
var $authorEdit = null;
var $themeEdit  = null;

// когда документ загружен
$(document).ready( function() {
    require(['./uccello/config/config', './uccello/system/utils'],
        function(Config, Utils){
        var config = {
            controls: [
                // Типы данных WFE, должны подгружаться динамически по запросу (пока отсюда не удаляем, но они здесь уже не нужны !!!)
                //
                //{ className: 'TaskRequestParameter', component: '../processTypes/taskRequestParameter' },
                //{ className: 'WfeParameter', component: '../processTypes/parameter' },
                //{ className: 'ProcessVar', component: '../processTypes/processVar' },
                //{ className: 'TaskParameter', component: '../processTypes/taskParameter' },
                //{ className: 'TaskStage', component: '../processTypes/taskStage' },
                //
                //{ className: 'MemAddressTest', component: '../memTreeTest/memAddressTest' },
                //{ className: 'MemContractTest', component: '../memTreeTest/memContractTest' },
                //{ className: 'MemContactTest', component: '../memTreeTest/memContactTest' },
                //{ className: 'MemCompanyTest', component: '../memTreeTest/memCompanyTest' },
                //{ className: 'MatrixGrid', component: 'matrixGrid', viewset: true, guid: '827a5cb3-e934-e28c-ec11-689be18dae97' },
                //{ className: 'PropEditor', component: 'propEditor', viewset: true, guid: 'a0e02c45-1600-6258-b17a-30a56301d7f1' },
                { className: 'GenLabel', component: 'genLabel', viewset: true, guid: '151c0d05-4236-4732-b0bd-ddcf69a35e25' },
                { className: 'GenDataGrid', component: 'genDataGrid', viewset: true, guid: '55d59ec4-77ac-4296-85e1-def78aa93d55' },
                { className: 'GenButton', component: 'genButton', viewset: true, guid: 'bf0b0b35-4025-48ff-962a-1761aa7b3a7b' },
                { className: 'GenDataEdit', component: 'genDataEdit', viewset: true, guid: '567cadd5-7f9d-4cd8-a24d-7993f065f5f9' },
                { className: 'Container', viewset: true },
                //{ className: 'CContainer', viewset: true },
                { className: 'HContainer', viewset: true },
                { className: 'VContainer', viewset: true },
                { className: 'GenVContainer', component: 'genVContainer', viewset: true, guid: 'b75474ef-26d0-4298-9dad-4133edaa8a9c' },
                //{ className: 'GContainer', viewset: true },
                { className: 'FContainer', viewset: true },
                //{ className: 'TabContainer', viewset: true },
                { className: 'Form', viewset: true },
                { className: 'GenForm', component: 'genForm', viewset: true, guid: '29bc7a01-2065-4664-b1ad-7cc86f92c177' },
                { className: 'Button', viewset: true },
                { className: 'DataGrid', viewset: true },
                { className: 'DataEdit', viewset: true },
                //{ className: 'DataCombo', viewset: true },
                { className: 'LookupCombo', viewset: true },
                //{ className: 'DataCheckbox', viewset: true },
                { className: 'Edit', viewset: true },
                { className: 'Label', viewset: true },
                { className: 'Toolbar', viewset: true },
                { className: 'ToolbarButton', viewset: true },
                { className: 'ToolbarSeparator', viewset: true },
                { className: 'AdaptiveContainer', viewset: true },
                { className: 'LayersContainer', viewset: true },
                { className: 'FormDesigner', viewset: true },
                //{ className: 'TreeView', viewset: true },
                //{ className: 'DbTreeView', viewset: true },
                { className: 'FormContainer', viewset: true },
                { className: 'UserSessionInfo', viewset : true }
            ],

            classGuids: {
                "TaskRequestParameter": "31809e1f-a2c2-4dbb-b653-51e8bdf950a2",
                "WfeParameter": "9232bbd5-e2f8-466a-877f-5bc6576b5d02",
                "ProcessVar": "b8fd05dc-08de-479e-8557-dba372e2b4b6",
                "TaskParameter": "b3746562-946f-46f6-b74f-a50eaff7a771",
                "TaskStage": "c2f02b7a-1204-4dca-9ece-3400b4550c8d",
                "MemAddressTest": "14134cb5-7caa-44e2-84ac-9d4c208772f8",
                "MemContractTest": "dd0addee-bf0f-458e-a360-dbfa1682e6a2",
                "MemContactTest": "bcbd8862-7bdf-42c9-a4cb-634f8a6019a5",
                "MemCompanyTest": "1821b56b-7446-4428-93b5-c121c265e4bc",
                "RootTstCompany": "c4d626bf-1639-2d27-16df-da3ec0ee364e",
                "DataTstCompany": "34c6f03d-f6ba-2203-b32b-c7d54cd0185a",
                "RootTstContact": "de984440-10bd-f1fd-2d50-9af312e1cd4f",
                "DataTstContact": "27ce7537-7295-1a45-472c-a422e63035c7",
                "RootContract": "4f7d9441-8fcc-ba71-2a1d-39c1a284fc9b",
                "DataContract": "08a0fad1-d788-3604-9a16-3544a6f97721",
                "RootAddress": "07e64ce0-4a6c-978e-077d-8f6810bf9386",
                "DataAddress": "16ec0891-1144-4577-f437-f98699464948",
                "RootLeadLog": "bedf1851-cd51-657e-48a0-10ac45e31e20",
                "DataLeadLog": "c4fa07b5-03f7-4041-6305-fbd301e7408a",
                "RootIncomeplan": "194fbf71-2f84-b763-eb9c-177bf9ac565d",
                "DataIncomeplan": "56cc264c-5489-d367-1783-2673fde2edaf",
                "RootOpportunity": "3fe7cd6f-b146-8898-7215-e89a2d8ea702",
                "DataOpportunity": "5b64caea-45b0-4973-1496-f0a9a44742b7",
                "RootCompany": "0c2f3ec8-ad4a-c311-a6fa-511609647747",
                "DataCompany": "59583572-20fa-1f58-8d3f-5114af0f2c51",
                "RootContact": "ad17cab2-f41a-36ef-37da-aac967bbe356",
                "DataContact": "73596fd8-6901-2f90-12d7-d1ba12bae8f4",
                "DataLead": "86c611ee-ed58-10be-66f0-dfbb60ab8907",
                "RootLead": "31c99003-c0fc-fbe6-55eb-72479c255556",
                "GenVContainer": "b75474ef-26d0-4298-9dad-4133edaa8a9c",
                "GenDataGrid": "55d59ec4-77ac-4296-85e1-def78aa93d55",
                "GenDataEdit": "567cadd5-7f9d-4cd8-a24d-7993f065f5f9",
                "GenButton": "bf0b0b35-4025-48ff-962a-1761aa7b3a7b",
                "GenForm": "29bc7a01-2065-4664-b1ad-7cc86f92c177",
                "GenLabel": "151c0d05-4236-4732-b0bd-ddcf69a35e25"
            },
            webServer: {
                port: 1326
            },

            controlsPath: 'controls/',
            uccelloPath: 'uccello/',
            viewSetPath : 'viewsets/',
            webSocketServer: { port: webSocketServerPort ? webSocketServerPort : null }
        };
        UCCELLO_CONFIG = new Config(config);

        require(
            [
                './uccello/uccello-clt',
                './uccello/connection/comm-client',
                '/scripts/custom/main-custom-requirements.js'
            ],
            function (UccelloClt, CommunicationClient, Req) {
                window._resForms = new Map();

                setTimeout(function(){
                    var commClient = new CommunicationClient.Client(UCCELLO_CONFIG.webSocketClient);
                    uccelloClt = new UccelloClt({
                        commClient: commClient,
                        onConnect : doOnConnect,
                        onInitClient : doOnInitClient
                    });

                    for (var i = 0; i < Req.length; i++) {
                        Req[i].UccelloClt = uccelloClt;
                    }
                }, url('#timeout') ? url('#timeout') : 10);

                window.hideMainForm = function () {
                    $(roortDiv).children("[role=main-form]").hide()
                }

                window.hideLoginForm = function () {
                    $("#login-form").remove();
                    $(roortDiv).children("[role=main-form]").show();
                }

                window.showLogin = function() {
                    require(["text!templates/login.html"], function (loginTemplate) {
                        window.hideMainForm();
                        $(roortDiv).append($(loginTemplate));
                        $(".login-enter-btn").click(function () {
                            window.login($("#login-edit").val(), $("#password-edit").val());
                        }).mousedown(function () {
                            $(this).css({"background-color": "#38465a"})
                        }).mouseup(function () {
                            $(this).css({"background-color": ""})
                        }).hover(function (event) {
                            $(this).css({"background-color": "#38465a"});
                        }, function () {
                            $(this).css({"background-color": ""});
                        });

                        $("#login-edit").focus().keypress((e) => {
                            if (e.which == 13) {
                                $(".login-enter-btn").click();
                            }
                        });

                        $("#password-edit").keypress((e) => {
                            if (e.which == 13) {
                                $(".login-enter-btn").click();
                            }
                        });
                    });
                };


                /**
                 * Логин
                 * @param userName
                 * @param password
                 */
                window.login = function(userName, password){
                    uccelloClt.authenticate(userName, password).
                    then(function(result) {
                        if (result) {
                            window.hideLoginForm();
                        } else {
                            $(".is-login-form .login-l").addClass("has-errors");
                        }
                    })
                };

                window.doOnConnect = function(result) {
                    result ? hideLoginForm() : showLogin();
                };

                window.doOnInitClient = function(){
                    return {
                        sid : $.cookie('sid') ? $.cookie('sid') : null,
                        onClearDiv : _clearContentDiv
                    }

                };

                window.addServerContext = function() {
                    _clearContentDiv();
                };

                var _clearContentDiv = function () {
                    $("#root-form-container").empty();
                };

                window.addEventListener("beforeunload", (event) => {
                    if (typeof event == "undefined") {
                        event = window.event;
                    }
                    if (event) {
                        uccelloClt.disconnect();
                    }
                });

                window.addEventListener("unload", (event) => {
                    uccelloClt.cleanup();
                });

            });
    });
});