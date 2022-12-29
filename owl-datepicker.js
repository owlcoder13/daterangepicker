import moment from 'moment'

let id = 1;

const INNER_FORMAT = 'Y-MM-DD';

export class DatePicker {
  constructor(options) {

    // get options
    this.options = options ?? {};
    this.isRange = this.options['mode'] === 'range';
    this.containerElement = options.container;
    this.input = options.input;

    // set unique id per datepicker
    this.id = `owl_drp_${id++}`;

    // initialize container
    let container = `<div class="owl-drp" id="${this.id}"></div>`;
    document.body.innerHTML += container;

    // store container
    this.el = document.getElementById(this.id);

    // store start amd emd dates
    this.startDate = null;
    this.endDate = null;

    this.baseDate = moment().startOf('day').startOf('month');

    this.render.bind(this)();
    this.attachEventHandlers.bind(this)();
  }

  attachEventHandlers() {
    this.el.addEventListener('click', (e) => {
      let dateStr = e.target.getAttribute('data-day');

      if (dateStr) {
        let currentDate = this.createMomentDate(dateStr);


        if (this.isRange) {
          if (this.startDate !== null && this.endDate == null && currentDate.diff(this.startDate) > 0) {
            this.endDate = currentDate;
          } else {
            this.startDate = currentDate;
            this.endDate = null;
          }
        } else {
          this.startDate = currentDate;
        }

        this.rangeMark(currentDate);
        this.render();
      }
    });

    this.el.addEventListener('mouseover', (e) => {
      let dateStr = e.target.getAttribute('data-day');

      if (dateStr) {
        let momomentDate = this.createMomentDate(dateStr);
        e.target.classList.add('hover');
        this.rangeMark(momomentDate);
      }
    });

    this.el.addEventListener('mouseout', (e) => {
      let dateStr = e.target.getAttribute('data-day');

      if (dateStr) {
        e.target.classList.remove('hover');
      }
    });

    this.el.addEventListener('click', (e) => {

      if (e.target.classList.contains('owl-drp__month-left')) {
        this.baseDate.add('-1', 'month');
        console.log(this.baseDate);
        this.render();
      }
    });

    this.el.addEventListener('click', (e) => {
      if (e.target.classList.contains('owl-drp__month-right')) {
        this.baseDate.add('1', 'month');
        console.log(this.baseDate);
        this.render();
      }
    })
  }

  renderDay(day, currentMonth) {
    let dayNum = day.format('D');
    let dateStr = day.format(INNER_FORMAT);

    let classNames = ['owl-drp__day'];

    // gray days for not this month
    if (currentMonth != day.month()) {
      classNames.push('gray');
    }

    // console.log(this.startDate);
    if (this.startDate != null && this.startDate.diff(day) == 0) {
      classNames.push('active');
    }

    // mark end date
    if (this.endDate != null && this.endDate.diff(day) == 0) {
      classNames.push('active');
    }

    return `<div data-day="${dateStr}" class="${classNames.join(' ')}">${dayNum}</div>`;
  }

  rangeMark(hoverDay) {

    if (!this.isRange) {
      return;
    }

    if (this.startDate === null) {
      return;
    }

    this.clearRangeMark();
    let protectIterator = 0;
    let toDate = hoverDay ? hoverDay.clone() : null;

    if (this.endDate) {
      toDate = this.endDate;
    }

    if (this.startDate) {
      let fromDate = this.startDate.clone();

      while (fromDate.diff(toDate) <= 0) {
        console.log(fromDate);

        let dateStr = fromDate.format(INNER_FORMAT);
        let el = this.el.querySelector(`[data-day="${dateStr}"]`);

        if (el) {
          console.log(`${dateStr} selected`);
          el.classList.add('selected');
        }

        fromDate.add(1, 'day');

        if (protectIterator++ > 100) {
          return;
        }
      }
    }
  }

  clearRangeMark(day) {
    for (let day of this.el.querySelectorAll('[data-day]')) {
      day.classList.remove('selected');
    }
  }

  createMomentDate(dateStr) {
    return moment(dateStr).startOf('day');
  }

  render() {
    let iterations = 0;
    this.el.innerHTML = '';

    let currentDate = this.baseDate.clone();

    let currentMonth = currentDate.month();
    let currentMonthName = currentDate.format('MMMM');
    let currentYear = currentDate.format('Y');
    let nextMonth = currentDate.clone().add('1', 'month').month();

    currentDate.startOf('week');

    let month = [];

    while (currentDate.month() != nextMonth) {

      let weekRender = [];

      for (var i = 0; i < 7; i++) {
        weekRender.push(this.renderDay(currentDate, currentMonth));
        currentDate.add('1', 'day');

        if (iterations > 90) {
          break;
        }
        continue;
      }

      month.push(`<div class="owl-drp__week">${weekRender.join('')}</div>`);
    }

    this.el.innerHTML = `<div class="owl-drp__month">
      <div class="owl-drp__month-header">
        <div class="owl-drp__month-left">
            &lt;
        </div>
        <div class="owl-drp__month-header-names">
          <div class="owl-drp__month-header-month">
            ${currentMonthName}
          </div>
          <div class="owl-drp__month-header-year">
            ${currentYear}
          </div>
        </div>
        <div class="owl-drp__month-right">
          &gt;
        </div>
      </div>
      <div class="owl-drp__month-calendar">
        ${month.join('')}
      </div>
    </div>`;

    this.rangeMark();
  }
}

export default class OwlDateRangePicker {
  constructor(options) {
    let datepicker = new DatePicker({ mode: 'range' });
  }
}