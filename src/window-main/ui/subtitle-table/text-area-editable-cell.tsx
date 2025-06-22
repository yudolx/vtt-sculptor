import React from "react";
import { Divider, Textarea, Typography, styled } from "@mui/joy";
import { IVTTCue } from "shared/libs/vtt/vttcue";

export interface ITextAreaEditableCellProps<Field extends keyof IVTTCue> {
  cue: IVTTCue;
  edit: boolean;
  field: Field;
  onFocus: (field: Field) => void;
  onBlur: (field: Field) => void;
  onChange: (value: string, field: Field) => void;
  onDoubleClick: (field: Field) => void;
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

  handleTextAreaChange: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    const newValue = e.currentTarget.value;
    this.setState({
      value: newValue,
    });
  };

  handleTextAreaFocus = () => {
    this.props.onFocus(this.props.field);
  };

  handleTextAreaBlur = () => {
    if (this.state.value !== this.props.cue[this.props.field]) {
      this.props.onChange(this.state.value, this.props.field);
    }
    this.props.onBlur(this.props.field);
  };

  handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (event) => {
    event.stopPropagation();
    if (event.ctrlKey && event.key === "Enter") {
      this.handleTextAreaBlur();
    } else if (event.key === "Escape") {
      this.setState({
        value: this.props.cue.text,
      });
      this.props.onBlur(this.props.field);
    }
  };

  handleCueTextDoubleClick = () => {
    this.props.onDoubleClick(this.props.field);
  };

  renderEdit() {
    return (
      <Textarea
        minRows={3}
        size="sm"
        ref={(el) => {
          this.textAreaRef = el;
        }}
        value={this.state.value}
        onFocus={this.handleTextAreaFocus}
        onBlur={this.handleTextAreaBlur}
        onChange={this.handleTextAreaChange}
        onKeyDown={this.handleKeyDown}
      />
    );
  }

  renderCueText() {
    return <div>{this.props.cue[this.props.field]}</div>;
  }

  render() {
    return (
      <StyledTextTd onDoubleClick={this.handleCueTextDoubleClick}>
        {this.props.edit ? this.renderEdit() : this.renderCueText()}
        <div>
          <Typography level="body-xs">{this.props.cue.uuid}</Typography>
        </div>
      </StyledTextTd>
    );
  }
}

const StyledTextTd = styled("td", { name: "TextTd" })(() => {
  return {
    whiteSpace: "pre-line",
  };
});
