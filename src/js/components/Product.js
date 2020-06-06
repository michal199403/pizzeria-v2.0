import { select, classNames, templates } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';

class Product {
  constructor(id, data) {
    const thisProduct = this;
    /* Zapisanie właściwości instancji */
    thisProduct.id = id;
    thisProduct.data = data;
    /* Wywoływanie metod */
    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();
    //console.log('New Product', thisProduct);
  }
  /* Metoda renderowania produktów WEWNĄTRZ KLASY */
  renderInMenu() {
    const thisProduct = this;
    /* Wygenerowanie HTML na podstawie szablonu */
    const generatedHTML = templates.menuProduct(thisProduct.data);
    /* Tworzenie elementu DOM za pomocą kodu produktu 'utils.createElementFromHTML' */
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);
    /* Znajdowanie kontenera z menu */
    const menuContainer = document.querySelector(select.containerOf.menu);
    /* Dodawanie elementu do menu */
    menuContainer.appendChild(thisProduct.element);
  }
  /* Metoda znajdowania elementów */
  getElements() {
    const thisProduct = this;

    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    //console.log('Product form: ', thisProduct.form);
    //console.log('Product form inputs: ', thisProduct.formInputs);
  }
  /* Metoda akordeonu */
  initAccordion() {
    const thisProduct = this;
    /* Znajdowanie elementu który ma reagować na kliknięcie */
    /* START: nasłuchiwanie kliknięcia */
    thisProduct.accordionTrigger.addEventListener('click', function () {
      //console.log('Akordeon kliknięty: ', thisProduct.accordionTrigger);
      /* Zapobieganie podstawowej akcji */
      event.preventDefault();
      /* Wyświetlanie aktywnej klasy na elemencie 'thisProduct' */
      thisProduct.element.classList.toggle('active');
      /* Znajdowanie wszystkich aktywnych 'product' */
      const activeProducts = document.querySelectorAll(select.all.menuProductsActive);
      /* START PĘTLI: dla każdego aktywnego 'productl */
      for (let activeProduct of activeProducts) {
        /* START:  jeśli aktywny produkt nie jest elementem 'thisProduct' */
        if (activeProduct != thisProduct.element) {
          /* Usuń klase 'active' dla aktywnego 'product' */
          activeProduct.classList.remove('active');
          /* KONIEC: jeśli aktywny produkt nie jest elementem 'thisProduct' */
        }
        /* KONIEC: PĘTLI: dla każdego aktywnego 'product' */
      }
      /* KONIEC: nasłuchiwanie kliknięcia */
    });
  }
  initOrderForm() {
    const thisProduct = this;
    thisProduct.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisProduct.processOrder();
    });
    for (let input of thisProduct.formInputs) {
      input.addEventListener('change', function () {
        thisProduct.processOrder();
      });
    }
    thisProduct.cartButton.addEventListener('click', function (event) {
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });
  }
  initAmountWidget() {
    const thisProduct = this;
    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
    thisProduct.amountWidgetElem.addEventListener('updated', function () {
      thisProduct.processOrder();
    });
  }
  processOrder() {
    const thisProduct = this;
    /*odczytaj dane z formularza i zapisz w stałej */
    const formData = utils.serializeFormToObject(thisProduct.form);

    thisProduct.params = {};
    /* stwórz zmienną i przypisz domyślną cene produktu */
    let price = thisProduct.data.price;
    //console.log('domyślna cena: ', price);
    /* START PĘTLI: dla każdego parametru (paramId) produktu (thisProduct.data.param) */
    for (let paramId in thisProduct.data.params) {
      /* zapisz element w produkcie (thisProduct.data.params) z kluczem (paramId) jako stałą */
      const param = thisProduct.data.params[paramId];
      /* START PĘTLI: dla każdej opcji (optionId) w opcjach parametrów (param.options) */
      for (let optionId in param.options) {
        /* zapisz element w opcjach parametrów (param.options) z kluczem (optionId) jako stałą */
        const option = param.options[optionId];
        const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;
        /* START WARUNEK: jeśli opcja (option) jest zaznaczona I nie jest domyślna */
        if (optionSelected && !option.default) {
          /* dodaj cenę opcji (option) do zmiennej ceny całościowej (price) */
          price += option.price;
          /* KONIEC WARUNKU: jeśli opcja (option) jest zaznaczona I nie jest domyślna */
          /* START WARUNEK: jeśli opcja (option) nie jest zaznaczona I jest domyślna */
        } else if (!optionSelected && option.default) {
          /* odejmij cenę opcji (option) od zmiennej ceny całościowej (price) */
          price -= option.price;
          /* KONIEC WARUNKU: jeśli opcja (option) nie jest zaznaczona I jest domyślna */
        }
        /* WIZUALIZACJA ZAMÓWIENIA NA OBRAZKACH */
        /* stworz stałą (images) i zapisz w niej wszystkie obrazki dostępnych opcji */
        const images = thisProduct.imageWrapper.querySelectorAll('.' + paramId + '-' + optionId);
        /* START WARUNKU: jeśli opcja jest zaznaczona */
        if (optionSelected) {
          if (!thisProduct.params[paramId]) {
            thisProduct.params[paramId] = {
              label: param.label,
              options: {},
            };
          }
          thisProduct.params[paramId].options[optionId] = option.label;
          /* dla każdego obrazka (image) ze wszystkich obrazków (images) */
          for (let image of images) {
            /* dodaj klase (imageVisible) */
            image.classList.add(classNames.menuProduct.imageVisible);
          }
          /* KONIEC WARUNKU: jeśli opcja jest zaznaczona */
          /* START WARUNKU: jeśli opcja nie jest zaznaczona */
        } else {
          /* dla każdego obrazka (image) ze wszystkich obrazków (images) */
          for (let image of images) {
            /* usuń klase (imageVisible) */
            image.classList.remove(classNames.menuProduct.imageVisible);
          }
          /* KONIEC WARUNKU: jeśli opcja nie jest zaznaczona */
        }
        /* KONIEC PĘTLI: dla każdej opcji (optionId) w opcjacj parametrów (param.options) */
      }
      /* KONIEC PĘTLI: dla każdego parametru (paramId) produktu (thisProduct.data.param) */
    }
    /* wstaw cene (price) w HTML (thisProduct.priceElem) */
    thisProduct.priceSingle = price;
    thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;
    thisProduct.priceElem.innerHTML = thisProduct.price;
  }
  addToCart() {
    const thisProduct = this;
    thisProduct.name = thisProduct.data.name;
    thisProduct.amount = thisProduct.amountWidget.value;

    // app.cart.add(thisProduct);

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct,
      },
    });
    thisProduct.element.dispatchEvent(event);
  }
}

export default Product;
