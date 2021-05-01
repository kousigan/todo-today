import React from "react";
import MonthlyCalendar from "./panel/MonthlyCalendar";
import Notification from "./panel/Notification";
import Search from "./panel/Search";
import TaskPanel from "./panel/TaskPanel";
import TaskCard from "./panel/TaskCard";
import { days, months } from "./panel/names";
import { db } from "./db/config";
import { nanoid } from "nanoid";
import box from "./img/box.svg";
import logo from "./img/logo.svg";
import delivery from "./img/delivery.svg";
import FeatherIcon from "feather-icons-react";
import { Draggable, Droppable } from "react-drag-and-drop";

import "./style.css";

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      fdate: {
        name: days[new Date().getDay()],
        day: new Date().getDate(),
        month: new Date().getMonth(),
        year: new Date().getFullYear()
      },
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
      theList: [],
      loadingData: true,
      user: null,
      userLoaded: false,
      showerror: false,
      slide: "slide-out",
      notificationPanel: "slide-out",
      search: false,
      currentParent: null
    };
  }

  handleDate = e => {
    var temp = {
      name: e.getAttribute("data-dayname"),
      day: e.getAttribute("data-day"),
      month: e.getAttribute("data-month"),
      year: e.getAttribute("data-year")
    };
    this.setState(prevState => {
      {
        prevState.fdate = temp;
      }
      // console.log(this.state.user);
      if (this.state.user !== null) {
        // console.log(this.state.user);
        this.getData(this.state.user);
      }
      return this.state.fdate;
    });
  };
  uidgen = () => {
    var uid = Math.floor(1000 + Math.random() * 9000);
    var temp = nanoid(4) + "-" + uid + "-" + nanoid(4) + "-" + uid + 1;
    return temp;
  };
  getData = user => {
    var temp = user;
    db.collection("todo-" + temp)
      .where("date.day", "==", parseInt(this.state.fdate.day))
      .where("date.month", "==", parseInt(this.state.fdate.month))
      .onSnapshot(snapshot => {
        var items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        this.makeUpdate(items);
      });
  };
  makeUpdate = temp => {
    this.setState(prevState => {
      {
        prevState.theList = temp;
      }
    });
    this.setState({ loadingData: false });
    return this.state.theList;
  };
  checkUser = e => {
    if (e.target.value.length > 0) {
      this.setState({ showerror: false });
    }
    if (e.key == "Enter") {
      var temp = e.target.value.toLowerCase();
      if (temp == "kousi" || temp == "preeti") {
        this.setState({ user: temp });
        this.getData(temp);
        this.setState({ userLoaded: true });
      } else {
        this.setState({ showerror: true });
      }
    }
    // this.setState({ userLoaded: true });
  };
  errorMessage = () => {
    return (
      <div className="section error">
        <FeatherIcon icon="x" />
        <span>Nope.. try agin!!</span>
      </div>
    );
  };
  getUserId = () => {
    return (
      <div className="overlay-container getModal">
        <div className="card getusername">
          <img src={logo} className="logo" alt="My todo" />
          <h3 className="section">Who's this?</h3>
          <label htmlFor="username">Enter a name</label>
          <input
            type="text"
            id="Username"
            placeholder="Username"
            onKeyDown={this.checkUser}
          />
          {this.state.showerror ? this.errorMessage() : ""}
        </div>
      </div>
    );
  };

  searchTask = () => {
    return (
      <Search
        user={this.state.user}
        select={this.selectDate}
        hide={this.showHideSearch}
      />
    );
  };

  drop = event => {
    console.log(event);
    // let parentContainer = event.target.closest(".mytasks").id;
    // console.log(parentContainer);
    // var data = event.dataTransfer.getData("Text");
    // event.target.closest(".mytasks").appendChild(document.getElementById(data));
    // this.handleStateChange(data, parentContainer);
  };
  handleStateChange = (docId, parentContainer) => {
    var taskRef = db.collection("todo-" + this.state.user).doc(docId);

    if (parentContainer == "Completed") {
      return taskRef.update({ status: true });
    }
    if (parentContainer == "Todo") {
      return taskRef.update({ status: false });
    }
    if (parentContainer == "Inprogress") {
      return taskRef.update({ status: null });
    }
  };
  dragStart = event => {
    // event.dataTransfer.effectAllowed = "move";
    var data = event.dataTransfer.setData("Text", event.target.id);
    console.log(event, "data", data);

    console.log("parentnode", event.target.closest(".mytasks").id);
    this.setState({ currentParent: event.target.parentNode.id });
  };
  dragEnter = event => {
    event.preventDefault();
  };
  dragEnd = event => {
    event.preventDefault();
    let parentContainer = event.target.closest(".mytasks").id;
    console.log("dragEnd", parentContainer);
  };
  makeCards = (data, title) => {
    // console.log("makeCards", data);
    if (data.length > 0) {
      return (
        <div className={`taskcolumn ${title}`}>
          <h4>{title}</h4>
          <Droppable onDrop={this.drop}>
            <div
              className="mytasks card-list"
              onDrop={this.drop}
              onDragEnter={this.dragEnter}
              id={title}
            >
              {data.map((task, i) => (
                <TaskCard
                  dragStart={this.dragStart}
                  key={task.id}
                  user={this.state.user}
                  id={task.id}
                  name={task.name}
                  status={task.status}
                  task={task}
                />
              ))}
            </div>
          </Droppable>
        </div>
      );
    } else {
      if (title == "Completed" || title == "Inprogress") {
        return (
          <div className={`taskcolumn ${title}`}>
            <h4>{title}</h4>
            <Droppable>
              <div className="mytasks card-list">
                <div className="mytask" />
              </div>
            </Droppable>
          </div>
        );
      } else {
        return (
          <div className={`taskcolumn ${title}`}>
            <h4>{title}</h4>
            <Droppable>
              <div className="mytasks card-list" />
            </Droppable>
            <figure>
              <img src={box} alt="Empty list" width="150px" />
              <figcaption>There are no items for the day.</figcaption>
            </figure>
          </div>
        );
      }
    }
  };

  loadingData = () => {
    return (
      <figure>
        <img src={delivery} alt="Loading data" />
        <figcaption>Items are getting loaded.</figcaption>
      </figure>
    );
  };

  submitTask = e => {
    if (e.key == "Enter" && this.state.user !== null) {
      const { todo } = this.state;
      todo.name = e.target.value;
      todo.taskId = this.uidgen();
      todo.date.name = this.state.fdate.name;
      todo.date.day = parseInt(this.state.fdate.day);
      todo.date.month = parseInt(this.state.fdate.month);
      todo.date.year = parseInt(this.state.fdate.year);
      // console.log(todo);
      db.collection("todo-" + this.state.user)
        .add(todo)
        .then(() => {
          // console.log("success");
          document.getElementById("myTextarea").value = "";
        });
    }
  };
  slideCalendar = () => {
    this.setState({
      slide: this.state.slide == "slide-out" ? "slide-in" : "slide-out"
    });
  };
  slideNotification = () => {
    this.setState({
      notificationPanel:
        this.state.notificationPanel == "slide-out" ? "slide-in" : "slide-out"
    });
  };
  showHideSearch = () => {
    this.setState({
      search: false
    });
  };
  selectDate = e => {
    this.handleDate(e);
    this.setState({
      search: false
    });
  };
  showSearchModal = () => {
    this.setState({
      search: true
    });
  };
  componentWillUnmount() {}
  render() {
    const newDay_ = this.state.fdate;

    const user = this.state.user;
    // console.log("render: ", this.state.theList);
    var completed = this.state.theList.filter(item => item.status == true);
    var pending = this.state.theList.filter(item => item.status == false);
    var inprogress = this.state.theList.filter(item => item.status == null);
    return (
      <div className="container">
        {this.state.userLoaded ? "" : this.getUserId()}
        {this.state.search ? this.searchTask() : ""}
        <div className="row main-content">
          <div className=" taskpanel col-offset-1 col-8">
            <div className="row topbar">
              <span className=" topbar-right-section">
                <img src={logo} className="logo" alt="My todo" />
                <h3>{this.state.user == null ? "" : this.state.user}-todo</h3>
              </span>
              <span className=" topbar-right-section">
                <button className="search" onClick={this.showSearchModal}>
                  <FeatherIcon icon="search" />
                </button>
                <button
                  className="notification"
                  onClick={this.slideNotification}
                >
                  <FeatherIcon icon="bell" />
                </button>
                <button className="calendar" onClick={this.slideCalendar}>
                  <FeatherIcon icon="calendar" />
                </button>
              </span>
            </div>
            <div className="wrapper">
              <TaskPanel
                today={newDay_}
                pushData={this.submitTask}
                user={user}
                tasks={this.state.theList.length}
                completed={completed.length}
                pending={this.state.theList.length - completed.length}
                click={this.slideCalendar}
              />

              <h3>Tasks</h3>
              <div className="scroll-container">
                <div className="task-container">
                  {this.state.loadingData
                    ? this.loadingData()
                    : this.makeCards(pending, "Todo")}
                  {this.state.loadingData
                    ? ""
                    : this.makeCards(inprogress, "Inprogress")}
                  {this.state.loadingData
                    ? ""
                    : this.makeCards(completed, "Completed")}
                </div>
              </div>
            </div>
          </div>
          {this.state.slide == "slide-out" ? (
            ""
          ) : (
            <div className={`col-sm monthly-calendar ${this.state.slide}`}>
              <MonthlyCalendar
                fixDate={this.handleDate}
                slide={this.state.slide}
                click={this.slideCalendar}
              />
            </div>
          )}
          {this.state.notificationPanel == "slide-out" ? (
            ""
          ) : (
            <Notification
              user={user}
              select={this.selectDate}
              slide={this.state.notificationPanel}
              click={this.slideNotification}
            />
          )}
        </div>
      </div>
    );
  }
}
//             <TaskPanel today={newDay_} tasks={taskList} />

export default App;
