var log_form = $('#log-form');
var new_client_modal =  $('#new-client-modal');
var all_clients_modal = $('#all-clients-modal')
var modal_background =  $('#new-client-modal-background');
var client_details =  $('#client-details');
var save_new_client_button = $('#saveNewClientButton');
var saved_indicator = $('#saved-indicator');
var log_container = $('#log-container');
var client_name_search = $('#clientName');
var new_client_name_input = $('#newClientName');
var options_panel = $('#options-panel');
var clientDetailsBox = null;
var newClientObject ={};
var clientlist = [];
var allClientsListGenerated = false;
$(function() {
 if (localStorage.getItem('clientlist') == null){
    $.ajax({
    url:'php/fetch-clients.php',
    type: 'GET',
    dataType: 'json'}).done(function(data) {
        let clientNameList = [];
        $.each(data, function(key, value) {
            clientNameList.push(value.name);
            });
        awesomplete.list = clientNameList;
        console.log("went and got it");
        localStorage.setItem('clientlist', JSON.stringify(data));
        clientlist = data;
    })
 } else {
     let clientNameList = [];
     clientlist = JSON.parse(localStorage.getItem('clientlist'));
     $.each(clientlist, function(key, value) {
        clientNameList.push(value.name);
        });
        awesomplete.list = clientNameList;
        console.log("worked");
        }
});

function createHTML(jsonObject) {
  var dateTimeStamp = jsonObject.dateTimestamp //if it breaks i added 'var' here
  if (!document.getElementById(dateTimeStamp)){
    let dayTemplate = document.getElementById('day-template').innerHTML;
    let compiledTemplate = Handlebars.compile(dayTemplate);
    let ourGeneratedHTML = compiledTemplate(jsonObject);
    $(log_container).prepend(ourGeneratedHTML);
  }else{
    let logTemplate = document.getElementById('log-template').innerHTML;
    let compiledTemplate = Handlebars.compile(logTemplate);
    let ourGeneratedHTML = compiledTemplate(jsonObject);
    $('#' + dateTimeStamp).append(ourGeneratedHTML);
    }
};

function copyClientName() {
    $(new_client_name_input).val($(client_name_search).val());
};
function show(id, type, deffered) {
    let that = document.getElementById(id);
    that.classList.remove("is-hidden");
    switch (type) {
        case 'fromright':
        if (that.classList.contains('slideInRight')){
            that.classList.remove('slideInRight');
            that.classList.add('slideOutRight');
        }else{
            that.classList.add('slideInRight');
            that.classList.remove('slideOutRight');
        }
        break;
        case 'fromleft':
         if (that.classList.contains('slideInLeft')){
            that.classList.remove('slideInLeft');
            that.classList.add('slideOutLeft');
        }else{
            that.classList.add('slideInLeft');
            that.classList.remove('slideOutLeft');
        }
        break;
        case 'fromtop':
        // if (that.classList.contains('is-active')){
        //     that.classList.remove('is-active');
        // } else {
        //     that.classList.add('is-active');
        // }
        if (that.classList.contains('slideInDown')){
            that.classList.remove('slideInDown');
            that.classList.add('slideOutUp');
        }else{
        that.classList.add('slideInDown');
        that.classList.remove('slideOutUp');
        }
    }
};

function saveNewClient() {
    $(save_new_client_button).toggleClass('is-loading');
    newClientObject.newClientName =    $.trim($('#newClientName').val());
    newClientObject.newClientPhone   = $.trim($('#newClientPhone').val());
    newClientObject.newClientContact = $.trim($('#newClientContact').val());
    newClientObject.newClientAddress = $.trim($('#newClientAddress').val());
    $.post('save-client.php', {
        newName: newClientObject.newClientName,
        newPhone: newClientObject.newClientPhone,
        newContact: newClientObject.newClientContact,
        newAddress: newClientObject.newClientAddress
                            }, function(data){
        $('#saveNewClientButton').fadeOut('fast', function() {
        $(saved_indicator).fadeIn();
        delayToggleActive();
    }).toggleClass('is-loading');
        $(saved_indicator).fadeOut('fast', function() {
            $('#saveNewClientButton').fadeIn();
        });
    });
};

