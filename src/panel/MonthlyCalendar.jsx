import React, { Component } from "react";
import { days, months } from "./names";
import "./MonthlyCalendar.css";

class MonthlyCalendar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      temp: runInit(),
      focused: {
        month: null,
        year: null,
        length: null
      },
      grid: true
    };
  }
  toggleGrid = () => {
    if (this.state.grid == true) {
      this.setState(grid => (this.state.grid = false));
    } else {
      this.setState(grid => (this.state.grid = true));
    }
  };
  prevMonth = () => {
    this.setState(({ focused }) => ({
      focused: {
        month: this.state.focused.month < 1 ? 11 : this.state.focused.month - 1,
        year:
          this.state.focused.month < 1
            ? this.state.focused.year - 1
            : this.state.focused.year,
        length: getMonthlength(
          this.state.focused.month - 1,
          this.state.focused.year
        )
      }
    }));
  };
  nextMonth = () => {
    this.setState(({ focused }) => ({
      focused: {
        year:
          this.state.focused.month == 11
            ? this.state.focused.year + 1
            : this.state.focused.year,
        month: this.state.focused.month > 10 ? 0 : this.state.focused.month + 1,
        length: getMonthlength(
          this.state.focused.month + 1,
          this.state.focused.year
        )
      }
    }));
  };
  componentDidUpdate() {
    console.log("after mounting");
  }
  renderDays = () => {};
  componentDidMount() {
    this.setState(({ temp }) => ({
      focused: {
        month: temp.m,
        year: temp.y,
        length: temp.ln
      }
    }));
    console.log("component did mount");
  }

  setDay = e => {
    this.props.fixDate(e.target);
  };

  render() {
    return (
      <div>
        <div className="button-group">
          <button onClick={this.toggleGrid}>
            {" "}
            <i className="lni lni-list" />
          </button>
          <button onClick={this.prevMonth}>
            <i className="lni lni-chevron-up" />
          </button>
          <button onClick={this.nextMonth}>
            {" "}
            <i className="lni lni-chevron-down" />
          </button>
        </div>
        <h1>
          {months[this.state.focused.month]}{" "}
          <small>{this.state.focused.year}</small>{" "}
        </h1>
        <div data-makegrid={this.state.grid ? true : false}>
          <Mday md={this.state.focused} click={this.setDay} />
        </div>
      </div>
    );
  }
}

const Mday = props => {
  var md = {
    m: props.md.month,
    y: props.md.year,
    ln: props.md.length
  };
  var cd = new Date();
  return (
    <div className="days-container">
      {[...Array(md.ln)].map((x, i) => (
        <button
          onClick={props.click}
          data-day={i + 1}
          data-month={md.m}
          data-year={md.y}
          className={`calendar-day ${
            i + 1 == cd.getDate() &&
            md.m == cd.getMonth() &&
            md.y == cd.getFullYear()
              ? "primary"
              : ""
          } ${getDayName([i + 1, md.m, md.y])}`}
          tooltip={getDayName([i + 1, md.m, md.y])}
          key={i + 1}
        >
          <span> {getDayName([i + 1, md.m, md.y])}</span>
          <CDay val={i + 1} />
        </button>
      ))}
    </div>
  );
};

const CDay = props => {
  return props.val;
};
const getDayName = props => {
  var d = new Date(props[2], props[1], props[0]);
  return days[d.getDay()];
};
const getMonthlength = (mm, yy) => {
  return new Date(yy, mm + 1, 0).getDate();
};

function runInit() {
  var d = new Date();
  var monthDetails = {
    m: d.getMonth(),
    y: d.getFullYear(),
    ln: getMonthlength(d.getMonth(), d.getFullYear())
  };

  return monthDetails;
}
export default MonthlyCalendar;
