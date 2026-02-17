import React from "react";
import {
  Chip,
  Divider,
  Stack,
  Textarea,
  Typography,
  Box,
  styled,
} from "@mui/joy";
import type { IVTTCue } from "@sculptor/helpers/vtt";
import { EditorToolbox } from "./editor-toolbox";

export interface ITextAreaEditableCellProps<Field extends keyof IVTTCue> {
  cue: IVTTCue;
  edit: boolean;
  field: Field;
  onChange: (value: string, field: Field, blur: boolean) => void;
  onDoubleClick: (field: Field) => void;
}
export interface ITextAreaEditableCellState {
  value: string;
  textAreaEl: HTMLTextAreaElement | null;
}

export class TextAreaEditableCell<
  Field extends keyof IVTTCue,
> extends React.PureComponent<
  ITextAreaEditableCellProps<Field>,
  ITextAreaEditableCellState
> {
  editorWrapperEl: HTMLDivElement | null = null;

  constructor(props: ITextAreaEditableCellProps<Field>) {
    super(props);

    this.state = this.getInitialState();
  }

  getInitialState(): ITextAreaEditableCellState {
    return {
      value: this.props.cue[this.props.field]?.toString() ?? "",
      textAreaEl: null,
    };
  }

  get originalFieldValue() {
    return this.props.cue[this.props.field] as string;
  }

  override componentDidUpdate(
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

    if (this.props.edit !== prevProps.edit) {
      if (this.props.edit) {
        window.addEventListener("mousedown", this.handleWindowClick, true);
      } else {
        window.removeEventListener("mousedown", this.handleWindowClick, true);
      }
    }

    if (this.props.edit && this.props.edit !== prevProps.edit) {
      if (this.editorWrapperEl) {
        const textArea = this.editorWrapperEl.querySelector("textarea");
        // TODO: Without this timeout textarea can't get into focus state because
        // something (dnd-kit) triggers the blur event right after this focus
        setTimeout(() => {
          if (textArea) {
            textArea.selectionStart = textArea.value.length;
            textArea?.focus();
          }
        }, 50);
      }
    }
  }

  handleWindowClick = (e: MouseEvent) => {
    if (
      !this.editorWrapperEl?.contains(e.target as Node) &&
      this.editorWrapperEl !== e.currentTarget &&
      !findBlockElement(e.target as Element)
    ) {
      e.preventDefault();
      e.stopPropagation();
      this.setState({
        value: this.originalFieldValue,
      });
      this.props.onChange(this.originalFieldValue, this.props.field, true);
    }
  };

  handleTextAreaChange: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    const newValue = e.currentTarget.value;
    this.setState({
      value: newValue,
    });
  };

  submitAndBlur = () => {
    if (this.state.value !== this.originalFieldValue) {
      this.props.onChange(this.state.value, this.props.field, true);
    }
  };

  handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (event) => {
    event.stopPropagation();
    if (event.ctrlKey && event.key === "Enter") {
      this.submitAndBlur();
    } else if (event.key === "Escape") {
      this.setState({
        value: this.originalFieldValue,
      });
      this.props.onChange(this.originalFieldValue, this.props.field, true);
    }
  };

  handleCueTextDoubleClick = () => {
    this.props.onDoubleClick(this.props.field);
  };

  private setWrapperRef = (el: HTMLDivElement | null) => {
    this.editorWrapperEl = el;

    if (this.editorWrapperEl) {
      this.setState({
        textAreaEl: this.editorWrapperEl.querySelector("textarea"),
      });
    } else {
      this.setState({
        textAreaEl: null,
      });
    }
  };

  renderEdit() {
    return (
      <Box sx={{ position: "relative" }} ref={this.setWrapperRef}>
        <EditorToolbox textAreaEl={this.state.textAreaEl} />
        <Textarea
          sx={{ paddingBottom: "36px" }}
          minRows={3}
          size="sm"
          value={this.state.value}
          onChange={this.handleTextAreaChange}
          onKeyDown={this.handleKeyDown}
        />
      </Box>
    );
  }

  renderCueText() {
    return <div>{this.props.cue[this.props.field]}</div>;
  }

  override render() {
    const { cue } = this.props;
    return (
      <StyledTextTd onDoubleClick={this.handleCueTextDoubleClick}>
        {this.props.edit ? this.renderEdit() : this.renderCueText()}

        {cue.id ? (
          <React.Fragment>
            <Divider sx={{ margin: "5px 0" }} />
            <Stack direction="row" alignItems="center" spacing={1}>
              <Chip color="danger" size="sm" title={cue.id}>
                ID
              </Chip>
              <Typography level="body-xs">{cue.uuid}</Typography>
            </Stack>
          </React.Fragment>
        ) : null}
      </StyledTextTd>
    );
  }
}

const StyledTextTd = styled("td", { name: "TextTd" })(() => {
  return {
    whiteSpace: "pre-line",
  };
});

const BLOCK_ATTRIBUTE = "vtt-sculptor-block";
const findBlockElement = (child: Element) => {
  if (child.hasAttribute(BLOCK_ATTRIBUTE)) {
    return true;
  } else if (child.parentElement) {
    return findBlockElement(child.parentElement);
  } else {
    return false;
  }
};
