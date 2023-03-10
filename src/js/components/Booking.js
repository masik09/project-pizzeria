import { templates, select, settings, classNames } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';


class Booking {
  constructor(element) {
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
    thisBooking.tableChoose();
  }
  getData(){
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);

    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);
    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat:[
        settings.db.repeatParam,
        endDateParam,
      ],
    };
    console.log('getData params', params);

    const urls = {
      booking: settings.db.url + '/' + settings.db.bookings + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.events + '?' + params.eventsCurrent.join('&'),
      eventsRepeat: settings.db.url + '/' + settings.db.events + '?' + params.eventsRepeat.join('&')
    };
    console.log('getData urls', urls);

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function(allResponses){
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        console.log(eventsCurrent);

        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });

  }
  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;
    console.log('parseData uruchomina');
    

    thisBooking.booked = {};

    for(let item of bookings){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);

    }

    for(let item of eventsCurrent){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);

    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for(let item of eventsRepeat){
      if(item.repeat == 'daily'){
        for( let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
        
      }
      

    }
    thisBooking.updateDOM();

    

  }
  makeBooked(date, hour, duration, table){
    const thisBooking = this;
    console.log('makeBooked uruchomina');

    if(typeof thisBooking.booked[date] == 'undefined'){
      thisBooking.booked[date] = {};
    }


    const startHour = utils.hourToNumber(hour);



    for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){

      // console.log('loop', hourBlock);

      if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){
        thisBooking.booked[date][hourBlock] = [];
      }
  
      thisBooking.booked[date][hourBlock].push(table);
    }

  }
  updateDOM(){
    const thisBooking = this;
    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    let allAvailable = false;

    if(
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ){
      allAvailable = true;
    }
    
    for(let table of thisBooking.dom.tables){
      

      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if(!isNaN(tableId)){
        tableId = parseInt(tableId);
      }
      if(
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ){
        table.classList.add(classNames.booking.tableBooked);
      } else{
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }
  render(element) {
    const thisBooking = this;
    /* generate HTML based on template */
    const generatedHTML = templates.bookingWidget();

    thisBooking.dom = {};

    thisBooking.dom.wrapper = element;
    thisBooking.dom.wrapper.innerHTML = generatedHTML;
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);

    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    console.log(thisBooking.dom.peopleAmount, thisBooking.dom.hoursAmount);

    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    console.log(thisBooking.dom.datePicker, thisBooking.dom.hourPicker);
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    thisBooking.dom.floorPlan = thisBooking.dom.wrapper.querySelector(select.booking.floorPlan);
    thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(select.booking.phone);
    thisBooking.dom.address = thisBooking.dom.wrapper.querySelector(select.booking.address);
    thisBooking.dom.form = thisBooking.dom.wrapper.querySelector(select.booking.form);
    thisBooking.dom.checkbox = thisBooking.dom.wrapper.querySelector(select.booking.checkbox);
    //console.log(thisBooking.dom.tables);

    thisBooking.starters = [];





  } initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);

    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);

    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.peopleAmount.addEventListener('updated', function () {
      

    });

    thisBooking.dom.hoursAmount.addEventListener('updated', function () {
      

    });
    thisBooking.dom.wrapper.addEventListener('updated', function () {
      thisBooking.updateDOM();
      
    });
    thisBooking.dom.hourPicker.addEventListener('updated', function () {
      for (let table of thisBooking.dom.tables) {
        if(table.classList.contains(classNames.booking.tableReserved))
          table.classList.remove(classNames.booking.tableReserved);

      }
      
      
    });
    thisBooking.dom.datePicker.addEventListener('updated', function () {
      for (let table of thisBooking.dom.tables) {
        if(table.classList.contains(classNames.booking.tableReserved))
          table.classList.remove(classNames.booking.tableReserved);

      }
      
    });


    thisBooking.dom.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisBooking.sendBooking();
      

    });

    thisBooking.dom.checkbox.addEventListener('click', function(event){
  
      if(event.target.tagName == 'INPUT'){

        if(event.target.checked){

          thisBooking.starters.push(event.target.value); 
          console.log(thisBooking.starters);
        }else{

          thisBooking.starters.splice(thisBooking.starters.indexOf(event.target.value, 0));
          console.log(thisBooking.starters);
        }
      }
      
    });


  }
  tableChoose(){
    const thisBooking = this;

    thisBooking.dom.floorPlan.addEventListener('click', function(event){
      event.preventDefault();
      console.log('event.target', event.target);

     
      if(event.target.classList.contains('table')){
        if(event.target.classList.contains(classNames.booking.tableBooked)){
          console.log('stolik jest juz zarezerwowany');


        }else{

          if(event.target.classList.contains(classNames.booking.tableReserved)){
            event.target.classList.remove(classNames.booking.tableReserved);
    
          }else{

            for (let table of thisBooking.dom.tables) {
              if(table.classList.contains(classNames.booking.tableReserved))
                table.classList.remove(classNames.booking.tableReserved);

            }
            event.target.classList.add(classNames.booking.tableReserved);
            const res = event.target.getAttribute(settings.booking.tableIdAttribute);
            thisBooking.selectedTables = res;
            console.log(thisBooking.selectedTables);
    
          }

        }
  
      }
    });
  }
  sendBooking(){
    const thisBooking = this;

    const payload = {
      date: thisBooking.datePicker.value,
      hour: thisBooking.hourPicker.value,
      table: Number(thisBooking.selectedTables),
      duration: thisBooking.hoursAmount.value,
      ppl: thisBooking.peopleAmount.value,
      starters: thisBooking.starters,
      phone: thisBooking.dom.phone.value,
      address: thisBooking.dom.address.value,


    };
    

    const url = settings.db.url + '/' + settings.db.bookings;

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };
      
    fetch(url, options)
      .then(function(response){
        
        return response.json();
      }).then(function(parsedResponse){
        console.log('parsedResponse',parsedResponse);
        
      });

    thisBooking.makeBooked(payload.date, payload.hour, payload.duration, payload.table);

  }



}

export default Booking;