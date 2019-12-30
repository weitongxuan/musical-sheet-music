import React, { Component } from "react";
import file from "../../assets/scores/1.json";
import styles from "./scores.less";
import Bar from "../../components/bar";
import { Note } from "../../utils/types.js";
import lcm from "../../utils/lcm";

interface ScoreProps {
  match?: any;
}
export default class Score extends Component<ScoreProps> {
  async componentDidMount() {
    //const resoult = await axios.get('/assets/scores/1.json');
  }

  splitNote(notes: Note[],materLCM:number, notesPerBar: number, meterPerNote: number) {


    const totalLengthPerBar = notesPerBar * (materLCM / meterPerNote);

    let currentBar = 0;
    let currentMeter = 0;
    const result: Note[][] = notes.reduce(
      (p: Note[][], t: Note) => {
        if (currentMeter >= totalLengthPerBar) {
          const overMeter = currentMeter - totalLengthPerBar;
          currentBar = currentBar + 1;
          p.push([]);
          if (overMeter > 0) {
            debugger;
            p[currentBar].push({
              content: "",
              meter: materLCM / overMeter
            });
          }
          currentMeter = overMeter;
        }

        currentMeter = currentMeter + materLCM / t.meter;
        p[currentBar].push(t);

        return p;
      },
      [[]]
    );
    return result;
  }

  render() {
    const lyricsRaw = file.lyrics;
    const chordsRaw = file.chord;
    const meterPerNote = file.meterPerNote;
    
    const lm = lyricsRaw?.map(x => x.meter);
    const cm = chordsRaw?.map(x => x.meter);
    const allMeter = [...(lm || []), ...(cm || [])]
    const materLCM = allMeter.reduce((p, t) => {
      const r = lcm(p, t);
      if (r === false) {
        throw "lcm error";
      }
      return r;
    });



    const lyrics = this.splitNote(
      file.lyrics.map(x => {
        return { meter: x.meter, content: x.lyrics };
      }),
      materLCM,
      file.notesPerBar,
      file.meterPerNote
    );
    const chords = this.splitNote(
      file.chord.map(x => {
        return { meter: x.meter, content: x.chord };
      }),
      materLCM,
      file.notesPerBar,
      file.meterPerNote
    );
    console.log(lyrics);

    const totalLenght = Math.max(chords.length, lyrics.length);
    return (
      <div>
        <h1> {file.title} </h1>
        <div className={styles["divider"]}> </div>
        <div id={styles["score"]}>
          {Array(totalLenght).fill(1).map((x, i) => (
            <Bar meterPerNote={meterPerNote} materLCM={materLCM} lyrics={lyrics[i]} chord={chords[i]} />
          ))}
        </div>
      </div>
    );
  }
}
