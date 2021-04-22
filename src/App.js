import React from "react";
import MonthlyCalendar from "./panel/MonthlyCalendar";
import NotesPanel from "./panel/NotesPanel";
import TaskPanel from "./panel/TaskPanel";
import TaskCard from "./panel/TaskCard";
import { days, months } from "./panel/names";
import { db } from "./db/config";
import { nanoid } from "nanoid";
import box from "./img/box.svg";
import delivery from "./img/delivery.svg";
import FeatherIcon from "feather-icons-react";
import { sortBy, groupBy } from "underscore";
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
      search: false
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

  makeCards = (data, title) => {
    // console.log("makeCards", data);
    if (data.length > 0) {
      return (
        <React.Fragment>
          <h4>{title}</h4>
          <div className="mytasks card-list">
            {data.map(task => (
              <TaskCard
                key={task.id}
                user={this.state.user}
                id={task.id}
                name={task.name}
                status={task.status}
                task={task}
              />
            ))}
          </div>
        </React.Fragment>
      );
    } else {
      if (title == "Completed") {
        return "";
      } else {
        return (
          <figure>
            <img src={box} alt="Empty list" />
            <figcaption>There are no items for the day.</figcaption>
          </figure>
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
  render() {
    const newDay_ = this.state.fdate;

    const user = this.state.user;
    // console.log("render: ", this.state.theList);
    var completed = this.state.theList.filter(item => item.status == true);
    var pending = this.state.theList.filter(item => item.status == false);
    return (
      <div className="container">
        {this.state.userLoaded ? "" : this.getUserId()}
        {this.state.search ? this.searchTask() : ""}
        <div className="row main-content">
          <div className=" taskpanel col-offset-1 col-8">
            <div className="row topbar">
              <h3>{this.state.user == null ? "" : this.state.user}-todo</h3>
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
                pending={pending.length}
                click={this.slideCalendar}
              />

              <h3>Tasks</h3>
              {this.state.loadingData
                ? this.loadingData()
                : this.makeCards(pending, "Pending")}
              {this.state.loadingData
                ? ""
                : this.makeCards(completed, "Completed")}
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

class Search extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      results: []
    };
  }
  querySearch = e => {
    var query = e.target.value.toLowerCase();
    if (query.length > 2) {
      // console.log("test");
      db.collection("todo-kousi")
        .get()
        .then(snapshot => {
          const temp = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          var sr = temp.filter(li => li.name.toLowerCase().includes(query));
          this.setState({
            results: sr
          });
        });
    }
  };
  checkDuplicate = (arr, item) => {
    var temp = arr.some(li => li.id == item.id);
    return temp;
  };
  hideSearch = () => {
    this.props.hide(false);
  };
  chooseDate = e => {
    this.props.select(e.target);
  };
  render() {
    // console.log("render", this.state.results);
    const { results } = this.state;
    var listItems = results.map((item, i) => (
      <div className="section resultItem" key={i}>
        <button
          data-day={item.date.day}
          data-month={item.date.month}
          data-year={item.date.year}
          data-dayname={item.date.name}
          onClick={this.chooseDate}
        >
          {months[item.date.month]} {item.date.day} {item.date.year}{" "}
          <FeatherIcon icon="arrow-right" />
        </button>{" "}
        {item.name}
      </div>
    ));
    return (
      <div className="overlay-container getModal">
        <div className="card getSearchResults">
          <h3 className="section">Search tasks</h3>
          <div className="section input">
            <input
              type="text"
              id="searchtask"
              placeholder="Enter atleast 4 characters"
              onKeyDown={this.querySearch}
            />
            <button onClick={this.hideSearch}>Hide</button>
          </div>
          {listItems}
        </div>
      </div>
    );
  }
}
