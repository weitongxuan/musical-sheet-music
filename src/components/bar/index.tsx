import React, { Component } from "react";
import { Note } from "../../utils/types";
import styles from "./bar.less";
import { Popover, Tooltip } from "antd";
import PopMenu from "../pop-menu";

interface BarProp {
  barId: number;
  materLCM: number;
  lyrics?: Note[];
  chord?: Note[];
  meterPerNote: number;
  onChangeItem?: (id: number, type: string) => void;
  currentEditing?: string;
  editing: boolean;
  rawData: {
    setState: (x: any) => void;
    chordData: Note[];
    lyricsData: Note[];
  };
}
interface BarState {
  currentPop: string;
}
export default class Bar extends Component<BarProp, BarState> {
  private noteLength = 16;
  private borderLength = 0.5;

  public state = { currentPop: "" };
  public renderNote(materLCM: number, notes: Note[]) {
    const newNotes: Note[] = [];
    let totalMeter = 0;
    for (let index = 0; index < notes.length; index++) {
      const currentMeter = totalMeter;
      totalMeter = totalMeter + materLCM / notes[index].meter;
      newNotes.push({
        meter: currentMeter,
        content: notes[index].content,
        id: notes[index].id
      });
    }

    const c = Array(materLCM)
      .fill(1)
      .map((x, i) => {
        return {
          index: i,
          content: newNotes.find(x => x.meter === i)?.content,
          id: newNotes.find(x => x.meter === i)?.id
        };
      });

    return c;
  }

  calc = (target: number, array: number[]) => {
    for (let index = 0; index < array.length - 1; index++)
      if (array[index] <= array[index + 1]) throw new Error("Array not sorted");

    const result = [];
    let left = target;
    for (let index = 0; index < array.length; index++) {
      if (array[index] <= left) {
        result.push(index);
        left -= array[index];
      }
    }
    if (left !== 0) {
      throw new Error(`fail at: ${target} ${array}`);
    }
    return result;
  };

  addNote = (
    i: number,
    rawData: {
      setState: (x: any) => void;
      data: Note[];
    },
    setState: (x: any) => void,
    type:string
  ) => {
    const { barId, materLCM } = this.props;
    const targetPos = barId * materLCM + i;

    let maxId = Math.max(...rawData.data.map(x => x.id || -1)) + 1;

    let nextPos = 0;
    let prePos = 0;
    let preIndex = -1;

    let newNoteId = -1;
    for (let index = 0; index < rawData.data.length; index++) {
      const element = rawData.data[index];
      prePos = nextPos;
      preIndex = index;
      nextPos += materLCM / element.meter;
      if (nextPos > targetPos) {
        break;
      }
    }
    const allLength = [32, 16, 8, 4, 2, 1];
    debugger;
    const overPos = targetPos - prePos;

    const newLyrics = [...rawData.data];

    const lhs = this.calc(overPos, allLength);

    const rhsLength = materLCM / rawData.data[preIndex].meter - overPos;
    const rhs = this.calc(
      rhsLength > 0 ? rhsLength : allLength[0],
      allLength
    ).reverse();

    lhs.forEach((x, i) => {
      if (i === 0) {
        rawData.data[preIndex++].meter = materLCM / allLength[x];
      } else {
        const newNote = {
          content: "",
          meter: materLCM / allLength[x],
          id: maxId++
        };
        newLyrics.splice(preIndex++, 0, newNote);
      }
    });

    rhs.forEach((x, i) => {
      const newNote = {
        content: "",
        meter: materLCM / allLength[x],
        id: maxId++
      };
      if (i === 0) {
        newNote.content = "x";
        newNoteId = newNote.id;
      }

      newLyrics.splice(preIndex++, 0, newNote);
    });
    setState(newLyrics);
    this.props.rawData.setState({ currentEditing: `${type}-${newNoteId}` });
  };

  renderBar(
    notes: any[],
    type: string,
    rawData: {
      setState: (x: any) => void;
      data: Note[];
    }
  ) {
    const { currentPop } = this.state;
    const {
      materLCM,
      meterPerNote,
      onChangeItem,
      currentEditing,
      editing
    } = this.props;
    const groupCount = materLCM / meterPerNote;
    return (
      <>
        {notes.map((note, i) => (
          <div
            className={`${styles["note"]} ${
              styles[`note-${groupCount}-${i % groupCount}`]
            }`}
            style={{ width: `${this.noteLength}px`}}
            key={i}
          >
            <Popover
              style={{ width: 500 }}
              content={<PopMenu rawData={rawData} editId={note.id}></PopMenu>}
              trigger="hover"
              visible={currentEditing === `${type}-${note.id}`}
              onVisibleChange={v => {
                if (v) {
                  onChangeItem &&
                    onChangeItem(note.id === undefined ? -1 : note.id, type);
                } else {
                  onChangeItem && onChangeItem(-1, "");
                }
              }}
            >
              <Tooltip
                onVisibleChange={v => {
                  if (v) {
                    this.setState({ currentPop: `${type}-${i}` });
                  } else {
                    this.setState({ currentPop: "" });
                  }
                }}
                visible={editing && isNaN(note.id)  && currentPop === `${type}-${i}`}
                title="Click to add note"
              >
                <div
                  className={`${styles["note-text"]} ${editing &&
                    styles["edit-hover"]}`}
                  onClick={e => {
                    isNaN(note.id) && this.addNote(i, rawData, rawData.setState,type);
                  }}
                >
                  {i % 2 === 0 && !!notes[i + 1].content
                    ? note.content || "_"
                    : note.content}
                </div>
              </Tooltip>
            </Popover>
          </div>
        ))}{" "}
      </>
    );
  }

  render() {
    const {
      lyrics,
      chord,
      materLCM,
      rawData
    } = this.props;

    const lyricsNotes = this.renderNote(materLCM, lyrics || []);
    const chrodNotes = this.renderNote(materLCM, chord || []);

    return (
      <div
        id={styles["bar"]}
        style={{
          width: `${materLCM * (this.noteLength + this.borderLength)}px`
        }}
      >
        <div className={styles["chord-bar"]}>
          {this.renderBar(chrodNotes, "chord", {
            setState: (newNotes: Note[]) => {
              rawData.setState({ chord: newNotes });
            },
            data: rawData.chordData
          })}
        
        </div>

        <div className={styles["lyrics-bar"]}>
          {this.renderBar(lyricsNotes, "lyrics", {
            setState: (newNotes: Note[]) => {
              rawData.setState({ lyrics: newNotes });
            },
            data: rawData.lyricsData
          })}
        </div>
      </div>
    );
  }
}
