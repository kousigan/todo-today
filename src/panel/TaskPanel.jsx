import React, { Component, useState } from "react";
import "../style.css";
import "./TaskPanel.css";
import { db } from "../db/config";
import { days, months } from "./names";

class TasksPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [],
      searchField: "",
      todo: {
        taskId: "",
        date: {
          name: "",
          day: 1,
          year: 2021,
          month: 3
        },
        name: "Eat Vegetables",
        notes: null,
        status: false
      },
      theList: []
      
    };
  }

  componentDidMount() {
    this.setState(nextProps => {
      this.state.todo.date = nextProps;
      // console.log("componentDidMount", this.props.today);
      // this.makeUpdate(this.props.today);
    });
  }

  handleChange = e => {
    this.setState({ searchField: e.target.value });
  };

  setFocus = e => {
    var tempKey = e.target.getAttribute("data-key");
    db.collection("todo-" + this.props.user)
      .doc(tempKey)
      .get()
      .then(doc => {
        console.log(doc.data());
      });
  };
  pushToParent = e => {
    this.props.pushData(e);
  };
  render() {
    var { users, searchField, theList } = this.state;
     
    const searchResults = theList.filter(user =>
      user.name.toLowerCase().includes(searchField.toLowerCase())
    );
    const focusedTaskId = this.props.today;
    const taskList = this.props.tasks;
    return (
      <div >
        <div className="row date-large">
          <div className="col-lg">
            <h1>

             <a> {months[focusedTaskId.month] +
                " " +
                focusedTaskId.day }</a>
                 <span>
                {focusedTaskId.name}</span>{" "}
                <span className="count">Total:{this.props.tasks}</span>{" "}
                <span className="count">Completed:{this.props.completed}</span>{" "}
                <span className="count">Pending:{this.props.pending}</span>
            </h1>
          </div>
        </div>
        <div className="row">
          <div className="col-lg">
            <textarea
              placeholder="enter todo"
              id="myTextarea"
              onKeyDown={this.pushToParent}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default TasksPanel;
