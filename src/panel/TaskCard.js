import React from "react";
import { db } from "../db/config";
import FeatherIcon from "feather-icons-react";
import "../style.css";
import "./TaskCard.css";

class TaskCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showTaskUpdate: false,
      showAddNote: false,
      docId: this.props.id,
      userId: this.props.user,
      updateTask: "",
      addNote: "",
      showTaskOptions: false,
      chooseStateOptions: false,
      editMode: false
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
      showTaskUpdate: this.state.showTaskUpdate == false ? true : false,
      editMode: this.state.editMode == false ? true : false
    });
    this.showOptions();
  };
  toggleAddNotes = e => {
    this.setState({
      showAddNote: this.state.showAddNote == false ? true : false,
      editMode: this.state.editMode == false ? true : false
    });
  };
  updateTarget = e => {
    const { docId, userId } = this.state;
    if (e.key == "Enter") {
      var taskRef = db.collection("todo-" + userId).doc(docId);
      var field = e.target.getAttribute("data-field");
      console.log(field);
      if (field == "notes") {
        this.setState(
          {
            addNote: e.target.value
          },
          () => {
            var temp;
            e.target.value.length <= 2
              ? (temp = null)
              : (temp = this.state.addNote);
            taskRef
              .update(
                {
                  notes: temp
                },
                { merge: true }
              )
              .then(() => {
                this.toggleAddNotes();
              });
          }
        );
      }
      if (field == "name" && e.target.value.length > 2) {
        this.setState(
          {
            updateTask: e.target.value
          },
          () => {
            taskRef.update({ name: this.state.updateTask }).then(() => {
              this.toggleEditTask();
            });
          }
        );
      }
    }
    if (e.key == "Escape") {
      var field = e.target.getAttribute("data-field");
      if (field == "notes") {
        this.toggleAddNotes();
      }
      if (field == "name") {
        this.toggleEditTask();
      }
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
  hideAll = e => {
    this.setState({
      chooseStateOptions: false,
      showTaskOptions: false
    });
  };
  changeStateOptions = e => {
    this.setState({
      chooseStateOptions: this.state.chooseStateOptions == false ? true : false,
      showTaskOptions: false
    });
  };
  showOptions = e => {
    this.setState({
      showTaskOptions: this.state.showTaskOptions == false ? true : false,
      chooseStateOptions: false
    });
  };
  handleStateChange = e => {
    let temp = e.target.getAttribute("data-state");
    if (e) {
      console.log("updating state to", temp);
    }
    const { docId, userId } = this.state;
    var taskRef = db.collection("todo-" + userId).doc(docId);
    taskRef.get().then(snapshot => {
      if (temp == "todo") {
        return taskRef.update({ status: false });
      }
      if (temp == "inprogress") {
        return taskRef.update({ status: null });
      }
      if (temp == "completed") {
        return taskRef.update({ status: true });
      }
    });
  };
  dragStart = e => {
    this.props.dragStart(e);
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
        onDragStart={this.dragStart}
        draggable="true"
        className={`card mytask ${
          this.state.editMode == true ? "edit-mode" : ""
        }`}
        data-status={this.props.status}
        id={this.props.id}
      >
        <div
          onClick={this.hideAll}
          className="section"
          data-user={this.props.user}
          data-key={this.props.id}
        >
          <div className="card-controls">
            {/* <button className="status-indicator">
              {" "}
              <FeatherIcon icon="check" />
            </button> */}
            {/* <select onChange={this.handleStateChange}>
              <option value="nochange" defaultValue>
                Choose state
              </option>
              <option value="pending">Todo</option>
              <option value="undefined">In progress</option>
              <option value="completed">Completed</option>
            </select> */}
            <button className="task-options" onClick={this.changeStateOptions}>
              {"Choose state "}
              <FeatherIcon icon="chevron-down" />
            </button>
            <div
              className={`more-controls left ${
                this.state.chooseStateOptions == true ? "show" : ""
              }`}
            >
              <button onClick={this.handleStateChange} data-state="todo">
                Todo
              </button>
              <button onClick={this.handleStateChange} data-state="inprogress">
                In progress
              </button>
              <button onClick={this.handleStateChange} data-state="completed">
                Completed
              </button>
            </div>
            <button className="task-options" onClick={this.showOptions}>
              {" "}
              <FeatherIcon icon="more-horizontal" />
            </button>
            <div
              className={`more-controls right ${
                this.state.showTaskOptions == true ? "show" : ""
              }`}
            >
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
          <div onClick={this.hideAll}>{this.props.name} </div>
        </div>
        <div
          className={`section editTask ${
            this.state.showTaskUpdate ? "show" : "hide"
          }`}
        >
          <textarea
            data-field="name"
            placeholder="update post"
            onKeyDown={this.updateTarget}
            defaultValue={this.props.name}
            autoFocus
          />
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
            data-field="notes"
            placeholder="add a note"
            onKeyDown={this.updateTarget}
            defaultValue={this.props.task.notes}
            autoFocus
          />
        </div>

        {/* <div className="controls button-group">
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
        </div> */}
      </div>
    );
  }
}

export default TaskCard;