function generateClientList() {
    if (allClientsListGenerated == false){
        let all_clients_container = $('#all-clients-container');
        let clientTemplate = document.getElementById('client-template').innerHTML;
        let compiledTemplate = Handlebars.compile(clientTemplate);
        for (var objectNumber = 0; objectNumber < clientlist.length; objectNumber++){
            var element = clientlist[objectNumber];
            var ourGeneratedHTML = compiledTemplate(element);
            $(all_clients_container).append(ourGeneratedHTML);
        }
        allClientsListGenerated = true;
        console.log("generated list");
    } else {
        return false;
    }
};
function showClientDetails(id) {
     var that = $('#' + id);
     clientDetailsBox = $(that).find('.details-content');
    if ($(that).attr("data-ajaxed") !== "true"){
        $.ajax({
        url:'php/fetch-client-details.php',
        type: 'GET',
        data: {client_id:id},
        dataType: 'json'}).done(function(data) {
            var clientDetails = data;
            var phone_Num = $('[data-id-phone="' + id + '"');
            var addr = $('[data-id-address="' + id + '"');
            phone_Num.text(clientDetails['phone']);
            addr.text(clientDetails['address']);
    });
     console.log("ajaxed");
     $(that).attr("data-ajaxed", true);
}
    if ($(that).attr('data-detailsexpanded') == "true"){
        clientDetailsBox.addClass('is-hidden');
        $(that).attr('data-detailsexpanded', "false");
    }else{
    clientDetailsBox.removeClass('is-hidden');
   
    $(that).attr('data-detailsexpanded', "true");
    }

   //3. append detail box with information about client from server
};
//Anything to do with getting or saving logs

function saveLog(){
    $('#submitbutton').toggleClass('is-loading');
    let clientName = $.trim($('#clientName').val());
    let dateOccurred = $.trim($('input[name=date_submit]').val());
    var dateTimestamp = Date.parse(dateOccurred)/1000;
    var timeStarted = $.trim($('input[name=started_submit]').val());
    var timeStopped = $.trim($('input[name=stopped_submit]').val());
    var hoursWorked = $.trim($('#hoursWorked').val());
    var issue = $.trim($('#issue').val());
    var description= $.trim($('#description').val());

    var jsonObject = {};
    jsonObject.name = clientName;
    jsonObject.issue = issue;
    jsonObject.dateOccurred = moment().format("dddd, Do");
    jsonObject.dateTimestamp = dateTimestamp;
    jsonObject.hoursWorked = hoursWorked;
    jsonObject.descripton = description;
    jsonObject.timeStopped = timeStopped;
    jsonObject.timeStarted = timeStarted;

    $.post('php/save-log.php',{
        client_id: selectedClientId,
        date_occurred: dateOccurred,
        hours_worked: hoursWorked,
        time_started: timeStarted,
        time_stopped: timeStopped,
        issue: issue,
        description: description
        },function(data) {
            alert(data);
            createHTML(jsonObject);
            $('#submitbutton').toggleClass('is-loading');
    });
event.preventDefault();
};

function showLogDetails(id){
   var clickedLog = $('#' + id);
   var descCont = clickedLog.find('.desc-container');
   var downArrow = clickedLog.find('#down-arrow');
   if(clickedLog.attr('data-log-clicked') !== 'true'){
    downArrow.toggleClass('spin-around');
    clickedLog.attr('data-log-clicked','true')
        $.ajax({
            type: 'GET',
            url: 'php/fetch-desc.php',
            data: {
                log_id: id
            },
            datetype: 'text'
        }).done( function(data) {
            descCont.append('<h1 class="subtitle font">'+data+'</h1>');
            // descCont.removeClass('slideOutUp');
            // descCont.removeClass('is-hidden');
            // descCont.addClass('slideInDown');
            descCont.toggleClass('is-hidden');
            downArrow.toggleClass('spin-around rotate')
        });
   }else{
    //    descCont.removeClass('slideInDown');
    //    descCont.addClass('slideOutUp');
    descCont.toggleClass('is-hidden');
    downArrow.toggleClass('rotate');
   }
};
