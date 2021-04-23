import React from "react";
import FeatherIcon from "feather-icons-react";
import { sortBy, groupBy } from "underscore";
import { months } from "../panel/names";
import { db } from "../db/config";
import "../style.css";

class Notification extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      listEmpty: true
    };
  }

  togglePanel = () => {
    this.props.click();
  };
  updateList = data => {
    if (data !== null) {
      var temp = [];
      var newList = [];
      data.forEach(item => {
        temp.push({
          month: item.date.month,
          day: item.date.day,
          dayname: item.date.name,
          year: item.date.year,
          name: item.name
        });
      });
      temp = groupBy(temp, "month");
      for (var key in temp) {
        let tmp = sortBy(temp[key], "day");
        tmp.forEach(it => {
          newList.push(it);
        });
      }

      // console.log(newList);
      return this.setState({
        list: newList,
        listEmpty: false
      });
    }
  };
  chooseDate = e => {
    this.props.select(e.target);
  };
  makelist = () => {
    if (this.props.slide == "slide-in" && this.state.listEmpty) {
      // console.log("updateList function");
      // console.log(this.state.list);
      db.collection("todo-" + this.props.user)
        .where("status", "==", false)
        .get()
        .then(snapshot => {
          var items = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          this.updateList(items);
        });
    }
    return (
      <React.Fragment>
        <div>
          {this.state.list.map((item, i) => (
            <div className="card" key={i}>
              {" "}
              <div
                className="section"
                data-day={item.day}
                data-month={item.month}
                data-year={item.year}
                data-dayname={item.dayname}
                onClick={this.chooseDate}
              >
                <span className="icon">
                  {" "}
                  <FeatherIcon icon="clock" />
                </span>{" "}
                {item.name}
              </div>
              <div className="section">
                <small>
                  {" "}
                  {months[item.month]}, {item.day}, {item.year}
                </small>
              </div>{" "}
            </div>
          ))}
        </div>
      </React.Fragment>
    );
  };

  render() {
    return (
      <div className={`notification-panel ${this.props.slide}`}>
        <div className="toggle-controls">
          <span className="title">Notification</span>
          <button onClick={this.togglePanel}>
            <FeatherIcon icon="x" />
          </button>
        </div>
        {this.makelist()}
      </div>
    );
  }
}

export default Notification;
