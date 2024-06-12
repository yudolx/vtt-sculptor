import React from "react";
import { Textarea, styled } from "@mui/joy";
import { IVTTCue } from "shared/libs/vtt/vttcue";

export interface ITextAreaEditableCellProps<Field extends keyof IVTTCue> {
  cue: IVTTCue;
  edit: boolean;
  field: Field;
  onMouseDown: (field: Field) => void;
  onBlur: (field: Field) => void;
  onChange: (value: string, field: Field) => void;
}
export interface ITextAreaEditableCellState {
  value: string;
}

export class TextAreaEditableCell<
  Field extends keyof IVTTCue,
> extends React.Component<
  ITextAreaEditableCellProps<Field>,
  ITextAreaEditableCellState
> {
  textAreaRef: HTMLDivElement | null = null;

  constructor(props: ITextAreaEditableCellProps<Field>) {
    super(props);

    this.state = this.getInitialState();
  }

  getInitialState(): ITextAreaEditableCellState {
    return {
      value: this.props.cue[this.props.field]?.toString() ?? "",
    };
  }

  componentDidUpdate(
    prevProps: Readonly<ITextAreaEditableCellProps<Field>>,
    prevState: Readonly<ITextAreaEditableCellState>,
    snapshot?: any,
  ): void {
    if (
      this.props.cue !== prevProps.cue ||
      this.props.field !== this.props.field
    ) {
      this.setState({
        value: this.getInitialState().value,
      });
    }

    if (this.props.edit && this.props.edit !== prevProps.edit) {
      if (this.textAreaRef) {
        const textArea = this.textAreaRef.querySelector("textarea");
        // TODO: Without this timeout textarea can't get into focus state because something triggers
        // the blur event right after this focus
        setTimeout(() => {
          if (textArea) {
            textArea.focus();
            textArea.selectionStart = textArea.value.length;
          }
        });
      }
    }
  }

  handleMouseDown = () => {
    if (!this.props.edit) {
      this.props.onMouseDown(this.props.field);
    }
  };

  handleTextAreaChange: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    const newValue = e.currentTarget.value;
    this.setState({
      value: newValue,
    });
  };

  handleTextAreaBlur = () => {
    if (this.state.value !== this.props.cue[this.props.field]) {
      this.props.onChange(this.state.value, this.props.field);
    }
    this.props.onBlur(this.props.field);
  };

  handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (event) => {
    if (event.ctrlKey && event.key === "Enter") {
      this.handleTextAreaBlur();
    }
  };

  renderEdit() {
    return (
      <Textarea
        minRows={3}
        ref={(el) => {
          this.textAreaRef = el;
        }}
        value={this.state.value}
        onBlur={this.handleTextAreaBlur}
        onChange={this.handleTextAreaChange}
        onKeyDown={this.handleKeyDown}
      />
    );
  }

  render() {
    return (
      <StyledTextTd onMouseDown={this.handleMouseDown}>
        {this.props.edit ? this.renderEdit() : this.props.cue[this.props.field]}
      </StyledTextTd>
    );
  }
}

const StyledTextTd = styled("td", { name: "TextTd" })(() => {
  return {
    whiteSpace: "pre-line",
  };
});
