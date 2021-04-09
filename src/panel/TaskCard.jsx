import React from "react";
import { days, months } from "./names";
import { db } from "../db/config";
import { nanoid } from "nanoid";
import box from "./img/box.svg";
import delivery from "./img/delivery.svg";
import FeatherIcon from "feather-icons-react";
import "../style.css";

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

export default TaskCard;