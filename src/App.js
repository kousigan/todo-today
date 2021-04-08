import React from "react";
import MonthlyCalendar from "./panel/MonthlyCalendar";
import NotesPanel from "./panel/NotesPanel";
import TaskPanel from "./panel/TaskPanel";
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
      showerror: false
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
  render() {
    const newDay_ = this.state.fdate;

    const user = this.state.user;
    // console.log("render: ", this.state.theList);

    return (
      <div className="container">
        <div className="row">
          <div className="col-sm monthly-calendar ">
            <MonthlyCalendar fixDate={this.handleDate} />
          </div>
          <div className=" taskpanel col-offset-1 col-8">
            <h4> welcome {this.state.user == null ? "" : this.state.user}</h4>
            <TaskPanel today={newDay_} pushData={this.submitTask} user={user} />
            {this.state.userLoaded ? "" : this.getUserId()}
            <h3>Tasks</h3>
            {this.state.loadingData
              ? this.loadingData()
              : this.makeCards(this.state.theList)}
          </div>
        </div>
      </div>
    );
  }
}
//             <TaskPanel today={newDay_} tasks={taskList} />

export default App;

class TaskCard extends React.Component {
  constructor(props) {
    super(props);
  }

  pushUpdate = e => {
    if (e.target.getAttribute("data-key")) {
      var docId = e.target.getAttribute("data-key");
      var userId = e.target.getAttribute("data-user");
      // console.log(docId, userId);
      var taskRef = db.collection("todo-" + userId).doc(docId);
      taskRef.get().then(snapshot => {
        if (!snapshot.data().status) {
          return taskRef.update({ status: true });
        } else {
          return taskRef.update({ status: false });
        }
      });
    }
  };
  render() {
    // console.log(this.props.user);
    return (
      <div
        className="card mytask"
        onClick={this.pushUpdate}
        data-status={this.props.status}
      >
        <div
          className="section"
          data-user={this.props.user}
          data-key={this.props.id}
        >
          <label className="status-icon" /> {this.props.name}{" "}
        </div>
        <div class="section">
          <details>
            <summary>Notes</summary>
            nothing here
          </details>
        </div>
        <div class="controls button-group">
          <button>
            <FeatherIcon icon="edit" />
            Edit
          </button>
          <button>
            <FeatherIcon icon="book" /> Notes
          </button>
          <button>
            <FeatherIcon icon="trash-2" /> Delete
          </button>
        </div>
      </div>
    );
  }
}
