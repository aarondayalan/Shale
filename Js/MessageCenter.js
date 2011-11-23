/// <reference path="/js/jquery-1.5.2.js" />
/// <reference path="/js/jquery-ui-1.7.2.custom.min.js" />
/// <reference path="/js/jquery.validate.js" />
/// <reference path="/js/jquery.tmpl.js" />
/// <reference path="/js/knockout-1.3pre.js" />
/// <reference path="/js/knockout.mapping-1.2.js" />
/// <reference path="/js/tiny_mce/tiny_mce_src.js" />
/// <reference path="Upload/jquery.fileupload.js" />
/// <reference path="jquery.tokeninput.js" />

(function ($) {
    //alert(parseInt($.browser.version, 10));
    if ($.browser.msie && parseInt($.browser.version, 10) < 9) {
        Array.prototype.indexOf = function (obj) {
            for (var i = 0; i < this.length; i++) {
                if (this[i] == obj) {
                    return i;
                }
            }
            return -1;
        };
    }


    ko.bindingHandlers.highlightedText = {
        update: function (element, valueAccessor) {
            var options = valueAccessor();
            var value = ko.utils.unwrapObservable(options.text);
            var search = ko.utils.unwrapObservable(options.highlight);
            var css = ko.utils.unwrapObservable(options.css);

            if (!search) {
                element.innerHTML = value;
                return;
            }

            if (options.sanitize) {
                value = $('<div/>').text(value).html(); //could do this or something similar to escape HTML before replacement, if there is a risk of HTML injection in this value
            }


            /*var regex = new RegExp(search, 'i');

            var result = value.match(regex);*/
            var result = getMatches(value, search);
            if (result) {
                var replacements = getUniques(result);

                for (var i = 0; i < replacements.length; i++) {
                    value = value.replace(replacements[i], getHighlightedText(replacements[i], css));
                }
            }

            element.innerHTML = value;
        }
    };

    function getMatches(text, search) {
        var result = [];
        var indexOf = 0;
        var textLowered = text.toLowerCase();
        var searchLowered = search.toLowerCase();
        var searchLength = searchLowered.length;
        do {
            indexOf = textLowered.indexOf(searchLowered, indexOf);
            if (indexOf >= 0) {
                result.push(text.substring(indexOf, indexOf + searchLength));
            }

            if (indexOf >= 0) {
                indexOf++;
            }
        }
        while (indexOf >= 0);

        if (result.length > 0) {
            return result;
        }

        return undefined;
    }


    function getUniques(arr) {
        var a = [], l = arr.length;
        for (var i = 0; i < l; i++) {
            for (var j = i + 1; j < l; j++)
                if (arr[i] === arr[j]) j = ++i;
            a.push(arr[i]);
        }
        return a;
    };

    function getHighlightedText(text, css) {
        return '<span class="' + css + '">' + text + '</span>';
    }


    ko.bindingHandlers.droppy = {
        init: function (element, valueAccessor, allBindingsAccessor, context) {
            setTimeout(function () {
                $(element).droppy();
            }, 1);

        },
        update: function (element, valueAccessor, allBindingsAccessor, context) {

        }
    };

    ko.bindingHandlers.tokeninput = {
        init: function (element, valueAccessor, allBindingsAccessor, context) {
            var modelValue = valueAccessor();
            setTimeout(function () {
                $(element).tokenInput("/MessageCenter/GetRecipientsByRole", {
                    theme: "facebook",
                    resultsFormatter: function (item) { return "<li style='text-align: left'>" + "<img src='https://si0.twimg.com/sticky/default_profile_images/default_profile_2_normal.png' title='" + item.name + "' height='25px' width='25px' />" + "<div style='display: inline-block; padding-left: 10px;'><div class='full_name'>" + item.name + "</div><div class='email'>" + item.roles + "</div></div></li>" }
                });

            }, 1);

        },
        update: function (element, valueAccessor, allBindingsAccessor, context) {

        }
    };


    ko.bindingHandlers.jqUpload = {
        init: function (element, valueAccessor, allBindingsAccessor, context) {
            var modelValue = valueAccessor();


            //handle destroying an editor (based on what jQuery plugin does)
            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                $(element).fileupload('destroy');
            });

            setTimeout(function () {
                $(element).fileupload({
                    url: '/File/Post',
                    sequentialUploads: true,
                    maxFileSize: 5242880,
                    autoUpload: true
                });

                $(element).bind('fileuploaddone', function (e, data) {
                    for (var i = 0; i < data.result.length; i++) {
                        if (data.result[i].length) {
                            for (var x = 0; x < data.result.length; x++) {
                                if (data.result[i][x].asset) {
                                    modelValue().push(data.result[i][x].asset);
                                }
                            }
                        }

                        if (data.result[i].asset) {
                            modelValue().push(data.result[i].asset);
                        }
                    }
                });

            }, 1);

        },
        update: function (element, valueAccessor, allBindingsAccessor, context) {

        }
    };

    ko.bindingHandlers.tinymce = {
        init: function (element, valueAccessor, allBindingsAccessor, context) {
            var options = {
                mode: "exact",
                theme: 'advanced',
                plugins: 'safari,spellchecker,inlinepopups,searchreplace,paste,directionality,fullscreen,xhtmlxtras,wordcount,insertfromlist',
                width: '95%',
                theme_advanced_buttons1: 'bold,italic,underline,separator,forecolor,separator,cut,copy,pastetext,pasteword,separator,bullist,numlist,separator,link,unlink,separator,fullscreen',
                theme_advanced_buttons2: "",
                theme_advanced_buttons3: "",
                theme_advanced_toolbar_location: 'top',
                theme_advanced_toolbar_align: 'left',
                theme_advanced_statusbar_location: 'bottom',
                theme_advanced_path: false,
                theme_advanced_resizing: true,
                insertfromlist_text: "{BAQualificationDate},{CurrentAppPeriod},{DistrictName},{FirstName},{GradeLevel},{LastName},{Participant},{Participants},{ProgramCity},{ProgramEmail},{ProgramFax},{ProgramName},{ProgramPhone},{ProgramState},{ProgramWebsite},{SiteTag},{SubjectArea}",
                spellchecker_languages: "+English=en",
                spellchecker_rpc_url: "/TinyMCE.ashx?module=SpellChecker",
                add_form_submit_trigger: false,
                add_unload_trigger: false,
                submit_patch: false,
                convert_urls: false,
                init_instance_callback: function (inst) {
                    try {
                        tinymce.execCommand('mceFocus', false, element.id);
                    }
                    finally { }
                }
            };


            var modelValue = valueAccessor();

            //handle destroying an editor (based on what jQuery plugin does)
            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                $(element).parent().find("span.mceEditor,div.mceEditor").each(function (i, node) {
                    var ed = tinyMCE.get(node.id.replace(/_parent$/, ""));
                    if (ed) {
                        ed.remove();
                    }
                });
            });

            setTimeout(function () {
                $(element).tinymce(options);
                modelValue(element.id);
            });

        },
        update: function (element, valueAccessor, allBindingsAccessor, context) {
        }
    };

    var replyMessage = function (conv, viewModel) {
        this.To = ko.observable([]);
        this.Subject = ko.observable(conv.Subject());
        this.Body = ko.observable();
        this.Saving = ko.observable(false);
        this.ConversationId = ko.utils.unwrapObservable(conv.ConversationId);
        this.ActionItem = ko.observable(false);
        this.Resource = ko.observable(false);
        this.ShowAttributes = ko.observable(conv.IsAdmin());
        this.Attachments = ko.observable([]);
        this.TinyMCE = ko.observable();
        this.ErrorMessage = ko.observable("");

        this.Cancel = function () {
            conv.ReplyMessage(undefined);
        };

        this.Submit = function () {
            var reply = ko.utils.unwrapObservable(this);
            reply.Saving(true);
            var tinyMCEEditor = tinyMCE.get(reply.TinyMCE());

            if (tinyMCEEditor) {
                reply.Body(tinyMCEEditor.getContent());
            }
            else {
                reply.Body($("#" + reply.TinyMCE()).val());
            }

            if (!reply.Body()) {
                reply.ErrorMessage("Message body is required.");
                reply.Saving(false);
                return;
            }
            else {
                reply.ErrorMessage("");
            }

            $.post("/MessageCenter/Conv/Reply", { message: ko.mapping.toJSON(reply), accountId: viewModel.AccountId }, function (data) {

                data = ko.mapping.fromJS($.parseJSON(data));
                setupConvo(data, viewModel);
                var conversation = ko.utils.arrayFirst(viewModel.Conversations(), function (item) {
                    return ko.utils.unwrapObservable(item.ConversationId) === reply.ConversationId;
                });

                var indx = viewModel.Conversations().indexOf(conversation);

                reply.Saving(false);

                var convo = viewModel.Conversations();

                if (indx >= 0) {
                    convo.splice(indx, 1);
                }
                convo.splice(0, 0, data);
                viewModel.Conversations(convo);
                data.SelectConversation();
            });
        };

    }

    function updateUnreadMessageCount() {
        var messageCountStr = $("#unreadMessageCount:first").text();
        var messageCount = parseInt(messageCountStr);
        if (messageCount > 0) {
            messageCount = messageCount - 1;
        }
        if (messageCount > 0) {
            $("#unreadMessageCount:first").text(messageCount.toString());
        }
        else {
            $("#unreadMessageCount:first").fadeOut();
        }
    }


    function setupConvo(conv, viewModel) {
        conv.ReplyMessage = ko.observable();

        conv.SelectConversation = function () {
            var selectedConvo = this;
            viewModel.SelectedConversation(this);

            if (selectedConvo.IsImpersonatingUser()) {
                return;
            }

            var firstUnreadMessage = ko.utils.arrayFirst(this.Messages(), function (msg) {
                if (msg.Read() == false) {
                    return true;
                }
                return false;
            });
            if (firstUnreadMessage) {
                setTimeout(function () {
                    $.post("/MessageCenter/Conv/MarkAsRead", { accountId: viewModel.AccountId, conversationId: ko.utils.unwrapObservable(selectedConvo.ConversationId), messageId: selectedConvo.Messages()[0].MessageId() }, function (data) {
                        selectedConvo.Read(true);
                        ko.utils.arrayForEach(selectedConvo.Messages(), function (msg) {
                            msg.Read(true);
                        });
                        updateUnreadMessageCount();
                    });
                }, 0);
            }
        }

        conv.DeselectConversation = function () {
            viewModel.SelectedConversation(undefined);
        }
        conv.ShowReply = ko.dependentObservable(function () {
            if (this.ReplyMessage()) {
                return true;
            }
            else {
                return false;
            }
        }, conv);

        conv.Reply = function () {
            this.ReplyMessage(new replyMessage(conv, viewModel));
        }

        for (var i = 0; i < conv.Messages().length; i++) {
            var message = conv.Messages()[i];
            var last = (i + 1) == conv.Messages().length;
            message.Collapsed = ko.observable(!last);

            message.ToggleCollapsed = function () {
                this.Collapsed(!this.Collapsed());
            };

            message.MessageCenterViewModel = viewModel;

            if (message.Attachments && message.Attachments() && message.Attachments().length > 0) {
                for (var attachI = 0; attachI < message.Attachments().length; attachI++) {
                    message.Attachments()[attachI].MessageCenterViewModel = viewModel;
                }
            }
        }
    }

    function strip(html) {
        var tmp = document.createElement("DIV");
        tmp.innerHTML = html.replace("&nbsp;", " ");
        return tmp.textContent || tmp.innerText;
    }

    $.fn.messageCenter = function (id) {

        var element = this;

        $.get("/MessageCenter/Get/" + id, function (data) {
            data = $.parseJSON(data);

            var viewModel = ko.mapping.fromJS(data);
            viewModel.AccountId = id;
            viewModel.PageSize = ko.observable(30);
            viewModel.CurrentPage = ko.observable(0);
            viewModel.SelectedConversation = ko.observable();
            viewModel.FilterActionItem = ko.observable(false);
            viewModel.FilterAttachment = ko.observable(false);
            viewModel.FilterResource = ko.observable(false);
            viewModel.Query = ko.observable();

            ko.utils.arrayForEach(viewModel.Conversations(), function (conv) {
                setupConvo(conv, viewModel);
            });



            viewModel.FilteredConversations = ko.dependentObservable(function () {

                var convos = this.Conversations();

                if (this.Query()) {
                    var search = this.Query().toLowerCase();
                    var convos = ko.utils.arrayFilter(this.Conversations(), function (convo) {
                        var matchingConvoMessages = ko.utils.arrayFirst(convo.Messages(), function (msg) {
                            if (msg.Subject().toLowerCase().indexOf(search) >= 0) {
                                return true;
                            }

                            if (msg.From().toLowerCase().indexOf(search) >= 0) {
                                return true;
                            }

                            if (msg.Recipient().toLowerCase().indexOf(search) >= 0) {
                                return true;
                            }

                            /*if ($("<div />").html(msg.Body()).text().indexOf(search) >= 0) {
                            return true;
                            }*/

                            if (strip(msg.Body().toLowerCase()).indexOf(search) > 0) {
                                return true;
                            }

                            if (msg.Attachments() && msg.Attachments().length > 0) {
                                for (var attachnum = 0; attachnum < msg.Attachments().length; attachnum++) {
                                    if (msg.Attachments()[attachnum].DisplayText().toLowerCase().indexOf(search) >= 0) {
                                        return true;
                                    }
                                }
                            }

                        });

                        if (matchingConvoMessages) {
                            return true;
                        }

                        return false;
                    });


                }


                var filterActionItem = this.FilterActionItem();
                var filterAttachment = this.FilterAttachment();
                var filterResource = this.FilterResource();
                if (filterActionItem || filterAttachment || filterResource) {
                    return ko.utils.arrayFilter(convos, function (convo) {

                        if (filterAttachment === true && convo.HasAttachments() == true) {
                            return true;
                        }


                        if (filterActionItem === true || filterResource == true) {
                            var tags = convo.Tags();
                            if (tags) {
                                for (var i = 0; i < tags.length; i++) {
                                    var tag = tags[i].Tag();
                                    if (filterActionItem && tag === "actionitem") {
                                        return true;
                                    }
                                    if (filterResource && tag === "resource") {
                                        return true;
                                    }
                                }
                            }
                            result = true;
                        }
                        return false;
                    });
                }
                else {
                    return convos;
                }
            }, viewModel);

            viewModel.PageCount = ko.dependentObservable(function () {
                return Math.ceil(this.FilteredConversations().length / this.PageSize());
            }, viewModel);

            viewModel.StartIndex = ko.dependentObservable(function () {
                return this.CurrentPage() * this.PageSize();
            }, viewModel);

            viewModel.StartIndexUi = ko.dependentObservable(function () {
                if (this.FilteredConversations().length === 0) {
                    return 0;
                }

                return this.StartIndex() + 1;
            }, viewModel);

            viewModel.NextButtonVisible = ko.dependentObservable(function () {
                if (this.FilteredConversations().length === 0) {
                    return false;
                }

                if ((this.CurrentPage() + 1) < this.PageCount()) {
                    return true;
                }

                return false;
            }, viewModel);


            viewModel.DisplayedConversations = ko.dependentObservable(function () {
                if ((this.CurrentPage() + 1) > this.PageCount()) {
                    this.CurrentPage(0);
                }

                var pageCount = this.PageCount();
                var startIndex = this.StartIndex();
                var endIndex = startIndex + this.PageSize();
                var counter = 0;

                return ko.utils.arrayFilter(this.FilteredConversations(), function (convo) {
                    var result = false;
                    if (counter >= startIndex && counter < endIndex) {
                        result = true;
                    }
                    counter++;
                    return result;
                });
            }, viewModel);

            viewModel.NextPage = function () {
                viewModel.CurrentPage(viewModel.CurrentPage() + 1);
            }

            viewModel.PreviousPage = function () {
                viewModel.CurrentPage(viewModel.CurrentPage() - 1);
            }

            element.html('');
            ko.applyBindings(viewModel, element.get(0));
        });


    };



})(jQuery);


function GetMessageModal() {
    return $find("ctl00_ComposeMessageWindowManager");
}

function openComposeMessageModal(sender) {
    var oManager = GetMessageModal();

    var oWnd = null;
    oWnd = oManager.getWindowByName("ComposeMessageModal");

    oWnd.show();
    oWnd.setUrl($(sender).attr("url"));

    oWnd.add_close(closeComposeMessageModal);

    currentWindow = oWnd;
    modalActive = true;
}

function closeComposeMessageModal() {
    // does nothing right now, but maybe there a need for post closing actions
}
