import {select, classNames, templates, settings } from '../settings.js';
import CartProduct from './CartProduct.js';
import utils from '../utils.js';

class Cart{
  constructor(element){

    const thisCart = this;
      
    thisCart.products = [];

      
    thisCart.getElements(element);
    thisCart.initActions();

      

  }

  getElements(element){
    const thisCart = this;

    thisCart.dom = {};

    thisCart.dom.wrapper = element;
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
    thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
    thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
    thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
    thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
    thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
  }
 
  initActions(){

    const thisCart = this;

    thisCart.dom.toggleTrigger.addEventListener('click', function(){
        
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      
    });

    thisCart.dom.productList.addEventListener('updated', function(){
      thisCart.update();
    });

    thisCart.dom.productList.addEventListener('remove', function(event){
      thisCart.remove(event.detail.cartProduct);
    });

    thisCart.dom.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisCart.sendOrder();

    });


  }

  add(menuProduct){
      
    const thisCart = this;



      
    /* generate HTML based on template */
    const generatedHTML = templates.cartProduct(menuProduct);

    /* create element using utils.createElementFromHTML */
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
      
      

    /* add element to menu */
    thisCart.dom.productList.appendChild(generatedDOM);


    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));

    thisCart.update();

      
  }
  update(){
    const thisCart = this;

    const deliveryFee = settings.cart.defaultDeliveryFee;

    thisCart.totalNumber = 0;
    thisCart.subtotalPrice = 0;

    console.log(thisCart.products);

    for(let product of thisCart.products) {

      console.log(product);
        

        
      thisCart.totalNumber += product.amount;
      thisCart.subtotalPrice += product.price;

     
    }
      
    console.log(thisCart.totalNumber, thisCart.subtotalPrice);
      
    thisCart.dom.deliveryFee.innerHTML = deliveryFee;
    thisCart.totalPrice = thisCart.subtotalPrice + deliveryFee;

    thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
    thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;

    for(let totalPrice of thisCart.dom.totalPrice){

      totalPrice.innerHTML=thisCart.totalPrice;
          
    }
    thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
    thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;

    if(thisCart.subtotalPrice <= 0){
        
      thisCart.dom.deliveryFee.innerHTML = 0;
        
        
      for(let totalPrice of thisCart.dom.totalPrice){

        totalPrice.innerHTML=0;
          
      }
    }
  }
  remove(thisCartProduct){

    const thisCart = this;

    thisCartProduct.dom.wrapper.remove();
    const indexOfProduct = thisCart.products.indexOf(thisCartProduct);
    thisCart.products.splice(indexOfProduct, thisCartProduct.amountWidget.value);
    thisCart.update();

  }
  sendOrder(){
    const thisCart = this;

    const payload = {
      address: thisCart.dom.address,
      phone: thisCart.dom.phone,
      totalPrice: thisCart.totalPrice,
      subtotalPrice: thisCart.subtotalPrice,
      totalNumber: thisCart.totalNumber,
      deliveryFee: settings.cart.defaultDeliveryFee,
      products: []


    };
    for(let prod of thisCart.products) {
      payload.products.push(prod.getData());
    }
    console.log(payload);

    const url = settings.db.url + '/' + settings.db.orders;

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
  }
    
}
export default Cart;