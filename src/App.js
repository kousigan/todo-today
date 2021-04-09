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
      showerror: false,
      slide: "slide-out"
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
              <button className="calendarToggle" onClick={this.slideCalendar}>
                <FeatherIcon icon="menu" />
              </button>
              <h4> welcome {this.state.user == null ? "" : this.state.user}</h4>{" "}
            </div>

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
    this.state = {
      showTaskUpdate: false,
      showAddNote: false,
      docId: this.props.id,
      userId: this.props.user,
      updateTask: "",
      addNote: ""
    };
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
  toggleEditTask = e => {
    this.setState({
      showTaskUpdate: this.state.showTaskUpdate == false ? true : false
    });
  };
  toggleAddNotes = e => {
    this.setState({
      showAddNote: this.state.showAddNote == false ? true : false
    });
  };
  updateTask = e => {
    const { docId, userId } = this.state;
    this.setState({
      updateTask: e.target.value
    });

    if (e.key == "Escape") {
      db.collection("todo-" + userId)
        .doc(docId)
        .update({ name: this.state.updateTask })
        .then(() => {
          this.toggleEditTask();
        });
    }
  };
  addANote = e => {
    const { docId, userId } = this.state;
    this.setState({
      addNote: e.target.value
    });

    if (e.key == "Escape") {
      var temp = new Array();
      var taskRef = db.collection("todo-" + userId).doc(docId);
      taskRef
        .update(
          {
            notes: this.state.addNote
          },
          { merge: true }
        )
        .then(() => {
          this.toggleAddNotes();
        });
    }
  };
  requestDelete = e => {
    const { docId, userId } = this.state;

    var temp = confirm("Are you sure?");
    if (temp) {
      db.collection("todo-" + userId)
        .doc(docId)
        .delete()
        .then(() => {
          return console.log("deletion successful!");
        });
    }
  };
  render() {
    // console.log(this.props.user);'
    var notes = this.props.task.notes;
    var notesList = [];
    var listItems;
    if (notes !== null) {
      notesList = notes.split("/-");
      listItems = notesList.map((note, i) => <li key={i}>{note}</li>);
    }
    return (
      <div
        className="card mytask"
        onClick={this.pushUpdate}
        data-status={this.props.status}
      >
        <div
          className="section section"
          data-user={this.props.user}
          data-key={this.props.id}
        >
          <label className="status-icon" /> {this.props.name}{" "}
        </div>
        <div
          className={`section editTask ${
            this.state.showTaskUpdate ? "show" : "hide"
          }`}
        >
          <textarea placeholder="update post" onKeyDown={this.updateTask} />
        </div>
        <div
          className={`section ${
            this.props.task.notes == null ? "hide" : "show"
          }`}
        >
          <details>
            <summary>Notes</summary>
            <ul>{listItems}</ul>
          </details>
        </div>
        <div
          className={`section addNote ${
            this.state.showAddNote ? "show" : "hide"
          }`}
        >
          <textarea
            placeholder="add a note"
            onKeyDown={this.addANote}
            defaultValue={this.props.task.notes}
          />
        </div>

        <div className="controls button-group">
          <button onClick={this.toggleEditTask}>
            <FeatherIcon icon="edit" />
            <span>Edit task</span>
          </button>
          <button onClick={this.toggleAddNotes}>
            <FeatherIcon icon="book" /> <span>Add note</span>
          </button>
          <button onClick={this.requestDelete}>
            <FeatherIcon icon="trash-2" /> <span>Delete task</span>
          </button>
        </div>
      </div>
    );
  }
}
