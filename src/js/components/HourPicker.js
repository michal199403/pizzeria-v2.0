/* global rangeSlider */

import { settings, select } from '../settings.js';
import utils from '../utils.js';
import BaseWisdget from './BaseWidget.js';


export class HourPicker extends BaseWisdget {
  constructor(wrapper) {
    super(wrapper, settings.hours.open);
    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.hourPicker.input);
    thisWidget.dom.output = thisWidget.dom.wrapper.querySelector(select.widgets.hourPicker.output);
    thisWidget.initPlugin();
    thisWidget.value = thisWidget.dom.input.value;
  }

  initPlugin() {
    const thisWidget = this;
    rangeSlider.create(thisWidget.dom.input);
    thisWidget.dom.input.addEventListener('input', function () {
      thisWidget.value = thisWidget.dom.input.value;
    });
  }

  parseValue(newValue) {
    return utils.numberToHour(newValue);
  }

  isValid() {
    return true;
  }

  renderValue() {
    const thisWidget = this;
    thisWidget.dom.output.innerHtml = thisWidget.value;
  }
}
