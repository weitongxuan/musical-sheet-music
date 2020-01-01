import React, { Component } from "react";
import { Icon, Input, Button } from "antd";
import { Note } from "../../utils/types";
import styles from "./pop-menu.less";
interface PopMenuProps {
  editId?: number;
  rawData: { setState: (x: any) => void; data: Note[] };
}
export default class PopMenu extends Component<PopMenuProps> {
  changeContext = (str: React.ChangeEvent<HTMLInputElement>) => {
    const { editId } = this.props;
    const { setState } = this.props.rawData;
    const notes = [...this.props.rawData.data];
    const editItem = notes.find(x => x.id === editId);
    if (!!editItem) {
      editItem.content = str.currentTarget.value;
    } else {
      throw new Error("edit item not found");
    }
    setState(notes);
  };

  changeMeter = (isPlus: boolean) => {
    const { editId } = this.props;
    const { setState } = this.props.rawData;
    const newLyrics = [...this.props.rawData.data];
    const allLength = [1, 2, 4, 8, 16, 32];
    const editItem = newLyrics.find(x => x.id === editId);
    if (!!editItem) {
      if (isPlus) {
        const nextIndex = Math.max(0, allLength.indexOf(editItem.meter) - 1);

        editItem.meter = allLength[nextIndex];
      } else {
        const nextIndex = Math.min(5, allLength.indexOf(editItem.meter) + 1);
        editItem.meter = allLength[nextIndex];
      }
    } else {
      throw new Error("edit item not found");
    }

    setState(newLyrics);
  };

    deleteNote = () => {
        const { editId } = this.props;
        const { setState } = this.props.rawData;
        const notes = [...this.props.rawData.data];
        const index = notes.findIndex(x => x.id === editId);
        notes.splice(index,1)
  };

  render() {
    const { editId, rawData } = this.props;
    const data = rawData.data.find(x => x.id === editId);
    return (
      <div id={styles["pop-menu"]}>
        <div className={styles["line-block"]}>
          <span className={styles["elem"]}>context:</span>
          <span className={styles["elem"]}>
            <Input
              size="small"
              value={data?.content}
              placeholder="empty"
              onChange={this.changeContext}
            />
          </span>
        </div>
        <div className={styles["line-block"]}>
          <div className={styles["elem"]}>
            <Icon
              type="minus-circle"
              theme="twoTone"
              onClick={e => this.changeMeter(false)}
            />
          </div>
          <div className={styles["elem"]}> meter: {data?.meter}</div>
          <div className={styles["elem"]}>
            <Icon
              type="plus-circle"
              theme="twoTone"
              onClick={e => this.changeMeter(true)}
            />
          </div>
        </div>

        <div className={styles["line-block"]}>
          <Button type="danger" size="small">
          <Icon type="delete" />Delete
          </Button>
        </div>
      </div>
    );
  }
}
