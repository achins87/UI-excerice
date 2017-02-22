$.fn.dropdown = function(options) {

    var settings = {
        dropdowns : {},
    }

    var plugin = {
        create : function(select) {

            if(!select.siblings(".dropdown").length) {
                var dropdownString = "\
                    <div class='dropdown'>\
                        <input type='text' class='dropdown__placeholder'>\
                        <div class='menu'>\
                        </div>\
                    </div>";


                select.parent(".input").append(dropdownString);
            }
            var dropdown = select.siblings("div.dropdown");

            if(select.attr("placeholder") != undefined) {
                dropdown.find(".dropdown__placeholder").val(select.attr("placeholder"));
            }

            if(select.hasClass("searchable")) {

                if(!dropdown.find(".dropdown__search").length) {
                    dropdown.prepend("<input type='hidden' class='dropdown__search'>");
                }
            } else {
                dropdown.find(".dropdown__placeholder").attr("readonly", "readonly");
            }

            plugin.renderOptions(dropdown);
            plugin.bindDropdown(dropdown);
        },
        renderOptions : function(dropdown) {
            var dropdownOptions = "";
            var select = dropdown.siblings("select");

            select.find("option:not(:disabled)").each(function(){
                dropdownOptions += "<div class='menu__item' data-value='"+$(this).val()+"'>"+$(this).text()+"</div>";
            });

            dropdown.find(".menu").html(dropdownOptions);
            var selectedOption = select.val();
            plugin.selectItem(dropdown, dropdown.find(".menu__item[data-value='"+selectedOption+"']")) 
            plugin.bindOptions(dropdown);
        },
        bindOptions : function(dropdown) {
            dropdown.find(".menu__item").off("click").on("click", function(){
                plugin.selectItem(dropdown, $(this));
            });
        },
        bindDropdown : function(dropdown) {

            select = dropdown.siblings("select");
            dropdown.attr("class", select.attr("class"));

            $(document).off("click.dropdown").on("click.dropdown", function(e){

                /* select all dropdowns if clicked outside all dropdowns or */
                var openDropdowns = settings.dropdowns.not($(e.target));

                /* select all dropdowns except the one which is clicked*/
                if(!$(e.target).is(".menu") && !$(e.target).parents(".menu").length && !$(e.target).parents(".menu").parents(".dropdown").length) {
                    openDropdowns = openDropdowns.not($(e.target).parents(".dropdown"));
                }   

                $(openDropdowns).each(function(){
                    plugin.close($(this));
                });

            });

            $(document).off("keydown.dropdown").on("keydown.dropdown", function(e){

                e = (e) ? e : document.event;
                var key_pressed = (e.which) ? e.which : e.keyCode;

                if(key_pressed == 40 || key_pressed == 38) {
                    $(".dropdown__placeholder:focus").parents(".dropdown").addClass("dropdown--active");
                }

                var dropdown = $(".dropdown--active");

                if(dropdown.length) {

                    if(key_pressed == 40) {
                        plugin.selectNextItem(dropdown);
                    } else if(key_pressed == 38) {
                        plugin.selectPreviousItem(dropdown);
                    } else if(key_pressed == 13) {
                        var activeItem = dropdown.find(".menu__item--selected");
                        if(!activeItem.length) {
                            activeItem = dropdown.find(".menu__item--active");
                        }
                        plugin.selectItem(dropdown, activeItem);
                        dropdown.find(".dropdown__placeholder").trigger("blur");
                        $(document).trigger("click");
                    }
                }

            });

            select.off("DOMSubtreeModified").on("DOMSubtreeModified",function(){
                plugin.renderOptions($(this).siblings(".dropdown"));
            });

            dropdown.find(".dropdown__placeholder").off("blur").on("blur", function(){
                var currentDropdown = $(this).parents(".dropdown");
                setTimeout(function(){
                    plugin.close(currentDropdown);
                }, 200);
            });

            dropdown.find(".dropdown__placeholder").off("focus").on("focus", function(){
                var currentDropdown = $(this).parents(".dropdown");
                setTimeout(function(){
                    plugin.open(currentDropdown);
                }, 200);
            });

            dropdown.find("input:text.dropdown__placeholder").off("keyup").on("keyup", function(){
                plugin.setSearchQuery(dropdown, $(this).val());
            });

            settings.dropdowns = $("div.dropdown");
        },
        open : function(dropdown) {

            dropdown.addClass("dropdown--active");

            if(dropdown.hasClass("searchable")) {
    
                var searchField = dropdown.find(".dropdown__search")
                if(searchField.val() != "") {
                    dropdown.find(".dropdown__placeholder").val(searchField.val());
                } else {
                    plugin.clearPlaceholder(dropdown);
                }

            }
        },
        close : function(dropdown) {
            dropdown.removeClass("dropdown--active");

            var title = dropdown.find(".dropdown__placeholder");
            plugin.setPlaceholder(dropdown);
        },
        clearPlaceholder : function(dropdown) {
            var title = dropdown.find(".dropdown__placeholder");
            title.val("");
        },
        setPlaceholder : function(dropdown) {
            var selectedText = dropdown.siblings("select").find("option:selected").text();
            var title = dropdown.find(".dropdown__placeholder");

            if(!title.is(":focus")) {
                if(selectedText != "") {
                    title.val(selectedText);
                } else {
                    title.val(dropdown.siblings("select").attr("placeholder"));
                }
            }
        },
        selectItem : function(dropdown, item) {
            var select = dropdown.siblings("select");

            select.val(item.data("value"));
            dropdown.find(".menu__item").removeClass("menu__item--active").removeClass("menu__item--selected");
            item.addClass("menu__item--selected");
            plugin.setPlaceholder(dropdown);

            if(dropdown.hasClass("searchable") && !dropdown.find(".dropdown__placeholder").is(":focus")) {
                plugin.setSearchQuery(dropdown, "");
            }
            select.trigger("change");
        },
        highlightItem : function(dropdown, item) {
            var select = dropdown.siblings("select");

            select.val(item.data("value"));
            dropdown.find(".menu__item").removeClass("menu__item--active").removeClass("menu__item--selected");
            item.addClass("menu__item--active");
            plugin.setPlaceholder(dropdown);
        },
        selectNextItem : function(dropdown) {

            var selectedItem = dropdown.find(".menu__item--active");

            if(!selectedItem.length) {
                selectedItem = dropdown.find(".menu__item--selected");
            }

            if(selectedItem.length) {
    
                if(selectedItem.index() != (dropdown.find(".menu__item").length - 1)) {
                    plugin.highlightItem(dropdown, selectedItem.next());
                }
            } else {
                plugin.highlightItem(dropdown, dropdown.find(".menu__item:first-child"));
            }
        },
        selectPreviousItem : function(dropdown) {

            var selectedItem = dropdown.find(".menu__item--active");

            if(!selectedItem.length) {
                selectedItem = dropdown.find(".menu__item--selected");
            }

            if(selectedItem.length) {
                if(selectedItem.index() != 0) {
                    plugin.highlightItem(dropdown, selectedItem.prev());
                }
            } else {
                plugin.highlightItem(dropdown, dropdown.find(".menu__item:last-child"));
            }
        },
        setSearchQuery : function (dropdown, query) {
            var select = dropdown.siblings("select");

            if(select.find("option:selected").text() == query) {
                query = "";
            }

            dropdown.find(".dropdown__search").val(query);
            plugin.search(dropdown);
        },
        search : function(dropdown) {
            var select = dropdown.siblings("select");

            select.find("option").prop("disabled", false);

            var query = dropdown.find(".dropdown__search").val();
            if(query != "") {
                query = query.toLowerCase();

                select.find("option").each(function(){
                    var optionText = $(this).text().toLowerCase();

                    if(optionText.indexOf(query) != 0) {
                        $(this).prop("disabled", true);
                    }
                });
            }
        }
    }

    $(this).each(function(){
        plugin.create($(this));
    })
}

