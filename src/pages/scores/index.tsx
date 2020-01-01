import React, { Component } from "react";
import file from "../../assets/scores/1.json";
import styles from "./scores.less";
import Bar from "../../components/bar";
import { Note } from "../../utils/types.js";
import lcm from "../../utils/lcm";
import { Switch, Button, Upload, message, Icon } from "antd";
import { saveAs } from "file-saver";

interface ScoreProps {
  match?: any;
}
export interface ScoreStates {
  title: string;
  speed: number;
  notesPerBar: number;
  meterPerNote: number;
  lyrics: Note[];
  chord: Note[];
  editing?: boolean;
  currentEditing: string;
}
export default class Score extends Component<ScoreProps, ScoreStates> {
  public state: ScoreStates = {
    title: "",
    speed: 0,
    notesPerBar: 0,
    meterPerNote: 0,
    lyrics: [],
    chord: [],
    editing: false,
    currentEditing: ""
  };

  loadFile = (data: any) => {
    data.lyrics = data.lyrics.map((x: Note, i: number) => {
      return { ...x, id: i };
    });
    data.chord = data.chord.map((x: Note, i: number) => {
      return { ...x, id: i };
    });
    this.setState({ ...data });
  };

  componentDidMount() {
    this.loadFile(file);
  }

  splitNote(
    notes: Note[],
    materLCM: number,
    notesPerBar: number,
    meterPerNote: number
  ) {
    const totalLengthPerBar = notesPerBar * (materLCM / meterPerNote);

    let currentBar = 0;
    let currentMeter = 0;
    const result: Note[][] = notes.reduce(
      (p: Note[][], t: Note, i: number) => {
        if (currentMeter >= totalLengthPerBar) {
          const overMeter = currentMeter - totalLengthPerBar;
          currentBar = currentBar + 1;
          p.push([]);
          if (overMeter > 0) {
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

  onChangeItem = (id: number,type:string) => {
    this.setState({ currentEditing: `${type}-${id}` });
  };
  setStateFnc = (x: any) => {
    this.setState(x);
  };

  import = () => {};
  export = () => {
    const {
      title,
      speed,
      notesPerBar,
      meterPerNote,
      lyrics,
      chord
    } = this.state;
    const data = {
      title,
      speed,
      notesPerBar,
      meterPerNote,
      lyrics,
      chord
    };

    const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
    saveAs(blob, `${title}.json`);
  };

  render = () => {
    const { lyrics, chord, editing, currentEditing } = this.state;
    if (lyrics.length === 0 && chord.length === 0) {
      return <div />;
    }

    const meterPerNote = file.meterPerNote;

    const lm = lyrics?.map(x => x.meter);
    const cm = chord?.map(x => x.meter);
    const allMeter = [...(lm || []), ...(cm || [])];
    const materLCM = allMeter.reduce((p, t) => {
      const r = lcm(p, t);
      if (r === false) {
        throw new Error("lcm error");
      }
      return r;
    });

    const props = {
      accept: "application/json",
      beforeUpload: (file: any) => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.loadFile(JSON.parse(e.target.result));
          message.success("upload success");
        };
        reader.readAsText(file);

        return false;
      }
    };

    const lyricsBar = this.splitNote(
      lyrics,
      materLCM,
      file.notesPerBar,
      file.meterPerNote
    );
    const chordsBar = this.splitNote(
      chord,
      materLCM,
      file.notesPerBar,
      file.meterPerNote
    );
    const totalLenght = Math.max(lyricsBar.length, chordsBar.length);

    return (
      <div style={{ padding: "10px" }}>
        <div className={styles["title-container"]}>
          <div>
            <h1> {file.title} </h1>
          </div>
          <div>
            <div>Edit</div>
            <Switch
              checked={editing}
              size="small"
              onChange={checked => {
                this.setState({ editing: checked });
              }}
            />{" "}
            <Button size="small" onClick={this.export}>
              Export
            </Button>
            <Upload {...props} showUploadList={false}>
              <Button size="small"><Icon type="upload" />Import</Button>
            </Upload>
          </div>
        </div>
        <div className={styles["divider"]}> </div>

        <div id={styles["score"]}>
          {Array(totalLenght)
            .fill(1)
            .map((x, i) => (
              <Bar
                key={i}
                barId={i}
                rawData={{
                  setState: this.setStateFnc, lyricsData: lyrics,chordData:chord
                }}
                editing={editing || false}
                currentEditing={editing ? currentEditing : ""}
                onChangeItem={this.onChangeItem}
                meterPerNote={meterPerNote}
                materLCM={materLCM}
                lyrics={lyricsBar[i]}
                chord={chordsBar[i]}
              />
            ))}
        </div>
      </div>
    );
  };
}
