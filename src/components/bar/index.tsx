import React, { Component } from "react";
import { Note } from "../../utils/types";
import lcm from "../../utils/lcm";
import styles from "./bar.less";

interface BarProp {
  materLCM: number;
  lyrics?: Note[];
  chord?: Note[];
  meterPerNote: number;
}
export default class Bar extends Component<BarProp> {
  private noteLength = 16;
  private borderLength = 0.5;
  public renderNote(materLCM: number, notes: Note[]) {
    let totalMeter = 0;
    for (let index = 0; index < notes.length; index++) {
      const currentMeter = totalMeter;
      totalMeter = totalMeter + materLCM / notes[index].meter;
      notes[index].meter = currentMeter;
    }

    const c = Array(materLCM)
      .fill(1)
      .map((x, i) => {
        return { index: i, content: notes.find(x => x.meter === i)?.content };
      });

    return c;
  }

  render() {
    const { lyrics, chord, materLCM, meterPerNote } = this.props;
    const groupCount = materLCM / meterPerNote;

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
          {chrodNotes.map((chrodNote, i) => (
            <div
              className={`${styles["note"]} ${
                styles[`note-${groupCount}-${i % groupCount}`]
              }`}
              style={{ flex: `0 0 ${this.noteLength}px` }}
              key={i}
            >
              <div className={styles["note-text"]}> {chrodNote.content}</div>
            </div>
          ))}
        </div>

        <div className={styles["lyrics-bar"]}>
          {lyricsNotes.map((lyricsNote, i) => (
            <div
              className={`${styles["note"]} ${
                styles[`note-${groupCount}-${i % groupCount}`]
              }`}
              style={{ flex: `0 0 ${this.noteLength}px` }}
              key={i}
            >
              <div className={styles["note-text"]}>
                {i % 2 === 0 &&
                  !!lyricsNotes[i + 1].content ?
                  (lyricsNote.content || '_') : lyricsNote.content}
                
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
}