var data = [
    {
        team: 'Engineering',
        employees: [
            'Lawana Fan',
            'Larry Rainer',
            'Rahul Malik',
            'Leah Shumway'
        ]
    },
    {
        team: 'Executive',
        employees: [
            'Rohan Gupta',
            'Ronda Dean',
            'Robby Maharaj'
        ]
    },
    {
        team: 'Finance',
        employees: [
            'Caleb Brown',
            'Carol Smithson',
            'Carl Sorensen'
        ]
    },
    {
        team: 'Sales',
        employees: [
            'Ankit Jain',
            'Anjali Maulingkar'
        ]
    }
];

$.fn.validate = function(options){

    var form = $(this);

    var failedRules = 0;

    var plugin = {
        throwErrorMessage : function(fieldInput, message){
            var fieldInputContainer = fieldInput.parents(".input");

            if(!fieldInputContainer.find(".message--error").length) {
                fieldInputContainer.append("<div class='message message--error'></div>");
            }

            fieldInputContainer.addClass("input--error");
            fieldInputContainer.find(".message--error")
                .addClass("message--active")
                .text(message);
        },
        hideErrorMessage : function(fieldInput) {
            var fieldInputContainer = fieldInput.parents(".input");

            fieldInputContainer.removeClass("input--error");
            fieldInputContainer.find(".message--error").removeClass("message--active");
        },
        rules : {
            required : function(value){
                return (value == "" || value == null);
            }
        }
    };

    $.each(options.fields, function(name, field){

        var fieldInput = form.find("[name='"+name+"']");

        $.each(field.rules, function(ruleName, rule){
            var ruleFailed = plugin.rules[ruleName](fieldInput.val());
            failedRules += ruleFailed;

            if(ruleFailed) {
                plugin.throwErrorMessage(fieldInput, rule.message);
            } else {
                plugin.hideErrorMessage(fieldInput);
            }

            return false;
        });

    });
    return !failedRules;
};

