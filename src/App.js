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
      search: false
    };
  }

  handleDate = e => {
    var temp = {
      name: e.getAttribute("tooltip"),
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
        temp = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        this.makeUpdate(temp);
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
    return <div className="section">nope.. try agin!!</div>;
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

  makeCards = data => {
    // console.log("makeCards", data);
    if (data.length > 0) {
      return (
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
      );
    } else {
      return (
        <figure>
          <img src={box} alt="Empty list" />
          <figcaption>There are no items for the day.</figcaption>
        </figure>
      );
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
  showHideSearch = e => {
    console.log(e.target.value);
  };
  showSearchModal = () => {
    this.setState({
      search: this.state.search == true ? false : true
    });
  };
  render() {
    const newDay_ = this.state.fdate;

    const user = this.state.user;
    // console.log("render: ", this.state.theList);

    return (
      <div className="container">
        <div className="row">
          <div className={`col-sm monthly-calendar ${this.state.slide}`}>
            <MonthlyCalendar
              fixDate={this.handleDate}
              slide={this.state.slide}
            />
          </div>
          <div className=" taskpanel col-offset-1 col-8">
            <div className="row topbar">
              <h4> Welcome {this.state.user == null ? "" : this.state.user}</h4>{" "}
              <h5 onClick={this.slideCalendar}>
                {months[newDay_.month]} {newDay_.day} {newDay_.name}{" "}
                <FeatherIcon icon="calendar" />
              </h5>
              <button className="search" onClick={this.showSearchModal}>
                <FeatherIcon icon="search" />
              </button>
            </div>

            <TaskPanel today={newDay_} pushData={this.submitTask} user={user} />

            <h3>Tasks</h3>
            {this.state.loadingData
              ? this.loadingData()
              : this.makeCards(this.state.theList)}
          </div>
        </div>
        {this.state.userLoaded ? "" : this.getUserId()}
        {this.state.search ? (
          <Search user={this.state.user} click={this.showHideSearch} />
        ) : (
          ""
        )}
      </div>
    );
  }
}
//             <TaskPanel today={newDay_} tasks={taskList} />

export default App;

class Search extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      results: []
    };
  }
  showHide = e => {
    var query = e.target.value;
    if (query.length > 4) {
      console.log("test");
      db.collection("todo-kousi")
        .get()
        .then(snapshot => {
          const temp = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          var sr = temp.filter(li => li.name.includes(query));
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

  render() {
    console.log("render", this.state.results);
    const { results } = this.state;
    var listItems = results.map((item, i) => (
      <div className="section" key={i}>
        <button>
          {months[item.date.month]} {item.date.day} {item.date.year}{" "}
        </button>{" "}
        {item.name}
      </div>
    ));
    return (
      <div className="overlay-container getModal">
        <div className="card getSearchResults">
          <div className="section input">
            <input
              type="text"
              id="searchtask"
              placeholder="Enter atleast 4 characters"
              onKeyDown={this.showHide}
            />
            <button>Hide</button>
          </div>
          {listItems}
        </div>
      </div>
    );
  }
}