var app = {
    employee : {
        wantsEmail : false,
        name : '',
        team : '',
    },
    setTeamsDropdown : function() {
        var options = "<option value=''>Select Team..</option>";

        $.each(data, function(key, teamData){
            options += "<option value='"+key+"'>"+teamData.team+"</option>";
        });

        $("#team").html(options);
    },

    setEmployeesDropdown : function(team) {
        var options = "<option value=''>Select Employee..</option>";

        if(data.hasOwnProperty(team)) {

            $.each(data[team].employees, function(key, employeeName){
                options += "<option value='"+key+"'>"+employeeName+"</option>";
            });

            $("#employee").html(options);
        } else {
            $("#employee").html("");
        }
    },

    setNewEmployee : function(form){
        app.employee.wantsEmail = form.find("[name='sendEmail']").prop("checked");
        app.employee.name = form.find("[name='employee'] option:selected").text();
        app.employee.team = form.find("[name='team'] option:selected").text();
    },
    welcomeNewEmployee : function(form) {
        $(".welcome").addClass("hidden");
        $(".recognition").removeClass("hidden");
        $(".recognition").find(".employee").text(app.employee.name);
        $(".recognition").find(".team").text(app.employee.team);
        var emailText = app.employee.wantsEmail ? "We will send you an email shortly" : "Looks like you dont want an email";
        $(".recognition").find(".sendEmail").text(emailText);
        $(".dialog").removeClass("dialog--active");
    },
    setFormDefaults : function(form){
        var inputfields = ["input:text", "input:checkbox", "input:radio", "select"];

        $.each(inputfields, function(key, inputField) {

            var inputs = form.find($(inputField));

            $(inputs).each(function(){
                if($(this).is(":checkbox") || $(this).is(":radio")) {
                    $(this).data("defaultValue", $(this).prop("checked"));
                } else {
                    $(this).data("defaultValue", $(this).val());
                }
            })
        });
    },
    resetForm : function(form) {
        var inputfields = ["input:text", "input:checkbox", "input:radio", "select"];

        $.each(inputfields, function(key, inputField) {

            var inputs = form.find($(inputField));

            $(inputs).each(function(){
                if($(this).is(":checkbox") || $(this).is(":radio")) {
                    $(this).prop("checked", false);
                    $(this).data("defaultValue", $(this).prop("checked"));
                } else {
                    $(this).val("");
                    $(this).data("defaultValue", $(this).val());
                }
            })
        });
    },
    checkIfFormHasChanges : function(form){
        var inputfields = ["input:text", "input:checkbox", "input:radio", "select"];

        var changes = 0;

        $.each(inputfields, function(key, inputField) {

            var inputs = form.find($(inputField));

            $(inputs).each(function(){
                if($(this).is(":checkbox") || $(this).is(":radio")) {
                    changes += ($(this).data("defaultValue") != $(this).prop("checked"));
                } else {
                    changes += ($(this).data("defaultValue") != $(this).val());
                }
            })
        });

        return changes;
    }
};

$(document).ready(function(){

    $(".dialogLink").off("click").on("click", function(){
        $(".dialog").addClass("dialog--active");
    });

    $(".closeDialogButton").off("click").on("click", function(){
        var formHasChanges = app.checkIfFormHasChanges($("#employeeForm"));

        if(formHasChanges && confirm("You have unsaved changes. Do you still want to continue?")) {
            app.resetForm($("#employeeForm"));
            $(this).parents(".dialog").removeClass("dialog--active");
        } else if(!formHasChanges) {
            $(this).parents(".dialog").removeClass("dialog--active");
        }
    });

    $("select.dropdown").dropdown();

    app.setTeamsDropdown();

    $("#team").off("change").on("change", function(){
        app.setEmployeesDropdown($(this).val());
    });

    app.setFormDefaults($("#employeeForm"));

    $("#employeeForm").off("submit").on("submit", function(e){

        var formIsValid = $(this).validate({
            fields : {
                team : {
                    rules : {
                        required : {
                            message : "Please select a team"
                        }
                    }
                },
                employee : {
                    rules : {
                        required : {
                            message : "Please select an employee"
                        }
                    }
                }
            }
        });

        if(formIsValid) {
            app.setNewEmployee($(this));
            app.welcomeNewEmployee($(this));
        }
        e.preventDefault();
    })
});